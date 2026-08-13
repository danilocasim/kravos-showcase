\set ON_ERROR_STOP on

begin;

-- A new Supabase Auth user must receive a CUSTOMER application profile without
-- trusting raw user metadata for authorization.
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
  '00000000-0000-4000-8000-000000000601',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'new-customer@pawandpolish.example',
  'not-a-real-password',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"display_name":"New Customer","role":"ADMIN"}'::jsonb,
  now(),
  now()
);

do $$
begin
  if not exists (
    select 1
    from public.profiles
    where id = '00000000-0000-4000-8000-000000000601'
      and role = 'CUSTOMER'
      and display_name = 'New Customer'
  ) then
    raise exception 'Expected auth user creation to create a CUSTOMER profile';
  end if;
end;
$$;

rollback;
