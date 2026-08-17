# Customer app — UI kit

Clickable recreation of the approved Phase 0 customer flow. Fake data only; every rule the
real product enforces server-side is *displayed* here, never computed.

Open `index.html`.

## Screens
| File | Screen |
| --- | --- |
| `SignIn.jsx` | Email/password sign-in beside a solid spruce value panel |
| `Pets.jsx` | My pets list, add-pet dialog, operational-notes disclaimer |
| `Booking.jsx` | Five steps (pet → services → groomer → date & time → review) plus the confirmation screen |
| `Appointments.jsx` | Upcoming / past tabs, reschedule + cancel, 24-hour cutoff lock |
| `app.jsx` | Root state: view switching, toasts, cancel/confirm side effects |
| `data.jsx` | Catalogue, groomers, pets, availability and appointments copied from the seed data |

## What to click
1. Header → **Book a visit** → pick Biscuit → **Full Groom** (watch Nail Trim disable with a reason) → add De-shedding → groomer step (Liam disables — not qualified) → pick a time → review, tick the confirmation box, **Confirm appointment**.
2. **My appointments** → cancel the confirmed visit (dialog + toast). The second visit is inside the 24-hour cutoff, so it shows the locked note instead of actions.
3. **My pets** → **Add a pet**.
4. Account menu → sign out to reach the sign-in screen.
