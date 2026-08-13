-- Paw & Polish non-sensitive demonstration catalogue.
-- This file intentionally contains no auth.users rows, customer profiles, pets,
-- appointments, credentials, tokens, API keys, or service-role values.
-- It may be rerun safely in a local development database.

insert into public.services (
  id,
  name,
  description,
  kind,
  is_standalone_eligible,
  duration_minutes,
  price_cents,
  is_active
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'Bath & Brush',
    'Bath, drying, brush-out, and light tidy.',
    'BASE',
    false,
    60,
    5500,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Full Groom',
    'Bath, drying, haircut, brush-out, and nail trim.',
    'BASE',
    false,
    90,
    8500,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Puppy Introduction Groom',
    'Gentle first grooming visit for puppies up to twelve months.',
    'BASE',
    false,
    45,
    4500,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'Nail Trim',
    'A standalone express visit or compatible add-on.',
    'ADD_ON',
    true,
    15,
    1500,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'De-shedding Treatment',
    'A coat treatment for compatible grooming services.',
    'ADD_ON',
    false,
    30,
    3000,
    true
  )
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  kind = excluded.kind,
  is_standalone_eligible = excluded.is_standalone_eligible,
  duration_minutes = excluded.duration_minutes,
  price_cents = excluded.price_cents,
  is_active = excluded.is_active;

insert into public.groomers (id, display_name, bio, is_active)
values
  (
    '20000000-0000-0000-0000-000000000001',
    'Maya Chen',
    'Senior groomer with broad service availability.',
    true
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Sofia Morales',
    'Specializes in small and medium dogs.',
    true
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'Liam Patel',
    'Focused on bath, brush, nail, and de-shedding care.',
    true
  )
on conflict (id) do update
set
  display_name = excluded.display_name,
  bio = excluded.bio,
  is_active = excluded.is_active;

insert into public.service_compatibility (base_service_id, add_on_service_id)
values
  ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005'),
  ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005')
on conflict do nothing;

insert into public.groomer_services (groomer_id, service_id)
values
  -- Maya: all services.
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005'),
  -- Sofia: Bath & Brush, Full Groom, Puppy Introduction Groom, Nail Trim.
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004'),
  -- Liam: Bath & Brush, Nail Trim, De-shedding Treatment.
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005')
on conflict do nothing;

insert into public.groomer_working_hours (id, groomer_id, iso_day_of_week, starts_at, ends_at)
values
  -- Maya: Monday-Friday 09:00-18:00; Saturday 09:00-16:00.
  ('30000000-0000-0000-0000-000000000101', '20000000-0000-0000-0000-000000000001', 1, '09:00', '18:00'),
  ('30000000-0000-0000-0000-000000000102', '20000000-0000-0000-0000-000000000001', 2, '09:00', '18:00'),
  ('30000000-0000-0000-0000-000000000103', '20000000-0000-0000-0000-000000000001', 3, '09:00', '18:00'),
  ('30000000-0000-0000-0000-000000000104', '20000000-0000-0000-0000-000000000001', 4, '09:00', '18:00'),
  ('30000000-0000-0000-0000-000000000105', '20000000-0000-0000-0000-000000000001', 5, '09:00', '18:00'),
  ('30000000-0000-0000-0000-000000000106', '20000000-0000-0000-0000-000000000001', 6, '09:00', '16:00'),
  -- Sofia: Tuesday-Saturday 09:00-17:00.
  ('30000000-0000-0000-0000-000000000201', '20000000-0000-0000-0000-000000000002', 2, '09:00', '17:00'),
  ('30000000-0000-0000-0000-000000000202', '20000000-0000-0000-0000-000000000002', 3, '09:00', '17:00'),
  ('30000000-0000-0000-0000-000000000203', '20000000-0000-0000-0000-000000000002', 4, '09:00', '17:00'),
  ('30000000-0000-0000-0000-000000000204', '20000000-0000-0000-0000-000000000002', 5, '09:00', '17:00'),
  ('30000000-0000-0000-0000-000000000205', '20000000-0000-0000-0000-000000000002', 6, '09:00', '17:00'),
  -- Liam: Monday-Friday 10:00-18:00; Saturday 10:00-16:00.
  ('30000000-0000-0000-0000-000000000301', '20000000-0000-0000-0000-000000000003', 1, '10:00', '18:00'),
  ('30000000-0000-0000-0000-000000000302', '20000000-0000-0000-0000-000000000003', 2, '10:00', '18:00'),
  ('30000000-0000-0000-0000-000000000303', '20000000-0000-0000-0000-000000000003', 3, '10:00', '18:00'),
  ('30000000-0000-0000-0000-000000000304', '20000000-0000-0000-0000-000000000003', 4, '10:00', '18:00'),
  ('30000000-0000-0000-0000-000000000305', '20000000-0000-0000-0000-000000000003', 5, '10:00', '18:00'),
  ('30000000-0000-0000-0000-000000000306', '20000000-0000-0000-0000-000000000003', 6, '10:00', '16:00')
on conflict (id) do update
set
  groomer_id = excluded.groomer_id,
  iso_day_of_week = excluded.iso_day_of_week,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at;

-- September 2026 is the fixed showcase month. New York is UTC-4 at these dates:
-- Maya's first-Wednesday training is 12:00-14:00 local (16:00-18:00 UTC), and
-- Sofia's first Saturday is a full-day local leave (04:00 UTC to 04:00 UTC).
insert into public.groomer_time_off (id, groomer_id, starts_at, ends_at, reason)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '2026-09-02 16:00:00+00',
    '2026-09-02 18:00:00+00',
    'Training'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '2026-09-05 04:00:00+00',
    '2026-09-06 04:00:00+00',
    'Leave'
  )
on conflict (id) do update
set
  groomer_id = excluded.groomer_id,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  reason = excluded.reason;
