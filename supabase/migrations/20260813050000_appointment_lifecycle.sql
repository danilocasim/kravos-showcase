-- Atomic appointment lifecycle operations. All customer identity derives from
-- auth.uid(); the browser never receives direct appointment-write access.

create function private.resolve_confirmed_appointment_details(
  target_groomer_id uuid,
  requested_starts_at timestamptz,
  requested_service_ids uuid[],
  excluded_appointment_id uuid default null
)
returns table (
  calculated_service_ends_at timestamptz,
  calculated_blocked_until timestamptz,
  calculated_subtotal_cents integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_count integer;
  active_selected_count integer;
  base_service_count integer;
  selected_base_service_id uuid;
  total_duration_minutes integer;
  local_start timestamp;
  local_blocked_until timestamp;
begin
  if requested_starts_at is null
    or requested_service_ids is null
    or coalesce(cardinality(requested_service_ids), 0) = 0
    or cardinality(requested_service_ids) > 6
    or (select count(distinct service_id) from unnest(requested_service_ids) service_id)
      <> cardinality(requested_service_ids)
    or date_part('second', requested_starts_at at time zone 'America/New_York') <> 0
    or date_part('minute', requested_starts_at at time zone 'America/New_York')::integer % 15 <> 0
  then
    raise exception 'INVALID_APPOINTMENT_INPUT' using errcode = 'P0001';
  end if;

  select count(*) into selected_count
  from unnest(requested_service_ids) service_id;

  -- Lock persisted service rows so an admin catalogue edit cannot produce
  -- unsnapshotted data between validation and the appointment snapshot write.
  perform 1
  from public.services service
  where service.id = any(requested_service_ids)
  for share;

  select count(*) into active_selected_count
  from public.services service
  where service.id = any(requested_service_ids)
    and service.is_active;

  if active_selected_count <> selected_count then
    raise exception 'INVALID_APPOINTMENT_INPUT' using errcode = 'P0001';
  end if;

  select count(*) into base_service_count
  from public.services service
  where service.id = any(requested_service_ids)
    and service.kind = 'BASE';

  select service.id into selected_base_service_id
  from public.services service
  where service.id = any(requested_service_ids)
    and service.kind = 'BASE'
  limit 1;

  if base_service_count = 0 then
    if selected_count <> 1
      or not exists (
        select 1
        from public.services service
        where service.id = requested_service_ids[1]
          and service.kind = 'ADD_ON'
          and service.is_active
          and service.is_standalone_eligible
      )
    then
      raise exception 'INVALID_APPOINTMENT_INPUT' using errcode = 'P0001';
    end if;
  elsif base_service_count <> 1 then
    raise exception 'INVALID_APPOINTMENT_INPUT' using errcode = 'P0001';
  elsif exists (
    select 1
    from public.services selected_service
    where selected_service.id = any(requested_service_ids)
      and selected_service.kind = 'ADD_ON'
      and not exists (
        select 1
        from public.service_compatibility compatibility
        where compatibility.base_service_id = selected_base_service_id
          and compatibility.add_on_service_id = selected_service.id
      )
  ) then
    raise exception 'INVALID_APPOINTMENT_INPUT' using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.groomers groomer
    where groomer.id = target_groomer_id
      and groomer.is_active
  ) or exists (
    select 1
    from public.services selected_service
    where selected_service.id = any(requested_service_ids)
      and not exists (
        select 1
        from public.groomer_services qualification
        where qualification.groomer_id = target_groomer_id
          and qualification.service_id = selected_service.id
      )
  ) then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
  end if;

  select
    sum(service.duration_minutes)::integer,
    sum(service.price_cents)::integer
  into total_duration_minutes, calculated_subtotal_cents
  from public.services service
  where service.id = any(requested_service_ids);

  calculated_service_ends_at := requested_starts_at
    + make_interval(mins => total_duration_minutes);
  calculated_blocked_until := calculated_service_ends_at + interval '15 minutes';
  local_start := requested_starts_at at time zone 'America/New_York';
  local_blocked_until := calculated_blocked_until at time zone 'America/New_York';

  if not exists (
    select 1
    from public.groomer_working_hours working_hours
    where working_hours.groomer_id = target_groomer_id
      and working_hours.iso_day_of_week = extract(isodow from local_start)::smallint
      and local_start::time >= working_hours.starts_at
      and local_blocked_until::date = local_start::date
      and local_blocked_until::time <= working_hours.ends_at
  ) or exists (
    select 1
    from public.groomer_time_off time_off
    where time_off.groomer_id = target_groomer_id
      and tstzrange(requested_starts_at, calculated_blocked_until, '[)')
        && tstzrange(time_off.starts_at, time_off.ends_at, '[)')
  ) or exists (
    select 1
    from public.appointments appointment
    where appointment.groomer_id = target_groomer_id
      and appointment.status = 'CONFIRMED'
      and (excluded_appointment_id is null or appointment.id <> excluded_appointment_id)
      and tstzrange(requested_starts_at, calculated_blocked_until, '[)')
        && tstzrange(appointment.starts_at, appointment.blocked_until, '[)')
  ) then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
  end if;

  return next;
