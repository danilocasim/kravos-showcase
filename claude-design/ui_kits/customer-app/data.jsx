// Demo data mirrors supabase/seeds/demo_catalogue.sql and tasks/phase-0.md exactly.
const PP_SERVICES = [
  { id: 's1', name: 'Bath & Brush', description: 'Bath, drying, brush-out, and light tidy.', kind: 'BASE', durationMinutes: 60, priceCents: 5500 },
  { id: 's2', name: 'Full Groom', description: 'Bath, drying, haircut, brush-out, and nail trim.', kind: 'BASE', durationMinutes: 90, priceCents: 8500 },
  { id: 's3', name: 'Puppy Introduction Groom', description: 'Gentle first grooming visit for puppies up to twelve months.', kind: 'BASE', durationMinutes: 45, priceCents: 4500 },
  { id: 's4', name: 'Nail Trim', description: 'A standalone express visit or compatible add-on.', kind: 'ADD_ON', durationMinutes: 15, priceCents: 1500 },
  { id: 's5', name: 'De-shedding Treatment', description: 'A coat treatment for compatible grooming services.', kind: 'ADD_ON', durationMinutes: 30, priceCents: 3000 }
];

// base -> allowed add-ons (service_compatibility)
const PP_COMPATIBILITY = { s1: ['s4', 's5'], s2: ['s5'], s3: [] };

const PP_GROOMERS = [
  { id: 'g1', name: 'Maya Chen', bio: 'Senior groomer with broad service availability', hours: 'Mon–Fri 9:00 AM–6:00 PM · Sat 9:00 AM–4:00 PM', services: ['s1','s2','s3','s4','s5'] },
  { id: 'g2', name: 'Sofia Morales', bio: 'Specializes in small and medium dogs', hours: 'Tue–Sat 9:00 AM–5:00 PM', services: ['s1','s2','s3','s4'] },
  { id: 'g3', name: 'Liam Patel', bio: 'Bath, brush, nail, and de-shedding care', hours: 'Mon–Fri 10:00 AM–6:00 PM · Sat 10:00 AM–4:00 PM', services: ['s1','s4','s5'] }
];

const PP_PETS = [
  { id: 'p1', name: 'Biscuit', breed: 'Cockapoo', size: 'MEDIUM', ageYears: 3, temperament: 'Calm', allergies: 'Oatmeal shampoo' },
  { id: 'p2', name: 'Moose', breed: 'Bernese Mountain Dog', size: 'LARGE', ageYears: 5, temperament: 'Nervous with clippers' }
];

// Availability shown as the server would return it (America/New_York, 15-min starts).
const PP_DAYS = [
  { date: '2026-09-02', label: 'Wed 2 Sep', slots: [
    { time: '9:00 AM', groomer: 'Maya' }, { time: '9:45 AM', groomer: 'Sofia' }, { time: '10:15 AM', groomer: 'Maya' },
    { time: '11:30 AM', groomer: 'Sofia' }, { time: '12:00 PM', groomer: 'Maya', unavailable: true },
    { time: '1:45 PM', groomer: 'Sofia' }, { time: '2:15 PM', groomer: 'Maya' }, { time: '3:30 PM', groomer: 'Maya' }
  ] },
  { date: '2026-09-03', label: 'Thu 3 Sep', slots: [
    { time: '9:15 AM', groomer: 'Sofia' }, { time: '10:00 AM', groomer: 'Maya' }, { time: '11:45 AM', groomer: 'Maya' },
    { time: '1:00 PM', groomer: 'Sofia' }, { time: '2:30 PM', groomer: 'Sofia' }, { time: '4:00 PM', groomer: 'Maya' }
  ] },
  { date: '2026-09-05', label: 'Sat 5 Sep', slots: [], emptyReason: 'Sofia is on leave and Maya is fully booked.' }
];

const PP_APPOINTMENTS = [
  { id: 'APT-8F3C21', dateLabel: 'Wed 2 Sep', timeLabel: '10:15 AM', endTimeLabel: '11:45 AM', petName: 'Biscuit', groomerName: 'Maya Chen', services: ['Full Groom'], subtotalCents: 8500, status: 'CONFIRMED', changeable: true },
  { id: 'APT-77B0A9', dateLabel: 'Thu 27 Aug', timeLabel: '9:00 AM', endTimeLabel: '10:00 AM', petName: 'Moose', groomerName: 'Liam Patel', services: ['Bath & Brush','De-shedding Treatment'], subtotalCents: 8500, status: 'CONFIRMED', changeable: false },
  { id: 'APT-21D4E7', dateLabel: 'Fri 7 Aug', timeLabel: '2:15 PM', endTimeLabel: '3:00 PM', petName: 'Biscuit', groomerName: 'Sofia Morales', services: ['Puppy Introduction Groom'], subtotalCents: 4500, status: 'COMPLETED' },
  { id: 'APT-11A0C4', dateLabel: 'Tue 21 Jul', timeLabel: '11:30 AM', endTimeLabel: '12:30 PM', petName: 'Moose', groomerName: 'Maya Chen', services: ['Bath & Brush'], subtotalCents: 5500, status: 'CANCELLED' }
];

const ppMoney = (cents) => '$' + (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);

Object.assign(window, { PP_SERVICES, PP_COMPATIBILITY, PP_GROOMERS, PP_PETS, PP_DAYS, PP_APPOINTMENTS, ppMoney });
