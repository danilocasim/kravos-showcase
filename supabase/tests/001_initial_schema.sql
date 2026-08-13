\set ON_ERROR_STOP on

begin;

-- This script is intentionally plain PostgreSQL rather than pgTAP so it can run
-- against either `supabase start` or an isolated local PostgreSQL development DB.
-- Each failed assertion raises an error; all fixtures are rolled back at the end.

do $$
declare
  required_table text;
begin
  foreach required_table in array array[
    'profiles',
    'pets',
    'services',
    'service_compatibility',
    'groomers',
    'groomer_services',
    'groomer_working_hours',
    'groomer_time_off',
    'appointments',
    'appointment_services',
    'idempotency_records'
  ]
  loop
    if to_regclass(format('public.%I', required_table)) is null then
      raise exception 'Missing required table public.%', required_table;
    end if;
  end loop;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'appointments'
      and column_name = 'starts_at'
      and data_type = 'timestamp with time zone'
  ) then
    raise exception 'appointments.starts_at must use timestamptz';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'appointments'
      and column_name = 'service_ends_at'
      and data_type = 'timestamp with time zone'
  ) then
    raise exception 'appointments.service_ends_at must use timestamptz';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'appointments'
      and column_name = 'blocked_until'
      and data_type = 'timestamp with time zone'
  ) then
    raise exception 'appointments.blocked_until must use timestamptz';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_blocked_interval_check'
      and conrelid = 'public.appointments'::regclass
  ) then
    raise exception 'Missing cleanup-buffer interval constraint';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_no_confirmed_overlap'
      and contype = 'x'
      and conrelid = 'public.appointments'::regclass
  ) then
    raise exception 'Missing confirmed-appointment overlap constraint';
  end if;
end;
$$;

-- Fixed UUIDs make the behavioral checks deterministic. The enclosing transaction
-- is rolled back, so these fixtures never become product data.
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
values (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'schema-test@pawandpolish.example',
  'not-a-real-password',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

insert into public.pets (id, owner_id, name, breed, size, age_years)
values (
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000101',
  'Milo',
  'Golden Retriever',
  'LARGE',
  4
);

insert into public.groomers (id, display_name)
values ('00000000-0000-0000-0000-000000000103', 'Schema Test Groomer');

insert into public.services (
  id,
  name,
  description,
  kind,
  is_standalone_eligible,
  duration_minutes,
  price_cents
)
values
  (
    '00000000-0000-0000-0000-000000000104',
    'Bath & Brush Test',
    'Test base service',
    'BASE',
    false,
    60,
    5500
  ),
  (
    '00000000-0000-0000-0000-000000000105',
    'Nail Trim Test',
    'Test add-on service',
    'ADD_ON',
    true,
    15,
    1500
  ),
  (
    '00000000-0000-0000-0000-000000000110',
    'Full Groom Test',
    'Second test base service',
    'BASE',
    false,
    90,
    8500
  );

insert into public.service_compatibility (base_service_id, add_on_service_id)
values (
  '00000000-0000-0000-0000-000000000104',
  '00000000-0000-0000-0000-000000000105'
);

insert into public.groomer_services (groomer_id, service_id)
values
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000104'),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000105');

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
values (
  '00000000-0000-0000-0000-000000000106',
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000103',
  'CONFIRMED',
  '2026-06-01 09:00:00+00',
  '2026-06-01 10:00:00+00',
  '2026-06-01 10:15:00+00',
  5500,
  15
);

-- Phase 0 cleanup-buffer assertion: a persisted 15-minute buffer cannot claim
-- that the blocked interval ends with the customer-facing service.
do $$
begin
  begin
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
    values (
      '00000000-0000-0000-0000-000000000107',
      '00000000-0000-0000-0000-000000000101',
      '00000000-0000-0000-0000-000000000102',
      '00000000-0000-0000-0000-000000000103',
      'CANCELLED',
      '2026-06-02 09:00:00+00',
      '2026-06-02 10:00:00+00',
      '2026-06-02 10:00:00+00',
      5500,
      15
    );
    raise exception 'Expected cleanup-buffer check violation';
  exception
    when check_violation then null;
  end;
end;
$$;

-- Phase 0 overlap assertion: 10:00 overlaps the first booking's [09:00, 10:15)
-- blocked range even though the first customer-facing service ends at 10:00.
do $$
begin
  begin
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
    values (
      '00000000-0000-0000-0000-000000000108',
      '00000000-0000-0000-0000-000000000101',
      '00000000-0000-0000-0000-000000000102',
      '00000000-0000-0000-0000-000000000103',
      'CONFIRMED',
      '2026-06-01 10:00:00+00',
      '2026-06-01 11:00:00+00',
      '2026-06-01 11:15:00+00',
      5500,
      15
    );
    raise exception 'Expected confirmed-appointment overlap violation';
  exception
    when exclusion_violation then null;
  end;
end;
$$;

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
values (
  '00000000-0000-0000-0000-000000000109',
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000103',
  'CONFIRMED',
  '2026-06-01 10:15:00+00',
  '2026-06-01 11:15:00+00',
  '2026-06-01 11:30:00+00',
  5500,
  15
);

-- The compatibility table must only pair a BASE service with an ADD_ON service.
do $$
begin
  begin
    insert into public.service_compatibility (base_service_id, add_on_service_id)
    values (
      '00000000-0000-0000-0000-000000000104',
      '00000000-0000-0000-0000-000000000110'
    );
    raise exception 'Expected service-compatibility check violation';
  exception
    when check_violation then null;
  end;
end;
$$;

rollback;