end;
$$;

revoke all on function private.resolve_confirmed_appointment_details(
  uuid,
  timestamptz,
  uuid[],
  uuid
) from public;

create function public.create_confirmed_appointment(
  requested_pet_id uuid,
  requested_groomer_id uuid,
  requested_starts_at timestamptz,
  requested_service_ids uuid[]
)
returns table (
  id uuid,
  customer_id uuid,
  pet_id uuid,
  groomer_id uuid,
  status public.appointment_status,
  starts_at timestamptz,
  service_ends_at timestamptz,
  blocked_until timestamptz,
  subtotal_cents integer,
  applied_buffer_minutes smallint,
  cancelled_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  details record;
  appointment_id uuid;
begin
  if actor_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.pets pet
    where pet.id = requested_pet_id
      and pet.owner_id = actor_id
  ) then
    raise exception 'PET_NOT_FOUND' using errcode = 'P0001';
  end if;

  select * into details
  from private.resolve_confirmed_appointment_details(
    requested_groomer_id,
    requested_starts_at,
    requested_service_ids,
    null
  );

  begin
    insert into public.appointments (
      customer_id,
      pet_id,
      groomer_id,
      status,
      starts_at,
      service_ends_at,
      blocked_until,
      subtotal_cents,
      applied_buffer_minutes
    )
    values (
      actor_id,
      requested_pet_id,
      requested_groomer_id,
      'CONFIRMED',
      requested_starts_at,
      details.calculated_service_ends_at,
      details.calculated_blocked_until,
      details.calculated_subtotal_cents,
      15
    )
    returning appointments.id into appointment_id;
  exception when exclusion_violation then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
  end;

  insert into public.appointment_services (
    appointment_id,
    service_id,
    service_name,
    service_kind,
    duration_minutes,
    price_cents
  )
  select
    appointment_id,
    service.id,
    service.name,
    service.kind,
    service.duration_minutes,
    service.price_cents
  from public.services service
  where service.id = any(requested_service_ids);

  return query
  select
    appointment.id,
    appointment.customer_id,
    appointment.pet_id,
    appointment.groomer_id,
    appointment.status,
    appointment.starts_at,
    appointment.service_ends_at,
    appointment.blocked_until,
    appointment.subtotal_cents,
    appointment.applied_buffer_minutes,
    appointment.cancelled_at
  from public.appointments appointment
  where appointment.id = appointment_id;
end;
$$;

