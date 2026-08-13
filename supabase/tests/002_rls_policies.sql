\set ON_ERROR_STOP on

begin;

-- These assertions run as the real Supabase `authenticated` database role while
-- swapping request.jwt.claim.sub, which is how PostgREST supplies auth.uid().
-- Each fixture uses fixed UUIDs and the whole test transaction rolls back.

do $$
begin
  if not exists (
    select 1
    from pg_roles
    where rolname = 'authenticated'
  ) then
    raise exception 'Missing Supabase authenticated database role';
  end if;
end;
$$;

create function pg_temp.assert_task3_equals(
  actual_value bigint,
  expected_value bigint,
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

create function pg_temp.assert_task3_text_equals(
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

create function pg_temp.assert_task3_row_count(
  statement text,
  expected_count integer,
  assertion_message text
)
returns void
language plpgsql
as $$
declare
  affected_count integer;
begin
  execute statement;
  get diagnostics affected_count = row_count;

  if affected_count <> expected_count then
    raise exception '% (expected % affected rows, got %)',
      assertion_message,
      expected_count,
      affected_count;
  end if;
end;
$$;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'task3-customer-one@pawandpolish.example',
    'not-a-real-password',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'task3-customer-two@pawandpolish.example',
    'not-a-real-password',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'task3-admin@pawandpolish.example',
    'not-a-real-password',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

-- The signup trigger supplies CUSTOMER profiles. Elevate the fixture administrator
-- only in this privileged test setup; application clients cannot do this through RLS.
update public.profiles
set role = 'ADMIN', display_name = 'Salon Admin'
where id = '00000000-0000-0000-0000-000000000203';

insert into public.pets (id, owner_id, name, breed, size, age_years)
values
  (
    '00000000-0000-0000-0000-000000000211',
    '00000000-0000-0000-0000-000000000201',
    'Milo',
    'Golden Retriever',
    'LARGE',
    4
  ),
  (
    '00000000-0000-0000-0000-000000000212',
    '00000000-0000-0000-0000-000000000202',
    'Luna',
    'Poodle',
    'SMALL',
    3
  );

insert into public.groomers (id, display_name)
values ('00000000-0000-0000-0000-000000000221', 'Task 3 Groomer');

insert into public.services (
  id,
  name,
  description,
  kind,
  is_standalone_eligible,
  duration_minutes,
  price_cents
)
values (
  '00000000-0000-0000-0000-000000000222',
  'Task 3 Bath & Brush',
  'A test service for RLS checks.',
  'BASE',
  false,
  60,
  5500
);

insert into public.groomer_services (groomer_id, service_id)
values ('00000000-0000-0000-0000-000000000221', '00000000-0000-0000-0000-000000000222');

insert into public.groomer_working_hours (id, groomer_id, iso_day_of_week, starts_at, ends_at)
values (
  '00000000-0000-0000-0000-000000000223',
  '00000000-0000-0000-0000-000000000221',
  1,
  '09:00',
  '18:00'
);

insert into public.groomer_time_off (id, groomer_id, starts_at, ends_at, reason)
values (
  '00000000-0000-0000-0000-000000000224',
  '00000000-0000-0000-0000-000000000221',
  '2026-09-01 16:00:00+00',
  '2026-09-01 18:00:00+00',
  'Training'
);

insert into public.appointments (
  id,
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
values
  (
    '00000000-0000-0000-0000-000000000231',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000211',
    '00000000-0000-0000-0000-000000000221',
    'CONFIRMED',
    '2026-09-01 13:00:00+00',
    '2026-09-01 14:00:00+00',
    '2026-09-01 14:15:00+00',
    5500,
    15
  ),
  (
    '00000000-0000-0000-0000-000000000232',
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000212',
    '00000000-0000-0000-0000-000000000221',
    'CANCELLED',
    '2026-09-02 13:00:00+00',
    '2026-09-02 14:00:00+00',
    '2026-09-02 14:15:00+00',
    5500,
    15
  );

-- Customer one can read and mutate only their own pet. Appointment mutations
-- are deliberately withheld from direct clients; Task 7 will add atomic,
-- server-controlled booking operations rather than broad table updates.
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000201',
  true
);

select pg_temp.assert_task3_equals(
  (select count(*) from public.pets),
  1,
  'Customer one sees exactly one owned pet'
);
select pg_temp.assert_task3_equals(
  (select count(*) from public.appointments),
  1,
  'Customer one sees exactly one owned appointment'
);
select pg_temp.assert_task3_equals(
  (select count(*) from public.groomer_time_off where id = '00000000-0000-0000-0000-000000000224'),
  1,
  'Customer one can read an active groomer blackout for availability calculation'
);

select pg_temp.assert_task3_row_count(
  $sql$
    update public.pets
    set name = 'Milo Updated'
    where id = '00000000-0000-0000-0000-000000000211'
  $sql$,
  1,
  'Customer one can update their own pet'
);

select pg_temp.assert_task3_text_equals(
  (select name from public.pets where id = '00000000-0000-0000-0000-000000000211'),
  'Milo Updated',
  'Customer one observes their own pet update'
);

select pg_temp.assert_task3_row_count(
  $sql$
    update public.pets
    set name = 'Cross-customer update'
    where id = '00000000-0000-0000-0000-000000000212'
  $sql$,
  0,
  'Customer one cannot update customer two pet'
);

select pg_temp.assert_task3_row_count(
  $sql$
    update public.profiles
    set role = 'ADMIN'
    where id = '00000000-0000-0000-0000-000000000201'
  $sql$,
  0,
  'Customer one cannot promote their own profile to ADMIN'
);

select pg_temp.assert_task3_row_count(
  $sql$
    update public.appointments
    set status = 'CANCELLED'
    where id = '00000000-0000-0000-0000-000000000232'
  $sql$,
  0,
  'Customer one cannot directly update customer two appointment'
);

select pg_temp.assert_task3_row_count(
  $sql$
    update public.services
    set price_cents = 1
    where id = '00000000-0000-0000-0000-000000000222'
  $sql$,
  0,
  'Customer one cannot change catalogue data'
);

select pg_temp.assert_task3_row_count(
  $sql$
    update public.groomer_working_hours
    set ends_at = '17:00'
    where id = '00000000-0000-0000-0000-000000000223'
  $sql$,
  0,
  'Customer one cannot change schedule data'
);

-- Switch to the admin identity: cross-customer reads and catalogue/schedule
-- mutations are allowed.
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000203',
  true
);

select pg_temp.assert_task3_equals(
  (select count(*) from public.pets),
  2,
  'Admin can read all pets'
);
select pg_temp.assert_task3_equals(
  (select count(*) from public.profiles),
  3,
  'Admin can read all profiles'
);
select pg_temp.assert_task3_equals(
  (select count(*) from public.appointments),
  2,
  'Admin can read all appointments'
);

select pg_temp.assert_task3_row_count(
  $sql$
    update public.services
    set price_cents = 5600
    where id = '00000000-0000-0000-0000-000000000222'
  $sql$,
  1,
  'Admin can update catalogue data'
);

select pg_temp.assert_task3_row_count(
  $sql$
    update public.groomer_working_hours
    set ends_at = '17:00'
    where id = '00000000-0000-0000-0000-000000000223'
  $sql$,
  1,
  'Admin can update schedule data'
);

select pg_temp.assert_task3_row_count(
  $sql$
    update public.appointments
    set status = 'COMPLETED', completed_at = now()
    where id = '00000000-0000-0000-0000-000000000232'
  $sql$,
  1,
  'Admin can update another customer appointment'
);

reset role;
rollback;
