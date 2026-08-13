\set ON_ERROR_STOP on

begin;

-- Availability must see only the minimal confirmed block intervals for an
-- active groomer, including other customers' blocks, without widening direct
-- appointment-table reads.
create function pg_temp.assert_task6_equals(
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
    '00000000-0000-4000-8000-000000000701',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'task6-customer-one@pawandpolish.example',
    'not-a-real-password',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000702',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'task6-customer-two@pawandpolish.example',
    'not-a-real-password',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.pets (id, owner_id, name, breed, size, age_years)
values
  (
    '00000000-0000-4000-8000-000000000711',
    '00000000-0000-4000-8000-000000000701',
    'Milo',
    'Golden Retriever',
    'LARGE',
    4
  ),
  (
    '00000000-0000-4000-8000-000000000712',
    '00000000-0000-4000-8000-000000000702',
    'Luna',
    'Poodle',
    'SMALL',
    3
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
    '00000000-0000-4000-8000-000000000721',
    '00000000-0000-4000-8000-000000000701',
    '00000000-0000-4000-8000-000000000711',
    '20000000-0000-0000-0000-000000000001',
    'CONFIRMED',
    '2026-09-07 13:00:00+00',
    '2026-09-07 14:00:00+00',
    '2026-09-07 14:15:00+00',
    5500,
    15
  ),
  (
    '00000000-0000-4000-8000-000000000722',
    '00000000-0000-4000-8000-000000000702',
    '00000000-0000-4000-8000-000000000712',
    '20000000-0000-0000-0000-000000000001',
    'CONFIRMED',
    '2026-09-07 15:00:00+00',
    '2026-09-07 16:00:00+00',
    '2026-09-07 16:15:00+00',
    5500,
    15
  ),
  (
    '00000000-0000-4000-8000-000000000723',
    '00000000-0000-4000-8000-000000000702',
    '00000000-0000-4000-8000-000000000712',
    '20000000-0000-0000-0000-000000000001',
    'CANCELLED',
    '2026-09-07 17:00:00+00',
    '2026-09-07 18:00:00+00',
    '2026-09-07 18:15:00+00',
    5500,
    15
  );

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000000701',
  true
);

select pg_temp.assert_task6_equals(
  (select count(*) from public.appointments),
  1,
  'Customer direct appointment reads remain restricted to ownership'
);

select pg_temp.assert_task6_equals(
  (
    select count(*)
    from public.list_confirmed_appointment_blocks(
      '20000000-0000-0000-0000-000000000001',
      '2026-09-07 00:00:00+00',
      '2026-09-08 00:00:00+00'
    )
  ),
  2,
  'Availability can receive all confirmed blocks for the active groomer'
);

select pg_temp.assert_task6_equals(
  (
    select count(*)
    from public.list_confirmed_appointment_blocks(
      '20000000-0000-0000-0000-000000000001',
      '2026-09-07 14:15:00+00',
      '2026-09-07 15:00:00+00'
    )
  ),
  0,
  'Half-open confirmed blocks do not overlap their exact end boundary'
);

reset role;
rollback;
