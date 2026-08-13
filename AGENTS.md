# Pet Grooming Booking System — Architecture Guide

## Purpose

This document is the source of truth for implementation decisions in this repository. It keeps the first release focused: a reliable pet-grooming booking system that can later be controlled through a Kravos widget and agent.

[`tasks/phase-0.md`](tasks/phase-0.md) contains the proposed operational defaults, booking-flow wireframe, and TDD acceptance examples. Its Phase 0 checklist must be approved before Task 1; once approved, it is the source of truth for business hours, catalogue, buffers, service compatibility, and cancellation behavior.

When a requirement is absent or conflicts with this document or an approved Phase 0 brief, do not invent a feature, provider setting, Kravos capability, or security model. Ask for clarification or record a clearly labelled TODO.

## Locked v1 decisions

- Build **one full-stack Next.js application** using TypeScript and `pnpm`.
- Use **Supabase** for hosted PostgreSQL and customer/admin authentication.
- The application backend is **Next.js server-side code**: Route Handlers, Server Actions, and server-only domain modules.
- Do **not** add FastAPI, Docker, a monorepo, microservices, Redis, queues, payments, notifications, memberships, or multi-location support in v1.
- Kravos is an **external embedded widget and agent platform**. It is not the application's database or booking backend.
- The customer booking UI must work completely without the Kravos widget.

Add FastAPI only if the booking API becomes an independently deployed product for multiple external clients. Add Docker only when deployment or local-environment parity creates a demonstrated need.

## System boundary

```text
Customer or admin browser
          |
          v
Next.js app (pages, forms, dashboard, API routes)
          |
          v
Server-only booking service
          |
          v
Supabase: Auth + PostgreSQL

Embedded Kravos widget -> Kravos agent platform -> protected Next.js integration routes
                                                     |
                                                     v
                                            same booking service
```

The browser must never directly write booking tables. Kravos must never receive a database URL, Supabase service-role key, or unrestricted database access.

## Code layout

Keep one application at the repository root:

```text
app/                         # Pages, layouts, Route Handlers, Server Actions
app/api/v1/                  # Versioned external/integration HTTP routes
components/                  # Presentational React components
lib/booking/                 # Server-only booking domain and use cases
lib/auth/                    # Session and role checks
lib/supabase/                # Server/client Supabase helpers
```

UI code and Route Handlers may call functions in `lib/booking/`. They must not duplicate availability, pricing, authorization, or appointment-state rules. Do not make server code call this application's own HTTP routes; call the shared booking service directly.

## Core data model

Use these entities only unless a new requirement requires more:

- `profiles`: application profile linked to a Supabase Auth user; includes the application role (`CUSTOMER` or `ADMIN`).
- `pets`: owned by one customer; name, breed, size, age, temperament, coat condition, allergies, and notes.
- `services`: name, description, `BASE`/`ADD_ON` kind, standalone-eligibility flag, duration in minutes, active flag, and base price.
- `service_compatibility`: allowed base-service/add-on pairs; do not encode compatibility only in the UI.
- `groomers`: name, bio, active flag, and optional display information.
- `groomer_services`: the services each groomer is qualified to perform.
- `groomer_working_hours` and `groomer_time_off`: schedule inputs.
- `appointments`: customer, pet, groomer, `starts_at`, `service_ends_at`, `blocked_until`, status, applied buffer, and audit timestamps. `blocked_until` includes the cleanup buffer and is used for conflict detection.
- `appointment_services`: selected services for each appointment; preserve the service name, duration, and price snapshot used at booking time.

Use UTC `timestamptz` values in the database. Convert to the configured business timezone only at the display and input boundary.

## Non-negotiable booking rules

1. The server calculates appointment duration, subtotal, `service_ends_at`, and `blocked_until` from persisted service data and the approved cleanup buffer. The client and agent do not provide those values or a final price.
2. The server validates one base service (or an allowed standalone express service), permitted add-ons, and every base-service/add-on compatibility pair.
3. A groomer may only be booked for services assigned through `groomer_services` and within working hours.
4. Availability is calculated from working hours, time off, service duration, configured buffers, and active appointments.
5. PostgreSQL must enforce that active appointments for the same groomer cannot overlap over `[starts_at, blocked_until)`. Application checks alone are not sufficient.
6. A booking request must be transactional. If the slot becomes unavailable after a search, return `409 SLOT_UNAVAILABLE`; do not silently move the booking to another time.
7. For v1, create an appointment only after the customer explicitly confirms it. Do not implement temporary booking holds. Holds require expiry and cleanup semantics and are not needed yet.
8. Customers can read or change only their own pets and appointments. Admin actions require an `ADMIN` role.

