-- Supabase installs pgcrypto in the `extensions` schema, while a plain
-- PostgreSQL development database installs it in `public` by default. The
-- lifecycle functions were written against public.digest, so provide the
-- narrow pgcrypto signature only when Supabase has no public alias.
do $$
begin
  if to_regprocedure('public.digest(text,text)') is null then
    execute $function$
      create function public.digest(input_text text, algorithm text)
      returns bytea
      language sql
      immutable
      strict
      parallel safe
      set search_path = ''
      as 'select extensions.digest(input_text, algorithm)'
    $function$;

    execute 'revoke all on function public.digest(text,text) from public, anon, authenticated';
  end if;
end;
$$;
