\set ON_ERROR_STOP on

begin;

-- Seed data is intentionally deterministic and non-sensitive. It exercises the
-- Phase 0 catalogue, qualifications, schedules, and demo time off without
-- creating auth users, credentials, tokens, or booking records.
do $$
begin
  if (select count(*) from public.services) <> 5 then
    raise exception 'Expected five demo services';
  end if;

  if (select count(*) from public.groomers) <> 3 then
    raise exception 'Expected three demo groomers';
  end if;

  if (select count(*) from public.groomer_services) <> 12 then
    raise exception 'Expected twelve demo groomer-service qualifications';
  end if;

  if (select count(*) from public.groomer_working_hours) <> 17 then
    raise exception 'Expected seventeen demo working-hour intervals';
  end if;

  if (select count(*) from public.groomer_time_off) <> 2 then
    raise exception 'Expected two demo time-off records';
  end if;

  if not exists (
    select 1
    from public.services
    where name = 'Nail Trim'
      and kind = 'ADD_ON'
      and is_standalone_eligible
      and duration_minutes = 15
      and price_cents = 1500
  ) then
    raise exception 'Expected standalone Nail Trim seed service';
  end if;

  if not exists (
    select 1
    from public.service_compatibility compatibility
    join public.services base_service on base_service.id = compatibility.base_service_id
    join public.services add_on_service on add_on_service.id = compatibility.add_on_service_id
    where base_service.name = 'Full Groom'
      and add_on_service.name = 'De-shedding Treatment'
  ) then
    raise exception 'Expected Full Groom and De-shedding Treatment compatibility';
  end if;

  if exists (
    select 1
    from public.service_compatibility compatibility
    join public.services base_service on base_service.id = compatibility.base_service_id
    join public.services add_on_service on add_on_service.id = compatibility.add_on_service_id
    where base_service.name = 'Full Groom'
      and add_on_service.name = 'Nail Trim'
  ) then
    raise exception 'Full Groom must not receive Nail Trim because it is included';
  end if;

  if exists (
    select 1
    from public.groomer_services qualification
    join public.groomers groomer on groomer.id = qualification.groomer_id
    join public.services service on service.id = qualification.service_id
    where groomer.display_name = 'Liam Patel'
      and service.name = 'Full Groom'
  ) then
    raise exception 'Liam Patel must not be seeded as qualified for Full Groom';
  end if;

  if not exists (
    select 1
    from public.groomer_time_off time_off
    join public.groomers groomer on groomer.id = time_off.groomer_id
    where groomer.display_name = 'Maya Chen'
      and time_off.starts_at = '2026-09-02 16:00:00+00'::timestamptz
      and time_off.ends_at = '2026-09-02 18:00:00+00'::timestamptz
      and time_off.reason = 'Training'
  ) then
    raise exception 'Expected Maya September 2026 training blackout';
  end if;
end;
$$;

rollback;
