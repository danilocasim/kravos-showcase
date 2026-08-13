\set ON_ERROR_STOP on

begin;

create function pg_temp.assert_task7_equals(
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

create function pg_temp.assert_task7_text_equals(
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

create function pg_temp.assert_task7_raises(
  statement text,
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
    if position(expected_message in sqlerrm) = 0 then
      raise exception '% (expected error containing %, got %)',
        assertion_message,
        expected_message,
        sqlerrm;
    end if;
    return;
  end;

  raise exception '% (expected error containing %, but no error was raised)',
    assertion_message,
    expected_message;
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
    '00000000-0000-4000-8000-000000002701',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'task7-customer-one@pawandpolish.example',
    'not-a-real-password',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000002702',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'task7-customer-two@pawandpolish.example',
    'not-a-real-password',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000002703',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'task7-admin@pawandpolish.example',
    'not-a-real-password',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

update public.profiles
set role = 'ADMIN'
where id = '00000000-0000-4000-8000-000000002703';

insert into public.pets (id, owner_id, name, breed, size, age_years)
values
  (
    '00000000-0000-4000-8000-000000002711',
    '00000000-0000-4000-8000-000000002701',
    'Milo',
    'Golden Retriever',
    'LARGE',
    4
  ),
  (
    '00000000-0000-4000-8000-000000002712',
    '00000000-0000-4000-8000-000000002702',
    'Luna',
    'Poodle',
    'SMALL',
    3
  );

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000002701',
  true
);

-- Use a configured Monday working window at least two weeks ahead so normal
-- lifecycle assertions do not age past the customer 24-hour cutoff.
reset role;
create temporary table task7_slots (
  starts_at timestamptz not null,
  competing_starts_at timestamptz not null,
  rescheduled_starts_at timestamptz not null
) on commit drop;
insert into task7_slots (starts_at, competing_starts_at, rescheduled_starts_at)
select
  monday_at_nine,
  monday_at_nine + interval '2 hours',
  monday_at_nine + interval '4 hours'
from (
  select (
    (
      date_trunc('week', now() at time zone 'America/New_York')::date + 14
      + time '09:00'
    ) at time zone 'America/New_York'
  ) as monday_at_nine
) slots;
grant select on task7_slots to authenticated;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000002701',
  true
);

-- Create derives timing/pricing from persisted services and writes snapshots.
select pg_temp.assert_task7_equals(
  (
    select count(*)
    from public.create_confirmed_appointment(
      '00000000-0000-4000-8000-000000002711',
      '20000000-0000-0000-0000-000000000001',
      (select starts_at from task7_slots),
      array['10000000-0000-0000-0000-000000000001']::uuid[],
      'task7-create-one'
    )
  ),
  1,
  'Customer can create one confirmed appointment in an available slot'
);
select pg_temp.assert_task7_equals(
  (
    select extract(epoch from blocked_until)::bigint
    from public.appointments
    where customer_id = '00000000-0000-4000-8000-000000002701'
      and starts_at = (select starts_at from task7_slots)
  ),
  (
    select extract(epoch from starts_at + interval '75 minutes')::bigint
    from task7_slots
  ),
  'Create derives the service end plus fifteen-minute cleanup block'
);
select pg_temp.assert_task7_equals(
  (
    select count(*)
    from public.appointment_services snapshot
    join public.appointments appointment on appointment.id = snapshot.appointment_id
    where appointment.customer_id = '00000000-0000-4000-8000-000000002701'
  ),
  1,
  'Create snapshots the selected persisted service'
);

select pg_temp.assert_task7_raises(
  format(
    $sql$
      select *
      from public.create_confirmed_appointment(
        '00000000-0000-4000-8000-000000002712',
        '20000000-0000-0000-0000-000000000001',
        %L::timestamptz,
        array['10000000-0000-0000-0000-000000000001']::uuid[],
        'task7-cross-pet'
      )
    $sql$,
    (select competing_starts_at::text from task7_slots)
  ),
  'PET_NOT_FOUND',
  'Customer cannot create an appointment for another customer pet'
);

-- A stale reschedule must conflict, never silently choose a different slot.
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000002702',
  true
);
select pg_temp.assert_task7_equals(
  (
    select count(*)
    from public.create_confirmed_appointment(
      '00000000-0000-4000-8000-000000002712',
      '20000000-0000-0000-0000-000000000001',
      (select competing_starts_at from task7_slots),
      array['10000000-0000-0000-0000-000000000001']::uuid[],
      'task7-create-two'
    )
  ),
  1,
  'Second customer can create a separate available appointment'
);
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000002701',
  true
);
select pg_temp.assert_task7_raises(
  format(
    $sql$
      select *
      from public.reschedule_confirmed_appointment(
        %L::uuid,
        '20000000-0000-0000-0000-000000000001',
        %L::timestamptz,
        array['10000000-0000-0000-0000-000000000001']::uuid[],
        'task7-stale-reschedule'
      )
    $sql$,
    (
      select id
      from public.appointments
      where customer_id = '00000000-0000-4000-8000-000000002701'
        and starts_at = (select starts_at from task7_slots)
    ),
    (select competing_starts_at::text from task7_slots)
  ),
  'SLOT_UNAVAILABLE',
  'A stale reschedule returns a conflict instead of choosing a different time'
);

