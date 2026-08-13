-- Paw & Polish Phase 1 authorization policies.
-- RLS is enabled on every application table. Direct client access is deliberately
-- narrow: customer-owned pets and appointment reads, public booking catalogue
-- reads, and admin operations. Booking lifecycle mutations remain server-only
-- until their transactional use cases are introduced in Task 7.

create schema if not exists private;
revoke all on schema private from public;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.role = 'ADMIN'
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

-- Enable RLS everywhere in the application schema. Supabase's service role and
-- migration owner are trusted server-side contexts; the browser client uses the
-- authenticated role and is constrained by the policies below.
alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.services enable row level security;
alter table public.service_compatibility enable row level security;
alter table public.groomers enable row level security;
alter table public.groomer_services enable row level security;
alter table public.groomer_working_hours enable row level security;
alter table public.groomer_time_off enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_services enable row level security;
alter table public.idempotency_records enable row level security;

-- Profiles are private identity/role records. Users may inspect their own name
-- and role; admins may inspect all profiles. Profile creation is owned by the
-- server-side signup trigger that Task 4 will introduce.
create policy profiles_select_self_or_admin
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id or (select private.is_admin()));

-- Profile writes are server-controlled. This avoids a direct client path for role
-- escalation; Task 4 will create profiles during signup with trusted server-side
-- code, and later admin management will use dedicated guarded operations.

create policy profiles_delete_admin
on public.profiles
for delete
to authenticated
using ((select private.is_admin()));

-- Customers own their pet records. Admins can support all customer records.
create policy pets_select_owner_or_admin
on public.pets
for select
to authenticated
using (owner_id = (select auth.uid()) or (select private.is_admin()));

create policy pets_insert_owner_or_admin
on public.pets
for insert
to authenticated
with check (owner_id = (select auth.uid()) or (select private.is_admin()));

create policy pets_update_owner_or_admin
on public.pets
for update
to authenticated
using (owner_id = (select auth.uid()) or (select private.is_admin()))
with check (owner_id = (select auth.uid()) or (select private.is_admin()));

create policy pets_delete_owner_or_admin
on public.pets
for delete
to authenticated
using (owner_id = (select auth.uid()) or (select private.is_admin()));

-- The active booking catalogue is readable by authenticated users. Admins own
-- catalogue writes. Inactive historical data remains admin-only.
create policy services_select_active_or_admin
on public.services
for select
to authenticated
using (is_active or (select private.is_admin()));

create policy services_insert_admin
on public.services
for insert
to authenticated
with check ((select private.is_admin()));

create policy services_update_admin
on public.services
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy services_delete_admin
on public.services
for delete
to authenticated
using ((select private.is_admin()));

create policy service_compatibility_select_active_or_admin
on public.service_compatibility
for select
to authenticated
using (
  (select base_service.is_active from public.services base_service where base_service.id = base_service_id)
  and (select add_on_service.is_active from public.services add_on_service where add_on_service.id = add_on_service_id)
  or (select private.is_admin())
);

create policy service_compatibility_insert_admin
on public.service_compatibility
for insert
to authenticated
with check ((select private.is_admin()));

create policy service_compatibility_update_admin
on public.service_compatibility
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy service_compatibility_delete_admin
on public.service_compatibility
for delete
to authenticated
using ((select private.is_admin()));

-- Groomer availability inputs are readable only when their groomer is active;
-- schedule changes are admin-only.
create policy groomers_select_active_or_admin
on public.groomers
for select
to authenticated
using (is_active or (select private.is_admin()));

create policy groomers_insert_admin
on public.groomers
for insert
to authenticated
with check ((select private.is_admin()));

create policy groomers_update_admin
on public.groomers
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy groomers_delete_admin
on public.groomers
for delete
to authenticated
using ((select private.is_admin()));

create policy groomer_services_select_active_or_admin
on public.groomer_services
for select
to authenticated
using (
  (
    select groomer.is_active
    from public.groomers groomer
    where groomer.id = groomer_id
  )
  and (
    select service.is_active
    from public.services service
    where service.id = service_id
  )
  or (select private.is_admin())
);

create policy groomer_services_insert_admin
on public.groomer_services
for insert
to authenticated
with check ((select private.is_admin()));

create policy groomer_services_update_admin
on public.groomer_services
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy groomer_services_delete_admin
on public.groomer_services
for delete
to authenticated
using ((select private.is_admin()));

create policy groomer_working_hours_select_active_or_admin
on public.groomer_working_hours
for select
to authenticated
using (
  (
    select groomer.is_active
    from public.groomers groomer
    where groomer.id = groomer_id
  )
  or (select private.is_admin())
);

create policy groomer_working_hours_insert_admin
on public.groomer_working_hours
for insert
to authenticated
with check ((select private.is_admin()));

create policy groomer_working_hours_update_admin
on public.groomer_working_hours
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy groomer_working_hours_delete_admin
on public.groomer_working_hours
for delete
to authenticated
using ((select private.is_admin()));

-- Time-off records influence availability. Authenticated customers need read-only
-- access to active-groomer blackouts so availability can be calculated through
-- the public booking API; schedule changes remain admin-only.
create policy groomer_time_off_select_active_groomer_or_admin
on public.groomer_time_off
for select
to authenticated
using (
  (
    select groomer.is_active
    from public.groomers groomer
    where groomer.id = groomer_id
  )
  or (select private.is_admin())
);

create policy groomer_time_off_insert_admin
on public.groomer_time_off
for insert
to authenticated
with check ((select private.is_admin()));

create policy groomer_time_off_update_admin
on public.groomer_time_off
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy groomer_time_off_delete_admin
on public.groomer_time_off
for delete
to authenticated
using ((select private.is_admin()));

-- Customers can read only their own appointments and their selected-service
-- snapshots. Direct appointment writes are withheld until Task 7 provides
-- transactional, idempotent booking functions; admins can manage appointments.
create policy appointments_select_customer_or_admin
on public.appointments
for select
to authenticated
using (customer_id = (select auth.uid()) or (select private.is_admin()));

create policy appointments_insert_admin
on public.appointments
for insert
to authenticated
with check ((select private.is_admin()));

create policy appointments_update_admin
on public.appointments
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy appointments_delete_admin
on public.appointments
for delete
to authenticated
using ((select private.is_admin()));

create policy appointment_services_select_customer_or_admin
on public.appointment_services
for select
to authenticated
using (
  exists (
    select 1
    from public.appointments appointment
    where appointment.id = appointment_id
      and (
        appointment.customer_id = (select auth.uid())
        or (select private.is_admin())
      )
  )
);

create policy appointment_services_insert_admin
on public.appointment_services
for insert
to authenticated
with check ((select private.is_admin()));

create policy appointment_services_update_admin
on public.appointment_services
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy appointment_services_delete_admin
on public.appointment_services
for delete
to authenticated
using ((select private.is_admin()));

-- Idempotency records can reveal request fingerprints and must never be exposed
-- through the client data API. Only server-side booking operations will use them.
-- Intentionally no policies for authenticated users.

-- Explicit grants make the intended PostgREST surface clear. RLS still decides
-- which rows/actions actually succeed.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
