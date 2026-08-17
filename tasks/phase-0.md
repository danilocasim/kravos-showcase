# Phase 0 — Paw & Polish Operating Defaults and Booking Flow

**Status:** Approved by the project owner. These are the locked Phase 0 defaults for v1; update this record explicitly before changing any of them in later phases.

## 1. Business profile

| Setting | Proposed value |
| --- | --- |
| Brand | Paw & Polish |
| Type | Single-location pet-grooming salon |
| Display location | Brooklyn, New York |
| Business timezone | `America/New_York` |
| Booking access | Authenticated customer account required |
| Supported pets | Dogs only in v1 |
| Currency | USD |
| Tax/payment | Out of scope; display the service subtotal only |

All database timestamps are UTC `timestamptz`. Convert to `America/New_York` only for customer/admin input and display.

## 2. Schedule and appointment policy

### Weekly working hours

| Day | Hours |
| --- | --- |
| Monday–Friday | 09:00–18:00 |
| Saturday | 09:00–16:00 |
| Sunday | Closed |

### Rules that the server enforces

- Appointment start times are on 15-minute boundaries.
- Every booked appointment reserves a **15-minute cleanup buffer** after its customer-facing service time.
- Services cannot extend past the groomer's working hours after including the buffer.
- Time off overrides normal hours.
- Customers may cancel or reschedule only until **24 hours before** `starts_at`; administrators may cancel at any time.
- The server calculates service duration, service subtotal, customer-facing end time, and blocked-until time. The client and agent supply IDs and a requested start only.
- The customer must explicitly confirm the final pet, service selection, groomer/any-available option, date, time, and displayed subtotal before an appointment is created.
- A slot search is advisory. The create/reschedule operation is authoritative and returns `409 SLOT_UNAVAILABLE` if the slot was taken in the meantime.
- For v1, there are no temporary booking holds, payments, notifications, waitlists, recurring appointments, or walk-ins.

### Buffer data decision

Store these distinct values for every confirmed appointment:

```text
starts_at                 # customer-facing service start
service_ends_at           # starts_at + selected-service duration
blocked_until             # service_ends_at + 15-minute buffer
```

The database overlap constraint must use `[starts_at, blocked_until)`, not only the customer-facing service interval. Snapshot the selected service durations, prices, and applied buffer on the appointment so later catalogue edits cannot change past appointments.

## 3. Catalogue

Customers may choose **one base service and zero or more compatible add-ons**. A service's duration and price are fixed in v1; do not add breed-, coat-, or size-based pricing.

### Base services

| Service | Duration | Subtotal | Description |
| --- | ---: | ---: | --- |
| Bath & Brush | 60 min | $55 | Bath, drying, brush-out, and light tidy. |
| Full Groom | 90 min | $85 | Bath, drying, haircut, brush-out, and nail trim. |
| Puppy Introduction Groom | 45 min | $45 | Gentle first grooming visit for puppies up to 12 months. |

### Add-ons

| Service | Duration | Subtotal | Compatibility |
| --- | ---: | ---: | --- |
| Nail Trim | 15 min | $15 | Bath & Brush or as a standalone express visit; not with Full Groom because it is included. |
| De-shedding Treatment | 30 min | $30 | Bath & Brush or Full Groom only. |

### Service-selection rules

- Select exactly one base service, except an express Nail Trim visit may be selected by itself.
- Add-ons may be selected only with a compatible base service.
- The customer cannot select Bath & Brush with Full Groom or Puppy Introduction Groom.
- The server validates every compatibility rule. The UI can prevent invalid choices but is never authoritative.
- `totalServiceDuration = sum(selected service durations)` and `subtotal = sum(selected service prices)`.
- `blockedUntil = startsAt + totalServiceDuration + 15 minutes`.

## 4. Groomers, qualifications, and starter schedule

All groomers work their listed default hours unless an explicit time-off record overrides them.

| Groomer | Default hours | Qualified services | Showcase note |
| --- | --- | --- | --- |
| Maya Chen | Mon–Fri 09:00–18:00; Sat 09:00–16:00 | All services | Senior groomer; demonstrates broad availability. |
| Sofia Morales | Tue–Sat 09:00–17:00 | Bath & Brush, Full Groom, Puppy Introduction Groom, Nail Trim | Specializes in small and medium dogs. |
| Liam Patel | Mon–Fri 10:00–18:00; Sat 10:00–16:00 | Bath & Brush, Nail Trim, De-shedding Treatment | Best demonstrator for add-on qualification rules. |

Create at least these demo time-off records after seed data is in place:

