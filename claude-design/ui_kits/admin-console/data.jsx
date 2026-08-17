// Admin demo data — Wednesday 2 September 2026, the fixed showcase day.
const ADMIN_APPTS = [
  { id: 'APT-8F3C21', time: '9:00 AM', end: '10:00 AM', groomer: 'Maya Chen', customer: 'Jordan Reyes', pet: 'Biscuit', petMeta: 'Cockapoo · Medium', services: ['Bath & Brush'], subtotalCents: 5500, status: 'CONFIRMED' },
  { id: 'APT-4C09B2', time: '9:45 AM', end: '11:15 AM', groomer: 'Sofia Morales', customer: 'Priya Raman', pet: 'Ollie', petMeta: 'Shih Tzu · Small', services: ['Full Groom'], subtotalCents: 8500, status: 'CONFIRMED' },
  { id: 'APT-77B0A9', time: '10:15 AM', end: '11:45 AM', groomer: 'Maya Chen', customer: 'Dana Whitfield', pet: 'Moose', petMeta: 'Bernese · Large', services: ['Bath & Brush','De-shedding Treatment'], subtotalCents: 8500, status: 'CONFIRMED' },
  { id: 'APT-2100FE', time: '11:00 AM', end: '11:15 AM', groomer: 'Liam Patel', customer: 'Sam Okafor', pet: 'Pixel', petMeta: 'Corgi · Medium', services: ['Nail Trim'], subtotalCents: 1500, status: 'COMPLETED' },
  { id: 'APT-9D51AA', time: '1:45 PM', end: '2:30 PM', groomer: 'Sofia Morales', customer: 'Elena Novak', pet: 'Juno', petMeta: 'Poodle puppy · Small', services: ['Puppy Introduction Groom'], subtotalCents: 4500, status: 'CONFIRMED' },
  { id: 'APT-11A0C4', time: '2:15 PM', end: '3:45 PM', groomer: 'Maya Chen', customer: 'Tomás Ruiz', pet: 'Bandit', petMeta: 'Aussie · Large', services: ['Full Groom'], subtotalCents: 8500, status: 'CANCELLED' },
  { id: 'APT-56E7C1', time: '3:30 PM', end: '4:30 PM', groomer: 'Liam Patel', customer: 'Aisha Bello', pet: 'Nori', petMeta: 'Beagle · Medium', services: ['Bath & Brush'], subtotalCents: 5500, status: 'CONFIRMED' }
];

const ADMIN_GROOMERS = [
  { name: 'Maya Chen', hours: '9:00 AM – 6:00 PM', services: 'All services', note: 'Training 12:00–2:00 PM' },
  { name: 'Sofia Morales', hours: '9:00 AM – 5:00 PM', services: 'Bath & Brush, Full Groom, Puppy Intro, Nail Trim', note: null },
  { name: 'Liam Patel', hours: '10:00 AM – 6:00 PM', services: 'Bath & Brush, Nail Trim, De-shedding', note: null }
];

Object.assign(window, { ADMIN_APPTS, ADMIN_GROOMERS });
