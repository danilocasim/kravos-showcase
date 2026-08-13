-- Paw & Polish Phase 1 initial booking schema.
-- Product rules are locked in tasks/phase-0.md. RLS policies are added in Task 3.

create extension if not exists btree_gist;
create extension if not exists pgcrypto;

create type public.app_role as enum ('CUSTOMER', 'ADMIN');
create type public.pet_size as enum ('SMALL', 'MEDIUM', 'LARGE');
create type public.service_kind as enum ('BASE', 'ADD_ON');
create type public.appointment_status as enum ('CONFIRMED', 'CANCELLED', 'COMPLETED');

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'CUSTOMER',
  display_name text not null check (char_length(display_name) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 80),
  breed text not null check (char_length(breed) between 1 and 100),
  size public.pet_size not null,
  age_years smallint not null check (age_years between 0 and 30),
  temperament text check (char_length(temperament) <= 500),
  coat_condition text check (char_length(coat_condition) <= 500),
  allergies text check (char_length(allergies) <= 2_000),
  notes text check (char_length(notes) <= 2_000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pets_owner_id_idx on public.pets (owner_id);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 120),
  description text not null check (char_length(description) between 1 and 1_000),
  kind public.service_kind not null,
  is_standalone_eligible boolean not null default false,
  duration_minutes smallint not null check (duration_minutes between 1 and 480),
  price_cents integer not null check (price_cents >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_standalone_eligibility_check check (
    kind = 'ADD_ON' or is_standalone_eligible = false
  )
);

create index services_active_kind_idx on public.services (kind, name) where is_active;

create table public.groomers (
  id uuid primary key default gen_random_uuid(),
  display_name text not null unique check (char_length(display_name) between 1 and 100),
  bio text check (char_length(bio) <= 2_000),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index groomers_active_display_name_idx on public.groomers (display_name) where is_active;

create table public.groomer_services (
  groomer_id uuid not null references public.groomers (id) on delete restrict,
  service_id uuid not null references public.services (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (groomer_id, service_id)
);

create index groomer_services_service_id_groomer_id_idx
  on public.groomer_services (service_id, groomer_id);

create table public.groomer_working_hours (
  id uuid primary key default gen_random_uuid(),
  groomer_id uuid not null references public.groomers (id) on delete cascade,
  -- ISO day of week: 1 = Monday, 7 = Sunday.
  iso_day_of_week smallint not null check (iso_day_of_week between 1 and 7),
  starts_at time not null,
  ends_at time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint groomer_working_hours_interval_check check (starts_at < ends_at),
  constraint groomer_working_hours_unique_interval unique (groomer_id, iso_day_of_week, starts_at)
);

create index groomer_working_hours_groomer_day_idx
  on public.groomer_working_hours (groomer_id, iso_day_of_week, starts_at);

create table public.groomer_time_off (
  id uuid primary key default gen_random_uuid(),
  groomer_id uuid not null references public.groomers (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text check (char_length(reason) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint groomer_time_off_interval_check check (starts_at < ends_at)
);

create index groomer_time_off_groomer_starts_at_idx
  on public.groomer_time_off (groomer_id, starts_at);

create function public.validate_service_compatibility()
returns trigger
language plpgsql
as $$
declare
  base_kind public.service_kind;
  add_on_kind public.service_kind;
begin
  select kind into base_kind
  from public.services
  where id = new.base_service_id;

  select kind into add_on_kind
  from public.services
  where id = new.add_on_service_id;

  if base_kind is not null and base_kind <> 'BASE' then
    raise exception 'base_service_id must reference a BASE service'
      using errcode = '23514';
  end if;

  if add_on_kind is not null and add_on_kind <> 'ADD_ON' then
    raise exception 'add_on_service_id must reference an ADD_ON service'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create table public.service_compatibility (
  base_service_id uuid not null references public.services (id) on delete restrict,
  add_on_service_id uuid not null references public.services (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (base_service_id, add_on_service_id),
  constraint service_compatibility_distinct_services_check check (
    base_service_id <> add_on_service_id
  )
);

create trigger service_compatibility_validate_kinds
before insert or update on public.service_compatibility
for each row execute function public.validate_service_compatibility();

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  pet_id uuid not null references public.pets (id) on delete restrict,
  groomer_id uuid not null references public.groomers (id) on delete restrict,
  status public.appointment_status not null default 'CONFIRMED',
  starts_at timestamptz not null,
  service_ends_at timestamptz not null,
  blocked_until timestamptz not null,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  applied_buffer_minutes smallint not null default 15 check (applied_buffer_minutes = 15),
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_service_interval_check check (starts_at < service_ends_at),
  constraint appointments_blocked_interval_check check (
    service_ends_at <= blocked_until
    and blocked_until = service_ends_at + (applied_buffer_minutes * interval '1 minute')
  ),
  constraint appointments_no_confirmed_overlap exclude using gist (
    groomer_id with =,
    tstzrange(starts_at, blocked_until, '[)') with &&
  ) where (status = 'CONFIRMED')
);

create index appointments_customer_starts_at_idx
  on public.appointments (customer_id, starts_at desc);
create index appointments_groomer_starts_at_idx
  on public.appointments (groomer_id, starts_at);

create table public.appointment_services (
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete restrict,
  service_name text not null check (char_length(service_name) between 1 and 120),
  service_kind public.service_kind not null,
  duration_minutes smallint not null check (duration_minutes between 1 and 480),
  price_cents integer not null check (price_cents >= 0),
  created_at timestamptz not null default now(),
  primary key (appointment_id, service_id)
);

create index appointment_services_service_id_idx
  on public.appointment_services (service_id);

create table public.idempotency_records (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles (id) on delete restrict,
  operation text not null check (
    operation in ('CREATE_APPOINTMENT', 'RESCHEDULE_APPOINTMENT', 'CANCEL_APPOINTMENT')
  ),
  idempotency_key text not null check (char_length(idempotency_key) between 1 and 255),
  request_fingerprint text not null check (char_length(request_fingerprint) between 1 and 128),
  response_status smallint check (response_status between 100 and 599),
  appointment_id uuid references public.appointments (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  constraint idempotency_records_expiry_check check (expires_at > created_at),
  constraint idempotency_records_actor_operation_key_unique unique (
    actor_id,
    operation,
    idempotency_key
  )
);

create index idempotency_records_expires_at_idx
  on public.idempotency_records (expires_at);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger pets_set_updated_at
before update on public.pets
for each row execute function public.set_updated_at();

create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

create trigger groomers_set_updated_at
before update on public.groomers
for each row execute function public.set_updated_at();

create trigger groomer_working_hours_set_updated_at
before update on public.groomer_working_hours
for each row execute function public.set_updated_at();

create trigger groomer_time_off_set_updated_at
before update on public.groomer_time_off
for each row execute function public.set_updated_at();

create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();
