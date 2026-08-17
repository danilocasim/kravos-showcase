\set ON_ERROR_STOP on

begin;

create function pg_temp.assert_admin_equals(actual text, expected text, assertion_message text)
returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception '% (expected %, got %)', assertion_message, expected, actual;
  end if;
end;
$$;

create function pg_temp.assert_admin_true(actual boolean, assertion_message text)
returns void language plpgsql as $$
begin
  if actual is not true then raise exception '%', assertion_message; end if;
end;
$$;

create function pg_temp.assert_admin_raises(statement text, expected_message text)
returns void language plpgsql as $$
begin
  execute statement;
  raise exception 'Expected %', expected_message;
exception
  when others then
    if sqlerrm <> expected_message then
      raise exception 'Expected %, got %', expected_message, sqlerrm;
    end if;
end;
$$;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-4000-8000-000000003001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'phase5-admin@example.test', 'x', now(), '{}', '{"display_name":"Phase Five Admin"}', now(), now()),
  ('00000000-0000-4000-8000-000000003002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'phase5-customer@example.test', 'x', now(), '{}', '{"display_name":"Phase Five Customer"}', now(), now());

update public.profiles set role = 'ADMIN' where id = '00000000-0000-4000-8000-000000003001';

insert into public.pets (id, owner_id, name, breed, size, age_years)
values ('00000000-0000-4000-8000-000000003011', '00000000-0000-4000-8000-000000003002', 'Audit Pup', 'Spaniel', 'MEDIUM', 4);

insert into public.appointments (
  id, customer_id, pet_id, groomer_id, starts_at, service_ends_at,
  blocked_until, status, subtotal_cents, applied_buffer_minutes
) values
  ('00000000-0000-4000-8000-000000003021', '00000000-0000-4000-8000-000000003002', '00000000-0000-4000-8000-000000003011', '20000000-0000-0000-0000-000000000001', '2099-01-05 14:00:00+00', '2099-01-05 15:00:00+00', '2099-01-05 15:15:00+00', 'CONFIRMED', 5500, 15),
  ('00000000-0000-4000-8000-000000003022', '00000000-0000-4000-8000-000000003002', '00000000-0000-4000-8000-000000003011', '20000000-0000-0000-0000-000000000002', '2099-01-05 16:00:00+00', '2099-01-05 17:00:00+00', '2099-01-05 17:15:00+00', 'CONFIRMED', 5500, 15),
  ('00000000-0000-4000-8000-000000003023', '00000000-0000-4000-8000-000000003002', '00000000-0000-4000-8000-000000003011', '20000000-0000-0000-0000-000000000003', now() + interval '23 hours', now() + interval '24 hours', now() + interval '24 hours 15 minutes', 'CONFIRMED', 5500, 15);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000003001', true);

update public.appointments
set status = 'COMPLETED'
where id = '00000000-0000-4000-8000-000000003021';
select pg_temp.assert_admin_equals(
  (select status::text from public.appointments where id = '00000000-0000-4000-8000-000000003021'),
  'CONFIRMED',
  'Expected direct admin table updates to be denied in favor of guarded lifecycle RPCs'
);

select pg_temp.assert_admin_equals(
  (select status::text from public.complete_confirmed_appointment_as_admin('00000000-0000-4000-8000-000000003021')),
  'COMPLETED',
  'Expected admin completion to transition CONFIRMED to COMPLETED'
);
select pg_temp.assert_admin_true(
  (select completed_at is not null and status_changed_at is not null and status_changed_by = '00000000-0000-4000-8000-000000003001' from public.appointments where id = '00000000-0000-4000-8000-000000003021'),
  'Expected completion audit columns to record the admin actor and time'
);
select pg_temp.assert_admin_raises(
  $$select public.complete_confirmed_appointment_as_admin('00000000-0000-4000-8000-000000003021')$$,
  'APPOINTMENT_NOT_CHANGEABLE'
);

select * from public.cancel_confirmed_appointment(
  '00000000-0000-4000-8000-000000003023',
  'phase5-admin-cutoff-cancel'
);
select pg_temp.assert_admin_true(
  (select status = 'CANCELLED' and status_changed_by = '00000000-0000-4000-8000-000000003001' and status_changed_at is not null from public.appointments where id = '00000000-0000-4000-8000-000000003023'),
  'Expected an inside-cutoff admin cancellation to record the admin actor and time'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000003002', true);
select pg_temp.assert_admin_raises(
  $$select public.complete_confirmed_appointment_as_admin('00000000-0000-4000-8000-000000003022')$$,
  'ADMIN_REQUIRED'
);

select * from public.cancel_confirmed_appointment(
  '00000000-0000-4000-8000-000000003022',
  'phase5-customer-cancel'
);
select pg_temp.assert_admin_true(
  (select status = 'CANCELLED' and status_changed_by = '00000000-0000-4000-8000-000000003002' from public.appointments where id = '00000000-0000-4000-8000-000000003022'),
  'Expected customer cancellation to record the customer actor'
);

rollback;
