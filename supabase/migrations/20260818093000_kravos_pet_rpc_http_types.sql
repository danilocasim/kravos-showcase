-- PostgREST resolves RPC overloads from JSON-native values. Keep its public
-- parameter types as text/integer, then cast inside the trusted function to the
-- constrained database types.

drop function if exists public.kravos_create_pet(
  uuid,
  text,
  text,
  public.pet_size,
  smallint,
  text,
  text,
  text,
  text
);

create function public.kravos_create_pet(
  trusted_actor_id uuid,
  requested_name text,
  requested_breed text,
  requested_size text,
  requested_age_years integer,
  requested_temperament text,
  requested_coat_condition text,
  requested_allergies text,
  requested_notes text
)
returns table (
  id uuid,
  owner_id uuid,
  name text,
  breed text,
  size public.pet_size,
  age_years smallint,
  temperament text,
  coat_condition text,
  allergies text,
  notes text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.profiles profile
    where profile.id = trusted_actor_id
      and profile.role = 'CUSTOMER'
  ) then
    raise exception 'CUSTOMER_NOT_FOUND' using errcode = 'P0001';
  end if;

  return query
  insert into public.pets (
    owner_id,
    name,
    breed,
    size,
    age_years,
    temperament,
    coat_condition,
    allergies,
    notes
  )
  values (
    trusted_actor_id,
    requested_name,
    requested_breed,
    requested_size::public.pet_size,
    requested_age_years::smallint,
    requested_temperament,
    requested_coat_condition,
    requested_allergies,
    requested_notes
  )
  returning
    pets.id,
    pets.owner_id,
    pets.name,
    pets.breed,
    pets.size,
    pets.age_years,
    pets.temperament,
    pets.coat_condition,
    pets.allergies,
    pets.notes;
end;
$$;

revoke all on function public.kravos_create_pet(uuid, text, text, text, integer, text, text, text, text) from public;
revoke all on function public.kravos_create_pet(uuid, text, text, text, integer, text, text, text, text) from anon;
revoke all on function public.kravos_create_pet(uuid, text, text, text, integer, text, text, text, text) from authenticated;
grant execute on function public.kravos_create_pet(uuid, text, text, text, integer, text, text, text, text) to service_role;

notify pgrst, 'reload schema';
