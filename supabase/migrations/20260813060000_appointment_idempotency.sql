-- Idempotency is enforced inside the same transaction as each appointment
-- mutation. Keys are opaque, nonblank values from the trusted client/API boundary.
-- A completed key is retained as an immutable response snapshot for 24 hours;
-- expired keys are rejected (not reused) so a delayed retry cannot become new work.

alter table public.idempotency_records
  add column response_body jsonb;

comment on table public.idempotency_records is
  'Appointment mutation idempotency responses. Retain completed records for their 24-hour retry window; expired keys are rejected, never reused.';
comment on column public.idempotency_records.idempotency_key is
  'An opaque nonblank idempotency key supplied once per appointment mutation.';
comment on column public.idempotency_records.response_body is
  'Immutable successful appointment response used to replay a duplicate request.';

create function private.begin_appointment_idempotency(
  target_actor_id uuid,
  target_operation text,
  target_idempotency_key text,
  target_fingerprint text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_record public.idempotency_records%rowtype;
begin
  if target_idempotency_key is null
    or char_length(target_idempotency_key) not between 1 and 255
    or btrim(target_idempotency_key) = ''
  then
    raise exception 'INVALID_IDEMPOTENCY_KEY' using errcode = 'P0001';
  end if;

  -- Serialize same-key calls even before a record exists. Hash collisions only
  -- serialize unrelated calls; they cannot return an unrelated response.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      target_actor_id::text || ':' || target_operation || ':' || target_idempotency_key,
      0
    )
  );

  select * into existing_record
  from public.idempotency_records record
  where record.actor_id = target_actor_id
    and record.operation = target_operation
    and record.idempotency_key = target_idempotency_key
  for update;

  if found then
    if existing_record.expires_at <= now() then
      raise exception 'IDEMPOTENCY_KEY_EXPIRED' using errcode = 'P0001';
    end if;
    if existing_record.request_fingerprint <> target_fingerprint then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = 'P0001';
    end if;
    if existing_record.response_status is null
      or existing_record.response_body is null
    then
      raise exception 'IDEMPOTENCY_RECORD_INCOMPLETE' using errcode = 'P0001';
    end if;

    return existing_record.response_body;
  end if;

  insert into public.idempotency_records (
    actor_id,
    operation,
    idempotency_key,
    request_fingerprint
  )
  values (
    target_actor_id,
    target_operation,
    target_idempotency_key,
    target_fingerprint
  );

  return null;
end;
$$;