create function public.reschedule_confirmed_appointment(
  requested_appointment_id uuid,
  requested_groomer_id uuid,
  requested_starts_at timestamptz,
  requested_service_ids uuid[]
)
returns table (
  id uuid,
  customer_id uuid,
  pet_id uuid,
  groomer_id uuid,
  status public.appointment_status,
  starts_at timestamptz,
  service_ends_at timestamptz,
  blocked_until timestamptz,
  subtotal_cents integer,
  applied_buffer_minutes smallint,
  cancelled_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  existing_appointment public.appointments%rowtype;
  details record;
begin
  if actor_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = 'P0001';
  end if;

  select * into existing_appointment
  from public.appointments appointment
  where appointment.id = requested_appointment_id
  for update;

  if not found or existing_appointment.customer_id <> actor_id then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if existing_appointment.status <> 'CONFIRMED' then
    raise exception 'APPOINTMENT_NOT_CHANGEABLE' using errcode = 'P0001';
  end if;
  if existing_appointment.starts_at <= now() + interval '24 hours' then
    raise exception 'CANCELLATION_CUTOFF_PASSED' using errcode = 'P0001';
  end if;

  select * into details
  from private.resolve_confirmed_appointment_details(
    requested_groomer_id,
    requested_starts_at,
    requested_service_ids,
    requested_appointment_id
  );

  begin
    update public.appointments appointment
    set
      groomer_id = requested_groomer_id,
      starts_at = requested_starts_at,
      service_ends_at = details.calculated_service_ends_at,
      blocked_until = details.calculated_blocked_until,
      subtotal_cents = details.calculated_subtotal_cents,
      applied_buffer_minutes = 15
    where appointment.id = requested_appointment_id;
  exception when exclusion_violation then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
  end;

  delete from public.appointment_services snapshot
  where snapshot.appointment_id = requested_appointment_id;

  insert into public.appointment_services (
    appointment_id,
    service_id,
    service_name,
    service_kind,
    duration_minutes,
    price_cents
  )
  select
    requested_appointment_id,
    service.id,
    service.name,
    service.kind,
    service.duration_minutes,
    service.price_cents
  from public.services service
  where service.id = any(requested_service_ids);

  return query
  select
    appointment.id,
    appointment.customer_id,
    appointment.pet_id,
    appointment.groomer_id,
    appointment.status,
    appointment.starts_at,
    appointment.service_ends_at,
    appointment.blocked_until,
    appointment.subtotal_cents,
    appointment.applied_buffer_minutes,
    appointment.cancelled_at
  from public.appointments appointment
  where appointment.id = requested_appointment_id;
end;
$$;

create function public.cancel_confirmed_appointment(
  requested_appointment_id uuid
)
returns table (
  id uuid,
  customer_id uuid,
  pet_id uuid,
  groomer_id uuid,
  status public.appointment_status,
  starts_at timestamptz,
  service_ends_at timestamptz,
  blocked_until timestamptz,
  subtotal_cents integer,
  applied_buffer_minutes smallint,
  cancelled_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_role public.app_role;
  existing_appointment public.appointments%rowtype;
begin
  if actor_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = 'P0001';
  end if;

  select profile.role into actor_role
  from public.profiles profile
  where profile.id = actor_id;

  if actor_role is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = 'P0001';
  end if;

  select * into existing_appointment
  from public.appointments appointment
  where appointment.id = requested_appointment_id
  for update;

  if not found
    or (existing_appointment.customer_id <> actor_id and actor_role <> 'ADMIN')
  then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if existing_appointment.status <> 'CONFIRMED' then
    raise exception 'APPOINTMENT_NOT_CHANGEABLE' using errcode = 'P0001';
  end if;
  if actor_role <> 'ADMIN'
    and existing_appointment.starts_at <= now() + interval '24 hours'
  then
    raise exception 'CANCELLATION_CUTOFF_PASSED' using errcode = 'P0001';
  end if;

  update public.appointments appointment
  set status = 'CANCELLED', cancelled_at = now()
  where appointment.id = requested_appointment_id;

  return query
  select
    appointment.id,
    appointment.customer_id,
    appointment.pet_id,
    appointment.groomer_id,
    appointment.status,
    appointment.starts_at,
    appointment.service_ends_at,
    appointment.blocked_until,
    appointment.subtotal_cents,
    appointment.applied_buffer_minutes,
    appointment.cancelled_at
  from public.appointments appointment
  where appointment.id = requested_appointment_id;
end;
$$;

revoke all on function public.create_confirmed_appointment(uuid, uuid, timestamptz, uuid[]) from public;
revoke all on function public.reschedule_confirmed_appointment(uuid, uuid, timestamptz, uuid[]) from public;
revoke all on function public.cancel_confirmed_appointment(uuid) from public;
grant execute on function public.create_confirmed_appointment(uuid, uuid, timestamptz, uuid[]) to authenticated;
grant execute on function public.reschedule_confirmed_appointment(uuid, uuid, timestamptz, uuid[]) to authenticated;
grant execute on function public.cancel_confirmed_appointment(uuid) to authenticated;
