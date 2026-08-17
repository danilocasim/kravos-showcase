\set ON_ERROR_STOP on

begin;

create function pg_temp.assert_kravos_true(actual boolean, assertion_message text)
returns void
language plpgsql
as $$
begin
  if actual is not true then
    raise exception '%', assertion_message;
  end if;
end;
$$;

create function pg_temp.assert_kravos_equals(
  actual_value text,
  expected_value text,
  assertion_message text
)
returns void
language plpgsql
as $$
begin
  if actual_value is distinct from expected_value then
    raise exception '% (expected %, got %)', assertion_message, expected_value, actual_value;
  end if;
end;
$$;

create function pg_temp.assert_kravos_raises(
  statement text,
  expected_sqlstate text,
  expected_message text,
  assertion_message text
)
returns void
language plpgsql
as $$
begin
  begin
    execute statement;
  exception when others then
    if sqlstate <> expected_sqlstate or sqlerrm <> expected_message then
      raise exception '% (expected %/%, got %/%)',
        assertion_message,
        expected_sqlstate,
        expected_message,
        sqlstate,
        sqlerrm;
    end if;
    return;
  end;

  raise exception '% (expected %/%, but no error was raised)',
    assertion_message,
    expected_sqlstate,
    expected_message;
end;
$$;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-4000-8000-000000003901', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kravos-customer@example.test', 'x', now(), '{}', '{"display_name":"Kravos Customer"}', now(), now()),
  ('00000000-0000-4000-8000-000000003902', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kravos-admin@example.test', 'x', now(), '{}', '{"display_name":"Kravos Admin"}', now(), now());

update public.profiles
set role = 'ADMIN'
where id = '00000000-0000-4000-8000-000000003902';

insert into public.pets (id, owner_id, name, breed, size, age_years)
values (
  '00000000-0000-4000-8000-000000003911',
  '00000000-0000-4000-8000-000000003901',
  'Kravos Pup',
  'Retriever',
  'LARGE',
  4
);

create temporary table task9_slots (
  starts_at timestamptz not null,
  rescheduled_at timestamptz not null
) on commit drop;

-- Maya works Monday 09:00–18:00 in America/New_York. Keep the slots safely
-- outside the customer lifecycle cutoff regardless of when this test runs.
insert into task9_slots (starts_at, rescheduled_at)
select monday_at_nine, monday_at_nine + interval '2 hours'
from (
  select (
    (
      date_trunc('week', now() at time zone 'America/New_York')::date + 14
      + time '09:00'
    ) at time zone 'America/New_York'
  ) as monday_at_nine
) slots;

grant select on task9_slots to service_role;

-- The wrappers are not a PostgREST/browser surface. They must be hardened
-- SECURITY DEFINER entry points callable only by the server service role.
select pg_temp.assert_kravos_true(
  not has_function_privilege('anon', 'public.kravos_create_confirmed_appointment(uuid,uuid,uuid,timestamptz,uuid[],text)'::regprocedure, 'EXECUTE')
  and not has_function_privilege('authenticated', 'public.kravos_create_confirmed_appointment(uuid,uuid,uuid,timestamptz,uuid[],text)'::regprocedure, 'EXECUTE')
  and has_function_privilege('service_role', 'public.kravos_create_confirmed_appointment(uuid,uuid,uuid,timestamptz,uuid[],text)'::regprocedure, 'EXECUTE'),
  'Expected only service_role to execute the Kravos create wrapper'
);
select pg_temp.assert_kravos_true(
  not has_function_privilege('anon', 'public.kravos_reschedule_confirmed_appointment(uuid,uuid,uuid,timestamptz,uuid[],text)'::regprocedure, 'EXECUTE')
  and not has_function_privilege('authenticated', 'public.kravos_reschedule_confirmed_appointment(uuid,uuid,uuid,timestamptz,uuid[],text)'::regprocedure, 'EXECUTE')
  and has_function_privilege('service_role', 'public.kravos_reschedule_confirmed_appointment(uuid,uuid,uuid,timestamptz,uuid[],text)'::regprocedure, 'EXECUTE'),
  'Expected only service_role to execute the Kravos reschedule wrapper'
);
select pg_temp.assert_kravos_true(
  not has_function_privilege('anon', 'public.kravos_cancel_confirmed_appointment(uuid,uuid,text)'::regprocedure, 'EXECUTE')
  and not has_function_privilege('authenticated', 'public.kravos_cancel_confirmed_appointment(uuid,uuid,text)'::regprocedure, 'EXECUTE')
  and has_function_privilege('service_role', 'public.kravos_cancel_confirmed_appointment(uuid,uuid,text)'::regprocedure, 'EXECUTE'),
  'Expected only service_role to execute the Kravos cancel wrapper'
);
select pg_temp.assert_kravos_true(
  (
    select bool_and(prosecdef and 'search_path=""' = any(coalesce(proconfig, '{}'::text[])))
    from pg_proc
    where oid in (
      'public.kravos_create_confirmed_appointment(uuid,uuid,uuid,timestamptz,uuid[],text)'::regprocedure,
      'public.kravos_reschedule_confirmed_appointment(uuid,uuid,uuid,timestamptz,uuid[],text)'::regprocedure,
      'public.kravos_cancel_confirmed_appointment(uuid,uuid,text)'::regprocedure
    )
  ),
  'Expected hardened SECURITY DEFINER Kravos wrappers with an empty search path'
);
select pg_temp.assert_kravos_true(
  exists (
    select 1
    from pg_class relation
    cross join lateral aclexplode(coalesce(relation.relacl, acldefault('r', relation.relowner))) privilege
    join pg_roles grantee on grantee.oid = privilege.grantee
    where relation.oid = 'public.profiles'::regclass
      and grantee.rolname = 'service_role'
      and privilege.privilege_type = 'SELECT'
  ),
  'Expected an explicit service_role profiles SELECT grant for customer resolution'
);

set local role service_role;

-- This is the auth.uid() mechanism the wrappers rely on. The wrappers must set
-- this setting transaction-locally only after validating the target profile.
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000003901', true);
select pg_temp.assert_kravos_equals(
  auth.uid()::text,
  '00000000-0000-4000-8000-000000003901',
  'Expected transaction-local request.jwt.claim.sub to drive auth.uid()'
);
select set_config('request.jwt.claim.sub', '', true);

select pg_temp.assert_kravos_raises(
  $$select * from public.kravos_create_confirmed_appointment('00000000-0000-4000-8000-000000003999', '00000000-0000-4000-8000-000000003911', '20000000-0000-0000-0000-000000000001', now() + interval '14 days', array['10000000-0000-0000-0000-000000000001']::uuid[], 'task9-missing-customer')$$,
  'P0001',
  'CUSTOMER_NOT_FOUND',
  'Expected a missing Kravos customer target to be rejected'
);
select pg_temp.assert_kravos_raises(
  $$select * from public.kravos_create_confirmed_appointment('00000000-0000-4000-8000-000000003902', '00000000-0000-4000-8000-000000003911', '20000000-0000-0000-0000-000000000001', now() + interval '14 days', array['10000000-0000-0000-0000-000000000001']::uuid[], 'task9-admin-target')$$,
  'P0001',
  'CUSTOMER_NOT_FOUND',
  'Expected a non-customer Kravos target to be rejected'
);

select pg_temp.assert_kravos_true(
  (select count(*) from public.kravos_create_confirmed_appointment(
    '00000000-0000-4000-8000-000000003901',
    '00000000-0000-4000-8000-000000003911',
    '20000000-0000-0000-0000-000000000001',
    (select starts_at from task9_slots),
    array['10000000-0000-0000-0000-000000000001']::uuid[],
    'task9-create'
  )) = 1,
  'Expected the Kravos create wrapper to delegate a customer booking'
);
select pg_temp.assert_kravos_true(
  (
    select customer_id = '00000000-0000-4000-8000-000000003901'
      and status = 'CONFIRMED'
      and status_changed_by = '00000000-0000-4000-8000-000000003901'
      and blocked_until = starts_at + interval '75 minutes'
    from public.appointments
    where customer_id = '00000000-0000-4000-8000-000000003901'
  )
  and (
    select count(*) = 1
    from public.appointment_services snapshot
    join public.appointments appointment on appointment.id = snapshot.appointment_id
    where appointment.customer_id = '00000000-0000-4000-8000-000000003901'
      and snapshot.service_name = 'Bath & Brush'
      and snapshot.duration_minutes = 60
      and snapshot.price_cents = 5500
  ),
  'Expected delegated create snapshots and audit attribution to the target customer'
);

select pg_temp.assert_kravos_equals(
  (
    select id::text from public.kravos_create_confirmed_appointment(
      '00000000-0000-4000-8000-000000003901',
      '00000000-0000-4000-8000-000000003911',
      '20000000-0000-0000-0000-000000000001',
      (select starts_at from task9_slots),
      array['10000000-0000-0000-0000-000000000001']::uuid[],
      'task9-create'
    )
  ),
  (
    select id::text from public.appointments
    where customer_id = '00000000-0000-4000-8000-000000003901'
  ),
  'Expected an exact Kravos create retry to return the original appointment'
);
select pg_temp.assert_kravos_true(
  (select count(*) = 1 from public.appointments where customer_id = '00000000-0000-4000-8000-000000003901'),
  'Expected an exact Kravos create retry not to duplicate an appointment'
);

select pg_temp.assert_kravos_true(
  (select count(*) from public.kravos_reschedule_confirmed_appointment(
    '00000000-0000-4000-8000-000000003901',
    (select id from public.appointments where customer_id = '00000000-0000-4000-8000-000000003901'),
    '20000000-0000-0000-0000-000000000001',
    (select rescheduled_at from task9_slots),
    array['10000000-0000-0000-0000-000000000001']::uuid[],
    'task9-reschedule'
  )) = 1,
  'Expected the Kravos reschedule wrapper to delegate customer lifecycle rules'
);
select pg_temp.assert_kravos_equals(
  (
    select starts_at::text from public.appointments
    where customer_id = '00000000-0000-4000-8000-000000003901'
  ),
  (select rescheduled_at::text from task9_slots),
  'Expected the Kravos reschedule wrapper to preserve delegated timing'
);

select pg_temp.assert_kravos_true(
  (select count(*) from public.kravos_cancel_confirmed_appointment(
    '00000000-0000-4000-8000-000000003901',
    (select id from public.appointments where customer_id = '00000000-0000-4000-8000-000000003901'),
    'task9-cancel'
  )) = 1,
  'Expected the Kravos cancel wrapper to delegate customer lifecycle rules'
);
select pg_temp.assert_kravos_true(
  (
    select status = 'CANCELLED'
      and cancelled_at is not null
      and status_changed_by = '00000000-0000-4000-8000-000000003901'
    from public.appointments
    where customer_id = '00000000-0000-4000-8000-000000003901'
  )
  and (select count(*) = 1 from public.appointments where customer_id = '00000000-0000-4000-8000-000000003901'),
  'Expected Kravos cancellation to retain and audit the appointment rather than delete it'
);

-- The wrapper must not elevate a target customer above the existing 24-hour
-- cancellation policy. Seed only the time-sensitive fixture as service_role.
insert into public.appointments (
  id, customer_id, pet_id, groomer_id, status, starts_at, service_ends_at,
  blocked_until, subtotal_cents, applied_buffer_minutes
) values (
  '00000000-0000-4000-8000-000000003921',
  '00000000-0000-4000-8000-000000003901',
  '00000000-0000-4000-8000-000000003911',
  '20000000-0000-0000-0000-000000000002',
  'CONFIRMED',
  now() + interval '23 hours',
  now() + interval '24 hours',
  now() + interval '24 hours 15 minutes',
  5500,
  15
);
select pg_temp.assert_kravos_raises(
  $$select * from public.kravos_cancel_confirmed_appointment('00000000-0000-4000-8000-000000003901', '00000000-0000-4000-8000-000000003921', 'task9-customer-cutoff')$$,
  'P0001',
  'CANCELLATION_CUTOFF_PASSED',
  'Expected Kravos customer cancellation to retain the existing cutoff'
);

reset role;
rollback;