Start with `CONFIRMED`, `CANCELLED`, and `COMPLETED` appointment statuses. Add `NO_SHOW`, payment, refunds, or waitlists only when those are actual requirements.

## Test-driven development (mandatory)

Every behavior change follows **RED → GREEN → REFACTOR**. This applies to server domain rules, Route Handlers, database constraints/RLS policies, and UI behavior.

1. Write one focused, behavior-based test first and run it to confirm it fails for the expected missing behavior. For a bug, the first test must reproduce the bug.
2. Write the smallest production change that makes the focused test pass.
3. Refactor only while the focused test remains green; then run the relevant broader suite.
4. Do not write implementation first and add tests afterward. A test that already passes before the implementation change is not RED evidence.

Use the smallest reliable test at each boundary: unit tests for pure booking logic; real development-database integration tests for migrations, RLS, transactions, idempotency, and API routes; Playwright tests only for critical browser flows. Prefer real implementations and deterministic fixtures over mocks. Before declaring work complete, run the targeted test, then the full relevant suite, lint, and production build. For browser work, also verify the critical flow in a real browser.

## HTTP API contract

Use `/api/v1` and a single documented error shape:

```json
{
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "This appointment time is no longer available.",
    "details": []
  }
}
```

Initial integration-safe operations:

```text
GET  /api/v1/services
GET  /api/v1/groomers
POST /api/v1/availability/search
POST /api/v1/appointments
POST /api/v1/appointments/{appointmentId}/reschedule
POST /api/v1/appointments/{appointmentId}/cancel
```

All mutation requests must validate input at the route boundary and support an `Idempotency-Key` header. This prevents an agent retry, browser retry, or network retry from creating duplicate appointments.

The actual JSON schemas, authentication fields, and OpenAPI requirements for Kravos are not yet verified. Do not invent them. Define them from current Kravos platform documentation when integration work begins.

## Kravos integration (later phase)

Kravos is a client of the booking system, not a second implementation of it.

1. A user signs in through the booking application; the widget does not collect or handle the user's password.
2. The application creates a short-lived, signed widget/session context linked to the authenticated customer.
3. The Kravos agent calls only narrow, protected booking operations: find availability, create a confirmed appointment after explicit consent, reschedule, and cancel.
4. The server derives the acting customer from verified context. Never trust a `customerId` supplied in an agent request body.
5. The agent gets only the data needed for the task. It has no admin endpoints, database credentials, or cross-customer access.

If Kravos requires a separate endpoint adapter or an OpenAPI document, implement that adapter as thin Route Handlers that call `lib/booking`; do not fork booking logic.

## Deliberate non-goals

Do not add these in v1 unless the user explicitly changes scope:

- AI-generated grooming or medical advice
- Payment processing, refunds, tips, or invoices
- SMS/email reminders
- Recurring bookings, memberships, packages, waitlists, or reviews
- Multiple business tenants or locations
- Native mobile applications
- A separate FastAPI service, Docker, or a monorepo

## Implementation order

1. Fix business defaults and make a simple booking-flow wireframe; do not build screens yet.
2. Create the Next.js/Supabase foundation: migrations, RLS, authentication verification, roles, and the booking-overlap constraint.
3. Build and test the server-only booking service: pets, catalogue, schedules, availability, create, reschedule, and cancel.
4. Build, document, and test the authenticated `/api/v1` endpoints from those shared server use cases.
5. Verify the complete backend with seeded identities and HTTP tests before creating the product UI.
6. Build the customer UI: sign-in, pet management, booking, and appointment management.
7. Build the admin schedule and appointment UI, then perform release-quality checks.
8. Add the Kravos widget and agent configuration only after its current platform contract is verified.