select pg_temp.assert_task7_equals(
  (
    select count(*)
    from public.reschedule_confirmed_appointment(
      (
        select id
        from public.appointments
        where customer_id = '00000000-0000-4000-8000-000000002701'
          and starts_at = (select starts_at from task7_slots)
      ),
      '20000000-0000-0000-0000-000000000001',
      (select rescheduled_starts_at from task7_slots),
      array[
        '10000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000005'
      ]::uuid[],
      'task7-successful-reschedule'
    )
  ),
  1,
  'Reschedule uses the same transactional validation and updates the booking'
);
select pg_temp.assert_task7_equals(
  (
    select subtotal_cents
    from public.appointments
    where customer_id = '00000000-0000-4000-8000-000000002701'
  ),
  8500,
  'Reschedule derives a new subtotal from persisted selected services'
);
select pg_temp.assert_task7_equals(
  (
    select count(*)
    from public.appointment_services snapshot
    join public.appointments appointment on appointment.id = snapshot.appointment_id
    where appointment.customer_id = '00000000-0000-4000-8000-000000002701'
  ),
  2,
  'Reschedule atomically replaces service snapshots'
);

-- Customer cutoff: seed a near-term appointment in this privileged test setup,
-- then restore the authenticated customer to prove normal lifecycle policy.
reset role;
insert into public.appointments (
  id, customer_id, pet_id, groomer_id, status, starts_at, service_ends_at,
  blocked_until, subtotal_cents, applied_buffer_minutes
)
values (
  '00000000-0000-4000-8000-000000002721',
  '00000000-0000-4000-8000-000000002701',
  '00000000-0000-4000-8000-000000002711',
  '20000000-0000-0000-0000-000000000002',
  'CONFIRMED',
  now() + interval '23 hours',
  now() + interval '24 hours',
  now() + interval '24 hours 15 minutes',
  5500,
  15
);
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000002701',
  true
);
select pg_temp.assert_task7_raises(
  $sql$
    select *
    from public.cancel_confirmed_appointment(
      '00000000-0000-4000-8000-000000002721',
      'task7-customer-cutoff'
    )
  $sql$,
  'CANCELLATION_CUTOFF_PASSED',
  'Customer cannot cancel inside the twenty-four-hour cutoff'
);
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000002703',
  true
);
select pg_temp.assert_task7_equals(
  (
    select count(*)
    from public.cancel_confirmed_appointment(
      '00000000-0000-4000-8000-000000002721',
      'task7-admin-cutoff'
    )
  ),
  1,
  'Administrator may cancel inside the customer cutoff'
);
select pg_temp.assert_task7_text_equals(
  (
    select status::text from public.appointments
    where id = '00000000-0000-4000-8000-000000002721'
  ),
  'CANCELLED',
  'Cancellation changes appointment status'
);

reset role;
rollback;
