-- Exposes minimal confirmed appointment blocks for server-side availability.
-- This security-definer function intentionally returns no customer, pet, or
-- appointment identifiers. Direct appointment RLS remains ownership-scoped.

create function public.list_confirmed_appointment_blocks(
  target_groomer_id uuid,
  range_starts_at timestamptz,
  range_ends_at timestamptz
)
returns table (
  groomer_id uuid,
  starts_at timestamptz,
  blocked_until timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    appointment.groomer_id,
    appointment.starts_at,
    appointment.blocked_until
  from public.appointments appointment
  join public.groomers groomer on groomer.id = appointment.groomer_id
  where appointment.groomer_id = target_groomer_id
    and appointment.status = 'CONFIRMED'
    and groomer.is_active
    and appointment.starts_at < range_ends_at
    and appointment.blocked_until > range_starts_at
  order by appointment.starts_at;
$$;

revoke all on function public.list_confirmed_appointment_blocks(
  uuid,
  timestamptz,
  timestamptz
) from public;
grant execute on function public.list_confirmed_appointment_blocks(
  uuid,
  timestamptz,
  timestamptz
) to authenticated;
