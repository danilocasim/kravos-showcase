# Admin console — UI kit

Minimal admin surface from `tasks/plan.md` Task 13: the day's appointments, groomer filter,
safe transitions to `COMPLETED` / `CANCELLED`, groomer schedules, and the read-only catalogue.

Open `index.html`.

| File | Contents |
| --- | --- |
| `Console.jsx` | Shell, stat tiles, appointment table, groomers, services, cancel dialog |
| `data.jsx` | Wednesday 2 September 2026 — the fixed showcase day |

## What to click
- Filter by groomer; toggle **Show cancelled**; clear filters from the empty state.
- Mark a confirmed row completed (check icon) or cancel it (x icon → dialog).
- **Groomers** shows Maya's 12:00–2:00 PM training blackout; **Services** shows base vs add-on kinds.

Admins can cancel inside the customer's 24-hour cutoff — that authority is stated in the page,
and the real product audits it.