| Groomer | Time off | Reason | Why it exists |
| --- | --- | --- | --- |
| Maya Chen | First Wednesday of the demo month, 12:00–14:00 | Training | Tests a mid-day blackout. |
| Sofia Morales | First Saturday of the demo month | Leave | Tests a full-day blackout. |

## 5. Pet information collected

The customer may create multiple pets. A pet has:

```text
name (required)                 breed (required)
size (required: SMALL|MEDIUM|LARGE)
ageYears (required, 0–30)        temperament (optional)
coatCondition (optional)        allergies (optional)
notes (optional)
```

Pet details are operational notes for the groomer, not medical information. Do not provide veterinary advice, diagnoses, or safety triage in v1.

## 6. Low-fidelity customer booking flow

This describes required data and states—not final visual design.

```text
[1] MY PET
    Existing pet cards + "Add a pet"
    Required output: petId
         |
         v
[2] SERVICES
    Pick one base service or express nail trim; add compatible add-ons
    Show server-provided duration/subtotal
    Required output: serviceIds
         |
         v
[3] GROOMER
    Choose a qualified groomer or "Any available groomer"
    Required output: groomerId | anyAvailable
         |
         v
[4] DATE & TIME
    Choose a date range; show only server-calculated available slots
    Every any-available slot identifies the groomer it reserves
    Required output: groomerId + startsAt
         |
         v
[5] REVIEW & CONFIRM
    Show pet, services, groomer, local start/end, subtotal, cancellation rule
    Customer explicitly selects "Confirm appointment"
         |
         v
[6] CONFIRMATION
    Show booking ID, booked details, and links to My Appointments
```

### Required states and recovery paths

| Situation | Product behavior |
| --- | --- |
| No saved pet | Require creating a pet before service selection. |
| No qualified groomer | Explain that no groomer offers the selected services; allow service selection to change. |
| No slots in range | Keep selected pet/services; let the customer change date range or groomer. |
| Slot becomes unavailable at confirm | Display `SLOT_UNAVAILABLE`; retain selections and return to freshly calculated slots. |
| Session expired | Require sign-in again; do not lose non-sensitive in-progress selections if practical. |
| Customer outside cancellation cutoff | Disable customer cancel/reschedule and display the policy; direct them to contact the salon. |

## 7. Backend/API implications

These values are inputs to the schema and API contract; do not make the frontend compute them.

| Capability | Backend responsibility |
| --- | --- |
| Pet management | Enforce authenticated customer ownership. |
| Catalogue | Return active services and compatibility metadata. |
| Groomer lookup | Return qualifications and working schedule only as needed. |
| Availability | Validate selected services/pet/groomer, calculate total duration and `blocked_until`, and return slots. |
| Create/reschedule | Revalidate all rules transactionally; enforce overlap constraint and `Idempotency-Key`. |
| Cancel | Enforce role and 24-hour customer cutoff, then transition status. |

## 8. TDD acceptance examples for later phases

Implement these as failing tests before their associated implementation:

1. **Cleanup buffer:** a 09:00 Bath & Brush (60 min) for Maya blocks Maya until 10:15; 10:00 is unavailable and 10:15 is the first next valid start.
2. **Working-hours boundary:** a 90-minute Full Groom cannot start at 16:30 on a day Maya closes at 18:00, because its blocked period ends at 18:15.
3. **Time off:** Maya's training blackout removes otherwise valid Wednesday 12:00–14:00 slots.
4. **Compatibility:** Full Groom plus Nail Trim is rejected; Bath & Brush plus De-shedding Treatment is accepted.
5. **Qualification:** Liam cannot be returned or booked for Full Groom.
6. **Concurrency:** two concurrent confirmed bookings for the same groomer/start create exactly one appointment.
7. **Idempotency:** retrying a successful create request with the same `Idempotency-Key` returns the original appointment rather than a duplicate.
8. **Customer ownership:** a customer cannot read, change, or book with another customer's pet.
9. **Cancellation policy:** a customer cannot cancel 23 hours before the start; an admin can cancel it.
10. **Any available:** each returned combined slot includes the exact qualified groomer selected by the server, and confirmation books that groomer.

## 9. Phase 0 completion checklist

- [x] The business profile and timezone are accepted.
- [x] The working hours, 15-minute slot interval, and cleanup-buffer semantics are accepted.
- [x] The service catalogue and compatibility rules are accepted.
- [x] The groomers, qualifications, and demo time-off records are accepted.
- [x] The cancellation rule and account-required decision are accepted.
- [x] The low-fidelity flow and all ten TDD acceptance examples are accepted.
- [x] No changes were requested before Task 1. Future business-rule changes must first update this file.
