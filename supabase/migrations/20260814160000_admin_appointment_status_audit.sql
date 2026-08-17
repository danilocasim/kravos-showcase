-- Phase 5 records who changed an appointment lifecycle state and gives admins
-- one narrow, atomic CONFIRMED -> COMPLETED transition.
alter table public.appointments
  add column status_changed_at timestamptz,
  add column status_changed_by uuid references public.profiles(id) on delete set null;

update public.appointments
set status_changed_at = coalesce(completed_at, cancelled_at, updated_at, created_at);

alter table public.appointments
  alter column status_changed_at set default now(),
  alter column status_changed_at set not null;

comment on column public.appointments.status_changed_at is
  'Authoritative timestamp of the most recent appointment status transition.';
comment on column public.appointments.status_changed_by is
  'Verified auth actor responsible for the most recent status transition; null only for legacy/system rows.';

-- Appointment rows are lifecycle-managed only through guarded RPCs. An admin
-- session may read all rows, but cannot bypass the state machine through direct
-- PostgREST insert/update/delete calls.
drop policy if exists appointments_insert_admin on public.appointments;
drop policy if exists appointments_update_admin on public.appointments;
drop policy if exists appointments_delete_admin on public.appointments;

create function private.audit_appointment_status_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    new.status_changed_at := now();
    new.status_changed_by := auth.uid();
  end if;
  return new;
end;
$$;

revoke all on function private.audit_appointment_status_transition() from public;

create trigger appointments_audit_status_transition
before insert or update of status on public.appointments
for each row execute function private.audit_appointment_status_transition();

create function public.complete_confirmed_appointment_as_admin(
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
  cancelled_at timestamptz,
  completed_at timestamptz,
  status_changed_at timestamptz,
  status_changed_by uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  existing_appointment public.appointments%rowtype;
begin
  if actor_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = 'P0001';
  end if;

  select profile.role into actor_role
  from public.profiles profile
  where profile.id = actor_id;

  if actor_role is distinct from 'ADMIN'::public.app_role then
    raise exception 'ADMIN_REQUIRED' using errcode = 'P0001';
  end if;

  select appointment.* into existing_appointment
  from public.appointments appointment
  where appointment.id = requested_appointment_id
  for update;

  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
  end if;

  if existing_appointment.status <> 'CONFIRMED'::public.appointment_status then
    raise exception 'APPOINTMENT_NOT_CHANGEABLE' using errcode = 'P0001';
  end if;

  return query
  update public.appointments appointment
  set
    status = 'COMPLETED',
    completed_at = now(),
    updated_at = now()
  where appointment.id = requested_appointment_id
  returning
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
    appointment.cancelled_at,
    appointment.completed_at,
    appointment.status_changed_at,
    appointment.status_changed_by;
end;
$$;

revoke all on function public.complete_confirmed_appointment_as_admin(uuid) from public;
grant execute on function public.complete_confirmed_appointment_as_admin(uuid) to authenticated;
