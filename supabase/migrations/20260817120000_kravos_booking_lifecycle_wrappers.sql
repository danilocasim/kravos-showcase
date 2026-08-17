-- Kravos runs with the trusted service role, but its lifecycle requests are
-- still performed as the selected customer. Delegating preserves the existing
-- validation, conflict, cutoff, snapshot, audit, and idempotency semantics.

create or replace function public.kravos_create_confirmed_appointment(
  trusted_actor_id uuid,
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
  previous_claim_sub text := current_setting('request.jwt.claim.sub', true);
begin
  if not exists (
    select 1
    from public.profiles profile
    where profile.id = trusted_actor_id
      and profile.role = 'CUSTOMER'
  ) then
    raise exception 'CUSTOMER_NOT_FOUND' using errcode = 'P0001';
  end if;

  -- auth.uid() reads this setting. true scopes the identity to the current
  -- transaction, and restoring the prior local value limits it to this call.
  perform set_config('request.jwt.claim.sub', trusted_actor_id::text, true);
  return query
  select *
  from public.create_confirmed_appointment(
    requested_pet_id,
    requested_groomer_id,
    requested_starts_at,
    requested_service_ids,
    requested_idempotency_key
  );
  perform set_config('request.jwt.claim.sub', coalesce(previous_claim_sub, ''), true);
end;
$$;

create or replace function public.kravos_reschedule_confirmed_appointment(
  trusted_actor_id uuid,
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
  previous_claim_sub text := current_setting('request.jwt.claim.sub', true);
begin
  if not exists (
    select 1
    from public.profiles profile
    where profile.id = trusted_actor_id
      and profile.role = 'CUSTOMER'
  ) then
    raise exception 'CUSTOMER_NOT_FOUND' using errcode = 'P0001';
  end if;

  perform set_config('request.jwt.claim.sub', trusted_actor_id::text, true);
  return query
  select *
  from public.reschedule_confirmed_appointment(
    requested_appointment_id,
    requested_groomer_id,
    requested_starts_at,
    requested_service_ids,
    requested_idempotency_key
  );
  perform set_config('request.jwt.claim.sub', coalesce(previous_claim_sub, ''), true);
end;
$$;

create or replace function public.kravos_cancel_confirmed_appointment(
  trusted_actor_id uuid,
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
  previous_claim_sub text := current_setting('request.jwt.claim.sub', true);
begin
  if not exists (
    select 1
    from public.profiles profile
    where profile.id = trusted_actor_id
      and profile.role = 'CUSTOMER'
  ) then
    raise exception 'CUSTOMER_NOT_FOUND' using errcode = 'P0001';
  end if;

  perform set_config('request.jwt.claim.sub', trusted_actor_id::text, true);
  return query
  select *
  from public.cancel_confirmed_appointment(
    requested_appointment_id,
    requested_idempotency_key
  );
  perform set_config('request.jwt.claim.sub', coalesce(previous_claim_sub, ''), true);
end;
$$;

revoke all on function public.kravos_create_confirmed_appointment(uuid, uuid, uuid, timestamptz, uuid[], text) from public;
revoke all on function public.kravos_create_confirmed_appointment(uuid, uuid, uuid, timestamptz, uuid[], text) from anon;
revoke all on function public.kravos_create_confirmed_appointment(uuid, uuid, uuid, timestamptz, uuid[], text) from authenticated;
grant execute on function public.kravos_create_confirmed_appointment(uuid, uuid, uuid, timestamptz, uuid[], text) to service_role;

revoke all on function public.kravos_reschedule_confirmed_appointment(uuid, uuid, uuid, timestamptz, uuid[], text) from public;
revoke all on function public.kravos_reschedule_confirmed_appointment(uuid, uuid, uuid, timestamptz, uuid[], text) from anon;
revoke all on function public.kravos_reschedule_confirmed_appointment(uuid, uuid, uuid, timestamptz, uuid[], text) from authenticated;
grant execute on function public.kravos_reschedule_confirmed_appointment(uuid, uuid, uuid, timestamptz, uuid[], text) to service_role;

revoke all on function public.kravos_cancel_confirmed_appointment(uuid, uuid, text) from public;
revoke all on function public.kravos_cancel_confirmed_appointment(uuid, uuid, text) from anon;
revoke all on function public.kravos_cancel_confirmed_appointment(uuid, uuid, text) from authenticated;
grant execute on function public.kravos_cancel_confirmed_appointment(uuid, uuid, text) to service_role;

-- Customer resolution is a privileged service-role query. Other booking tables
-- already retain their Supabase service-role grants; profiles is intentionally
-- granted here rather than exposed to anonymous callers.
grant select on table public.profiles to service_role;
