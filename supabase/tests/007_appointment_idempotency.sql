\set ON_ERROR_STOP on

begin;

create function pg_temp.assert_task8_equals(
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

create function pg_temp.assert_task8_text_equals(
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

create function pg_temp.assert_task8_raises(
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

create temporary table task8_slots (
  starts_at timestamptz not null,
  rescheduled_at timestamptz not null,
  admin_target_starts_at timestamptz not null
) on commit drop;

-- Maya works Monday 09:00–18:00 in America/New_York. Derive a Monday at
-- least two weeks out so customer reschedule/cancel cutoff checks never age.
insert into task8_slots (starts_at, rescheduled_at, admin_target_starts_at)
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
grant select on task8_slots to authenticated;

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
    '00000000-0000-4000-8000-000000002801',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'task8-customer@pawandpolish.example',
    'not-a-real-password',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000002802',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'task8-admin@pawandpolish.example',
    'not-a-real-password',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

update public.profiles
set role = 'ADMIN'
where id = '00000000-0000-4000-8000-000000002802';

insert into public.pets (id, owner_id, name, breed, size, age_years)
values (
  '00000000-0000-4000-8000-000000002811',
  '00000000-0000-4000-8000-000000002801',
  'Atlas',
  'Collie',
  'MEDIUM',
  5
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000002801',
  true
);

-- A create retry is returned from the original successful operation. It does
-- not create a second appointment or duplicate snapshots.
select pg_temp.assert_task8_equals(
  (
    select count(*)
    from public.create_confirmed_appointment(
      '00000000-0000-4000-8000-000000002811',
      '20000000-0000-0000-0000-000000000001',
      (select starts_at from task8_slots),
      array['10000000-0000-0000-0000-000000000001']::uuid[],
      'task8-create-retry'
    )
  ),
  1,
  'The initial idempotent create succeeds'
);
select pg_temp.assert_task8_equals(
  (
    select count(*)
    from public.create_confirmed_appointment(
      '00000000-0000-4000-8000-000000002811',
      '20000000-0000-0000-0000-000000000001',
      (select starts_at from task8_slots),
      array['10000000-0000-0000-0000-000000000001']::uuid[],
      'task8-create-retry'
    )
  ),
  1,
  'A create retry returns the original appointment'
);
set local time zone 'America/Los_Angeles';
select pg_temp.assert_task8_equals(
  (
    select count(*)
    from public.create_confirmed_appointment(
      '00000000-0000-4000-8000-000000002811',
      '20000000-0000-0000-0000-000000000001',
      to_timestamp(extract(epoch from (select starts_at from task8_slots))),
      array['10000000-0000-0000-0000-000000000001']::uuid[],
      'task8-create-retry'
    )
  ),
  1,
  'A retry with the same instant in another session timezone replays safely'
);
set local time zone 'UTC';
select pg_temp.assert_task8_text_equals(
  (
    select id::text
    from public.create_confirmed_appointment(
      '00000000-0000-4000-8000-000000002811',
      '20000000-0000-0000-0000-000000000001',
      (select starts_at from task8_slots),
      array['10000000-0000-0000-0000-000000000001']::uuid[],
      'task8-create-retry'
    )
  ),
  (
    select id::text
    from public.appointments
    where customer_id = '00000000-0000-4000-8000-000000002801'
      and starts_at = (select starts_at from task8_slots)
  ),
  'A create retry returns the original appointment ID'
);
select pg_temp.assert_task8_equals(
  (
    select count(*)
    from public.appointments
    where customer_id = '00000000-0000-4000-8000-000000002801'
  ),
  1,
  'A create retry cannot duplicate the appointment'
);
select pg_temp.assert_task8_equals(
  (
    select count(*)
    from public.appointment_services snapshot
    join public.appointments appointment on appointment.id = snapshot.appointment_id
    where appointment.customer_id = '00000000-0000-4000-8000-000000002801'
  ),
  1,
  'A create retry cannot duplicate snapshots'
);

select pg_temp.assert_task8_raises(
  format(
    $sql$
      select *
      from public.create_confirmed_appointment(
        '00000000-0000-4000-8000-000000002811',
        '20000000-0000-0000-0000-000000000001',
        %L::timestamptz,
        array['10000000-0000-0000-0000-000000000001']::uuid[],
        'task8-create-retry'
      )
    $sql$,
    (select rescheduled_at::text from task8_slots)
  ),
  'IDEMPOTENCY_KEY_REUSED',
  'The same key cannot be repurposed for a different create request'
);

-- Reschedule and cancellation use the same retry protection.
select pg_temp.assert_task8_equals(
  (
    select count(*)
    from public.reschedule_confirmed_appointment(
      (
        select id
        from public.appointments
        where customer_id = '00000000-0000-4000-8000-000000002801'
          and starts_at = (select starts_at from task8_slots)
      ),
      '20000000-0000-0000-0000-000000000001',
      (select rescheduled_at from task8_slots),
      array['10000000-0000-0000-0000-000000000001']::uuid[],
      'task8-reschedule-retry'
    )
  ),
  1,
  'The initial idempotent reschedule succeeds'
);
select pg_temp.assert_task8_equals(
  (
    select count(*)
    from public.reschedule_confirmed_appointment(
      (
        select id
        from public.appointments
        where customer_id = '00000000-0000-4000-8000-000000002801'
      ),
      '20000000-0000-0000-0000-000000000001',
      (select rescheduled_at from task8_slots),
      array['10000000-0000-0000-0000-000000000001']::uuid[],
      'task8-reschedule-retry'
    )
  ),
  1,
  'A reschedule retry returns the original outcome'
);
select pg_temp.assert_task8_equals(
  (
    select extract(epoch from starts_at)::bigint
    from public.reschedule_confirmed_appointment(
      (
        select id
        from public.appointments
        where customer_id = '00000000-0000-4000-8000-000000002801'
      ),
      '20000000-0000-0000-0000-000000000001',
      (select rescheduled_at from task8_slots),
      array['10000000-0000-0000-0000-000000000001']::uuid[],
      'task8-reschedule-retry'
    )
  ),
  extract(epoch from (select rescheduled_at from task8_slots))::bigint,
  'A reschedule retry returns its original time'
);

select pg_temp.assert_task8_equals(
  (
    select count(*)
    from public.cancel_confirmed_appointment(
      (
        select id
        from public.appointments
        where customer_id = '00000000-0000-4000-8000-000000002801'
      ),
      'task8-cancel-retry'
    )
  ),
  1,
  'The initial idempotent cancellation succeeds'
);
select pg_temp.assert_task8_equals(
  (
    select count(*)
    from public.cancel_confirmed_appointment(
      (
        select id
        from public.appointments
        where customer_id = '00000000-0000-4000-8000-000000002801'
      ),
      'task8-cancel-retry'
    )
  ),
  1,
  'A cancellation retry returns the original outcome after status changes'
);
select pg_temp.assert_task8_text_equals(
  (
    select status::text
    from public.cancel_confirmed_appointment(
      (
        select id
        from public.appointments
        where customer_id = '00000000-0000-4000-8000-000000002801'
      ),
      'task8-cancel-retry'
    )
  ),
  'CANCELLED',
  'A cancellation retry returns the original cancelled status'
);

-- Current authority gates replay. An administrator can cancel a customer's
-- appointment, but once demoted must not use a retained replay key to expose
-- the former cross-customer response.
select pg_temp.assert_task8_equals(
  (
    select count(*)
    from public.create_confirmed_appointment(
      '00000000-0000-4000-8000-000000002811',
      '20000000-0000-0000-0000-000000000001',
      (select admin_target_starts_at from task8_slots),
      array['10000000-0000-0000-0000-000000000001']::uuid[],
      'task8-admin-target-create'
    )
  ),
  1,
  'Customer can create the administrator cancellation target'
);
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000002802',
  true
);
select pg_temp.assert_task8_equals(
  (
    select count(*)
    from public.cancel_confirmed_appointment(
      (
        select id
        from public.appointments
        where customer_id = '00000000-0000-4000-8000-000000002801'
          and starts_at = (select admin_target_starts_at from task8_slots)
      ),
      'task8-admin-cancel-retry'
    )
  ),
  1,
  'Administrator can cancel another customer appointment'
);
reset role;
update public.profiles
set role = 'CUSTOMER'
where id = '00000000-0000-4000-8000-000000002802';
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000002802',
  true
);
select pg_temp.assert_task8_raises(
  format(
    $sql$
      select *
      from public.cancel_confirmed_appointment(%L::uuid, 'task8-admin-cancel-retry')
    $sql$,
    (
      select id::text
      from public.appointments
      where customer_id = '00000000-0000-4000-8000-000000002801'
        and starts_at = (select admin_target_starts_at from task8_slots)
    )
  ),
  'APPOINTMENT_NOT_FOUND',
  'A demoted administrator cannot replay a prior cross-customer cancellation'
);

-- Records live for 24 hours. A key seen after its retry window is rejected,
-- never treated as a new request, so late network retries cannot duplicate work.
reset role;
update public.idempotency_records
set
  created_at = now() - interval '25 hours',
  expires_at = now() - interval '1 hour'
where actor_id = '00000000-0000-4000-8000-000000002801'
  and operation = 'CANCEL_APPOINTMENT'
  and idempotency_key = 'task8-cancel-retry';
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000002801',
  true
);
select pg_temp.assert_task8_raises(
  format(
    $sql$
      select *
      from public.cancel_confirmed_appointment(%L::uuid, 'task8-cancel-retry')
    $sql$,
    (
      select id::text
      from public.appointments
      where customer_id = '00000000-0000-4000-8000-000000002801'
        and starts_at = (select rescheduled_at from task8_slots)
    )
  ),
  'IDEMPOTENCY_KEY_EXPIRED',
  'Expired idempotency keys are rejected rather than replayed as new work'
);

reset role;
rollback;