create function private.complete_appointment_idempotency(
  target_actor_id uuid,
  target_operation text,
  target_idempotency_key text,
  target_appointment_id uuid,
  successful_response jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.idempotency_records record
  set
    appointment_id = target_appointment_id,
    response_status = 200,
    response_body = successful_response
  where record.actor_id = target_actor_id
    and record.operation = target_operation
    and record.idempotency_key = target_idempotency_key
    and record.response_status is null;

  if not found then
    raise exception 'IDEMPOTENCY_RECORD_INCOMPLETE' using errcode = 'P0001';
  end if;
end;
$$;

create function private.appointment_response(
  target_appointment_id uuid
)
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_build_object(
    'id', appointment.id,
    'customer_id', appointment.customer_id,
    'pet_id', appointment.pet_id,
    'groomer_id', appointment.groomer_id,
    'status', appointment.status,
    'starts_at', appointment.starts_at,
    'service_ends_at', appointment.service_ends_at,
    'blocked_until', appointment.blocked_until,
    'subtotal_cents', appointment.subtotal_cents,
    'applied_buffer_minutes', appointment.applied_buffer_minutes,
    'cancelled_at', appointment.cancelled_at
  )
  from public.appointments appointment
  where appointment.id = target_appointment_id;
$$;

create function private.appointment_response_row(
  appointment_response jsonb
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
language sql
security definer
set search_path = ''
stable
as $$
  select
    (appointment_response ->> 'id')::uuid,
    (appointment_response ->> 'customer_id')::uuid,
    (appointment_response ->> 'pet_id')::uuid,
    (appointment_response ->> 'groomer_id')::uuid,
    (appointment_response ->> 'status')::public.appointment_status,
    (appointment_response ->> 'starts_at')::timestamptz,
    (appointment_response ->> 'service_ends_at')::timestamptz,
    (appointment_response ->> 'blocked_until')::timestamptz,
    (appointment_response ->> 'subtotal_cents')::integer,
    (appointment_response ->> 'applied_buffer_minutes')::smallint,
    (appointment_response ->> 'cancelled_at')::timestamptz;
$$;

revoke all on function private.begin_appointment_idempotency(uuid, text, text, text) from public;
revoke all on function private.complete_appointment_idempotency(uuid, text, text, uuid, jsonb) from public;
revoke all on function private.appointment_response(uuid) from public;
revoke all on function private.appointment_response_row(jsonb) from public;

-- Remove the unkeyed callable variants. Their transaction semantics are
-- superseded by the key-required functions below, and authenticated clients
-- must not retain a bypass around idempotency enforcement.
drop function public.create_confirmed_appointment(uuid, uuid, timestamptz, uuid[]);
drop function public.reschedule_confirmed_appointment(uuid, uuid, timestamptz, uuid[]);
drop function public.cancel_confirmed_appointment(uuid);

create function public.create_confirmed_appointment(
  requested_pet_id uuid,
  requested_groomer_id uuid,
  requested_starts_at timestamptz,
  requested_service_ids uuid[],
  requested_idempotency_key text
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
  replay_response jsonb;
  response_body jsonb;
  request_fingerprint text;
begin
  if actor_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = 'P0001';
  end if;

  -- Hold a row-share lock through replay so a concurrent admin ownership
  -- transfer cannot invalidate this current-actor authorization mid-call.
  perform 1
  from public.pets pet
  where pet.id = requested_pet_id
    and pet.owner_id = actor_id
  for share;

  if not found then
    raise exception 'PET_NOT_FOUND' using errcode = 'P0001';
  end if;

  select encode(
    public.digest(
      concat_ws(
        '|',
        'CREATE_APPOINTMENT',
        requested_pet_id::text,
        requested_groomer_id::text,
        extract(epoch from requested_starts_at)::bigint::text,
        array_to_string(
          array(
            select service_id::text
            from unnest(requested_service_ids) service_id
            order by service_id
          ),
          ','
        )
      ),
      'sha256'
    ),
    'hex'
  ) into request_fingerprint;

  replay_response := private.begin_appointment_idempotency(
    actor_id,
    'CREATE_APPOINTMENT',
    requested_idempotency_key,
    request_fingerprint
  );
  if replay_response is not null then
    return query select * from private.appointment_response_row(replay_response);
    return;
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
  exception when exclusion_violation or deadlock_detected then
    -- A concurrent exclusion-constraint race can surface as a deadlock on
    -- PostgreSQL. Either outcome means this caller must choose a fresh slot.
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

  response_body := private.appointment_response(appointment_id);
  perform private.complete_appointment_idempotency(
    actor_id,
    'CREATE_APPOINTMENT',
    requested_idempotency_key,
    appointment_id,
    response_body
  );
  return query select * from private.appointment_response_row(response_body);
end;
$$;

create function public.reschedule_confirmed_appointment(
  requested_appointment_id uuid,
  requested_groomer_id uuid,
  requested_starts_at timestamptz,
  requested_service_ids uuid[],
  requested_idempotency_key text
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
  replay_response jsonb;
  response_body jsonb;
  request_fingerprint text;
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

  select encode(
    public.digest(
      concat_ws(
        '|',
        'RESCHEDULE_APPOINTMENT',
        requested_appointment_id::text,
        requested_groomer_id::text,
        extract(epoch from requested_starts_at)::bigint::text,
        array_to_string(
          array(
            select service_id::text
            from unnest(requested_service_ids) service_id
            order by service_id
          ),
          ','
        )
      ),
      'sha256'
    ),
    'hex'
  ) into request_fingerprint;

  replay_response := private.begin_appointment_idempotency(
    actor_id,
    'RESCHEDULE_APPOINTMENT',
    requested_idempotency_key,
    request_fingerprint
  );
  if replay_response is not null then
    return query select * from private.appointment_response_row(replay_response);
    return;
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
  exception when exclusion_violation or deadlock_detected then
    -- A concurrent exclusion-constraint race can surface as a deadlock on
    -- PostgreSQL. Either outcome means this caller must choose a fresh slot.
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

  response_body := private.appointment_response(requested_appointment_id);
  perform private.complete_appointment_idempotency(
    actor_id,
    'RESCHEDULE_APPOINTMENT',
    requested_idempotency_key,
    requested_appointment_id,
    response_body
  );
  return query select * from private.appointment_response_row(response_body);
end;
$$;

create function public.cancel_confirmed_appointment(
  requested_appointment_id uuid,
  requested_idempotency_key text
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
  replay_response jsonb;
  response_body jsonb;
  request_fingerprint text;
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

  select encode(
    public.digest(
      concat_ws('|', 'CANCEL_APPOINTMENT', requested_appointment_id::text),
      'sha256'
    ),
    'hex'
  ) into request_fingerprint;

  replay_response := private.begin_appointment_idempotency(
    actor_id,
    'CANCEL_APPOINTMENT',
    requested_idempotency_key,
    request_fingerprint
  );
  if replay_response is not null then
    return query select * from private.appointment_response_row(replay_response);
    return;
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

  response_body := private.appointment_response(requested_appointment_id);
  perform private.complete_appointment_idempotency(
    actor_id,
    'CANCEL_APPOINTMENT',
    requested_idempotency_key,
    requested_appointment_id,
    response_body
  );
  return query select * from private.appointment_response_row(response_body);
end;
$$;

revoke all on function public.create_confirmed_appointment(uuid, uuid, timestamptz, uuid[], text) from public;
revoke all on function public.reschedule_confirmed_appointment(uuid, uuid, timestamptz, uuid[], text) from public;
revoke all on function public.cancel_confirmed_appointment(uuid, text) from public;
grant execute on function public.create_confirmed_appointment(uuid, uuid, timestamptz, uuid[], text) to authenticated;
grant execute on function public.reschedule_confirmed_appointment(uuid, uuid, timestamptz, uuid[], text) to authenticated;
grant execute on function public.cancel_confirmed_appointment(uuid, text) to authenticated;
