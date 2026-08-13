-- Create a database-backed CUSTOMER profile for each Supabase Auth signup.
-- Application roles never come from raw user metadata or a browser request.

create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_display_name text;
begin
  new_display_name := nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');

  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    'CUSTOMER',
    coalesce(new_display_name, split_part(new.email, '@', 1), 'Customer')
  );

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public;

drop trigger if exists auth_user_profile_created on auth.users;
create trigger auth_user_profile_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
