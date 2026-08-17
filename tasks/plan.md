# Implementation Plan: Paw & Polish Booking System

## Objective

Deliver a single full-stack Next.js pet-grooming booking application. First complete its database, server-only business rules, authenticated `/api/v1` API, and backend verification. Then build customer and admin screens on top of that tested backend.

This plan follows [`../AGENTS.md`](../AGENTS.md). The frontend must not define or duplicate booking behavior: it only calls the server-side booking use cases/API already verified in earlier phases.

## Architecture decisions

- One root Next.js App Router application using TypeScript and `pnpm`.
- Supabase supplies PostgreSQL and authentication. Schema changes are versioned migrations, not dashboard-only edits.
- Next.js Route Handlers and server-only modules are the backend. `lib/booking` is the only home for booking rules.
- Supabase RLS and server-side authorization enforce customer/admin data boundaries.
- PostgreSQL, not a client-side availability check, prevents conflicting bookings.
- No product frontend is built until **Phase 4**. Phase 0 includes only a low-fidelity flow sketch to protect the API design.
- Every behavior change uses test-driven development; test evidence is a completion requirement, not optional polish.

## Mandatory test-driven workflow

For every behavior/migration/API/UI task, use this loop before proceeding to the next behavior:

1. **RED:** write a focused test for the desired externally observable behavior and run it. It must fail for the expected reason before implementation.
2. **GREEN:** make the smallest production change that makes that focused test pass.
3. **REFACTOR:** improve the code only with the focused test green, then rerun it.
4. Run the relevant broader suite before the task checkpoint. Never implement first and add tests afterward.

Test at the smallest reliable boundary: use unit tests for pure availability/validation logic; real development-database integration tests for SQL migrations, RLS, transactions, idempotency, and Route Handlers; and a limited set of Playwright E2E tests for critical UI flows. Test outcomes rather than implementation details; use deterministic fixtures and real components/dependencies where practical.

A database migration must include a repeatable database assertion for its intended constraint/policy. A bug fix starts with a failing regression test. Capture the exact test commands and results in each implementation task's delivery note.

## Dependency map

```text
Business defaults + low-fidelity booking flow
  -> Next.js/Supabase setup
  -> schema + RLS + seed data + server authentication
  -> server booking domain
  -> versioned HTTP API + backend verification
  -> customer UI
  -> admin UI + release checks
```

## Phase 0 — Product defaults and API-shaping wireframe

### Task 0: Fix operational defaults and sketch the flow

**Description:** Decide the fictional business rules that affect availability and sketch the five booking steps on paper/Figma. This is not frontend implementation; it prevents the backend from omitting information that the eventual screens need. The proposed decision record is [`phase-0.md`](./phase-0.md); update and approve it rather than creating a competing source of truth.

**Decide:** business name, IANA timezone, working hours, slot interval, buffer semantics, cancellation cutoff, service catalogue and compatibility, groomers, and service qualifications.

**Acceptance criteria:**
- [ ] The business timezone, weekly schedule, slot interval, buffer semantics, and cancellation policy are explicit.
- [ ] At least three groomers and five services have names, prices, durations, qualifications, and compatibility rules.
- [ ] A simple flow exists: pet → services → groomer/any available → available time → review/explicit confirmation.
- [ ] The Phase 0 TDD acceptance examples are approved as the first behavior tests for later tasks.

**Verification:** Approve [`phase-0.md`](./phase-0.md) before any migration is created.

**Dependency:** None.

---

## Phase 1 — Backend foundation (no product UI)

### Task 1: Create the root Next.js project and backend quality baseline

**Description:** Initialize the single root Next.js TypeScript application with `pnpm`, App Router, Tailwind, ESLint, Vitest, Playwright, Zod, date utilities, and server/browser Supabase helpers. There are no customer or admin screens in this task.

**Acceptance criteria:**
- [x] Root commands exist for `pnpm dev`, `pnpm lint`, `pnpm test`, and `pnpm build`.
- [x] Server-only and browser-safe Supabase helpers have clear module boundaries.
- [x] No FastAPI, Docker, monorepo configuration, secret value, or duplicate backend is introduced.

**Completion evidence:**
- [x] **RED:** `pnpm test -- lib/supabase/public-config.test.ts` failed because `./public-config` did not exist.
- [x] **GREEN:** the focused test passed after the public Supabase configuration validator was implemented.
- [x] `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (2 tests), `pnpm exec playwright --version` (1.62.1), and `pnpm build` all passed from the repository root.

**Dependency:** Task 0.

### Task 2: Create the Supabase schema migration

**Description:** Implement the approved [`phase-0.md`](./phase-0.md) data decisions in a versioned migration: `profiles`, `pets`, `services`, `service_compatibility`, `groomers`, `groomer_services`, `groomer_working_hours`, `groomer_time_off`, `appointments`, `appointment_services`, and idempotency records. Add indexes, foreign keys, checks, and the PostgreSQL exclusion constraint that prevents overlapping confirmed appointments for one groomer.

**Acceptance criteria:**
- [x] The migration applies cleanly to an empty development database.
- [x] `appointments.starts_at`, `appointments.service_ends_at`, and `appointments.blocked_until` use `timestamptz`; `blocked_until` includes the persisted cleanup buffer.
- [x] Services record their base/add-on kind and standalone eligibility, and compatibility is persisted and enforceable server-side.
- [x] Appointment services snapshot name, duration, and price; appointments snapshot the applied buffer.
- [x] A database-level constraint rejects two overlapping `CONFIRMED` appointments for the same groomer using `[starts_at, blocked_until)`.

**Completion evidence:**
- [x] **RED:** the schema assertions failed against a newly created empty database with `Missing required table public.profiles`.
- [x] **GREEN:** `20260812184025_initial_booking_schema.sql` applied to a fresh disposable PostgreSQL database with a minimal test-only `auth.users` dependency, and `pnpm test:db` passed.
- [x] The SQL assertions prove the 15-minute cleanup buffer, same-groomer overlap rejection over `[starts_at, blocked_until)`, boundary-touching slot acceptance, and base/add-on compatibility enforcement. Test fixtures roll back; the disposable database was removed after verification.

**Dependency:** Task 1.

### Task 3: Add RLS, roles, and non-sensitive demo seed data

**Description:** Define `CUSTOMER` and `ADMIN` application roles in `profiles`, enable RLS for every application table, create customer/admin policies, and seed a non-sensitive catalogue, groomer schedules, time off, and test fixtures.

**Acceptance criteria:**
- [x] A customer can access only their own pets and appointments.
- [x] Only admins can change catalogue, schedule, and other customers' appointments.
- [x] Seed data contains no credentials, access tokens, or service-role key.

**Completion evidence:**
- [x] **RED:** policy tests as `authenticated` customer one failed before the RLS migration with `permission denied for table pets`.
- [x] **GREEN:** a fresh disposable PostgreSQL database replayed both migrations and the demo seed; `pnpm test:db` passed as two customers and an admin using `request.jwt.claim.sub` identity simulation.
- [x] Tests prove customer ownership isolation, profile self-promotion denial, customer catalogue/schedule write denial, admin catalogue/schedule/cross-customer appointment authority, the full prior schema contract, and demo seed counts/constraints.
- [x] The seed contains only five services, three groomers, qualifications, 17 working-hour entries, and two fixed time-off records; direct checks confirmed zero seeded auth users, appointments, and idempotency records. All disposable databases were removed after verification.

**Dependency:** Task 2.

### Task 4: Implement server authentication verification and authorization guards

**Description:** Implement server-only functions that verify Supabase sessions/JWTs and derive the authenticated application profile and role. They are used by future Server Actions and Route Handlers; do not create sign-in pages yet.

**Acceptance criteria:**
- [x] The server derives customer identity from a verified session/token, never a request-body `customerId`.
- [x] Customer and admin guards have predictable `401` and `403` behavior.
- [x] Automated test setup can obtain or mock distinct customer/admin identities without committing secrets.

**Completion evidence:**
- [x] **RED:** guards tests failed before `lib/auth/guards.ts` existed; the Auth-signup profile test then failed because no profile trigger existed.
- [x] **GREEN:** 18 focused auth tests pass for missing/invalid sessions, absent/invalid profiles, customer/admin guards, role mismatch, and Supabase-client failures that fail closed.
- [x] The auth-user trigger creates a `CUSTOMER` profile while ignoring role metadata; a fresh database replay plus `pnpm test:db` proves it.
- [x] `proxy.ts` refreshes Supabase session cookies only; all actual authorization remains in server guards and RLS.

**Dependency:** Tasks 2–3.

### Checkpoint A: Backend foundation

- [x] Migrations, RLS, seeds, and server authorization checks work.
- [x] The project lint, test, and production-build commands pass.
- [x] No product UI beyond framework boilerplate has been built.

**Completion evidence:** The three migrations and demo seed replayed successfully on a fresh disposable database; `pnpm test:db` passed. `pnpm test` passed 20 tests, and `pnpm typecheck`, `pnpm lint`, and `pnpm build` passed. Local Supabase CLI validation remains blocked by an unavailable Docker Desktop daemon; equivalent migrations and policy tests ran against fresh local PostgreSQL databases with Supabase-compatible test auth primitives.

---

## Phase 2 — Server booking domain (no product UI)

### Task 5: Implement catalogue, schedule, and pet use cases

**Description:** Create server-only query/use-case functions for active services, approved base/add-on compatibility, qualified groomers, working hours, time off, and customer-owned pet CRUD. These are domain functions; they are not React components or pages.

**Acceptance criteria:**
- [x] Only active services and groomers are returned to a customer.
- [x] The server accepts exactly one base/allowed-express service and only compatible add-ons.
- [x] A groomer is eligible only when qualified for every selected service.
- [x] Pet reads and mutations enforce ownership; time off overrides standard hours.

**Completion evidence:**
- [x] **RED:** focused tests initially failed because the booking domain, Supabase adapter, authenticated composition, and public active-groomer query did not exist.
- [x] **GREEN:** 14 focused tests cover active catalogue/groomers, one-base/express selection and compatibility, all-service groomer qualification, time-off subtraction, pet validation, owner-scoped CRUD, Supabase request mapping, and verified-actor composition.
- [x] All Task 5 modules are server-only. The request factory obtains the actor exclusively through the Task 4 verified-auth guard; pet repository operations scope reads/writes to that actor ID in addition to RLS.
- [x] A fresh disposable database applied the bootstrap, all migrations, and seed; `pnpm test:db` passed.

**Dependency:** Checkpoint A.

### Task 6: Implement deterministic availability calculation

**Description:** Implement `searchAvailability` in `lib/booking`. Given selected services, a pet, optional groomer, and date range, compute valid slots from service duration, the approved buffer, schedules, time off, and confirmed appointment blocked intervals.

**Acceptance criteria:**
- [x] The server calculates total duration, subtotal, `serviceEndsAt`, and `blockedUntil`; clients cannot supply those values.
- [x] Returned slots fit working hours after their cleanup buffer and do not overlap appointment blocked intervals or time off.
- [x] UTC storage and business-timezone/DST conversion are handled at the boundaries.

**Completion evidence:**
- [x] **RED:** eight focused availability tests failed before `searchAvailability` existed; the DB test separately failed because the minimal confirmed-block function was absent.
- [x] **GREEN:** availability tests cover service-derived timing and pricing, 15-minute slot starts, cleanup buffers, working-hour boundary, time off, existing confirmed blocks, qualification, any-available groomer attribution, owned-pet enforcement, malformed/range-limited input, and `America/New_York` DST conversion.
- [x] Confirmed blocks now use a security-definer RPC that returns only groomer ID and UTC interval fields; it permits availability to see another customer's busy time without widening direct appointment reads.
- [x] A fresh disposable database replay applied all migrations and seed; the full database assertion suite passed.

**Dependency:** Task 5.

### Task 7: Implement atomic appointment lifecycle use cases

**Description:** Implement create, reschedule, and cancel operations using a database transaction/RPC or equivalent atomic operation. Each request re-checks authorization, selected-service compatibility, pet ownership, groomer qualifications, pricing, schedule, and availability immediately before mutation.

**Acceptance criteria:**
- [x] The server derives subtotal, `serviceEndsAt`, and `blockedUntil` from persisted services and the approved buffer.
- [x] A stale slot returns `409 SLOT_UNAVAILABLE`; it is never silently replaced.
- [x] Cancellation changes status to `CANCELLED` and obeys the configured cutoff.
- [x] Rescheduling uses the same atomic conflict rules as creation.

**Completion evidence:**
- [x] **RED:** lifecycle use-case tests failed before the create/reschedule/cancel boundary existed, and the database lifecycle test failed before its RPCs existed.
- [x] **GREEN:** three security-definer database functions derive `auth.uid()`, validate selection/ownership/qualification/schedule/time-off atomically, snapshot services, and rely on the exclusion constraint to convert stale conflicts to `SLOT_UNAVAILABLE`.
- [x] Integration coverage proves create snapshots timing/pricing, cross-customer pet denial, stale reschedule conflict, successful reschedule snapshot replacement, customer cutoff, and admin cutoff override.

**Dependency:** Task 6.

### Task 8: Add idempotency and concurrency safety

**Description:** Add `Idempotency-Key` support to all appointment mutations and prove correctness when retried or requested simultaneously. This is separate from availability search: a search is advisory and the mutation is authoritative.

**Acceptance criteria:**
- [x] Retrying a mutation with the same idempotency key returns the original outcome without a duplicate appointment.
- [x] Concurrent attempts for one groomer/time yield exactly one confirmed appointment.
- [x] Expired or invalid idempotency keys have documented, safe behavior.

**Completion evidence:**
- [x] **RED:** valid idempotency input was initially rejected by the lifecycle boundary, and the integration suite had no keyed RPC signature.
- [x] **GREEN:** each keyed `security definer` RPC rechecks current ownership/role authorization before serializing same actor/operation/key retries, stores an immutable successful appointment response, and replays it without repeating the mutation. Keys are nonblank opaque strings up to 255 characters.
- [x] Reusing a live key with a different canonical request yields `IDEMPOTENCY_KEY_REUSED` (`409`). Records expire after 24 hours; an expired key yields `IDEMPOTENCY_KEY_EXPIRED` (`409`) and is never recycled, preventing delayed retries from becoming fresh work.
- [x] Database assertions cover create/reschedule/cancel replay, replayed response fields, no duplicate snapshots, changed-request denial, expiry, and blocked replay after an administrator loses cross-customer authority. A guarded two-connection test observes same-key serialization and a true two-insert same-slot race, proving one success, one `SLOT_UNAVAILABLE`, and rollback of the losing idempotency record.

**Verification:** `ALLOW_DESTRUCTIVE_TEST_DATABASE=1 TEST_DATABASE_URL='postgresql://…' pnpm test:db` against a disposable Supabase-compatible database, including `pnpm test:db:concurrency`. The runner refuses non-`paw_polish_test_*`, non-`paw_polish_task*`, and non-`paw_polish_ci_*` database names.

**Dependency:** Task 7.

### Checkpoint B: Booking domain is reliable

- [x] Scripted server-side use cases can create, reschedule, and cancel a valid appointment.
- [x] Conflicting, stale, unauthorized, and duplicate requests fail safely.
- [x] No customer/admin React screens have been built.

---

## Phase 3 — Versioned API and backend verification (no product UI)

### Task 9: Expose authenticated `/api/v1` Route Handlers

**Description:** Build thin Route Handlers that validate external input, authenticate and authorize the request, invoke `lib/booking`, and return stable response/error shapes. Route Handlers must contain no duplicated availability algorithm or direct booking SQL.

**Initial endpoints:**

```text
GET    /api/v1/services
GET    /api/v1/groomers
GET    /api/v1/pets
POST   /api/v1/pets
PATCH  /api/v1/pets/{petId}
DELETE /api/v1/pets/{petId}
POST   /api/v1/availability/search
GET    /api/v1/appointments
POST   /api/v1/appointments
POST   /api/v1/appointments/{appointmentId}/reschedule
POST   /api/v1/appointments/{appointmentId}/cancel
```

**Acceptance criteria:**
- [x] Inputs validate at the route boundary and use one documented error shape.
- [x] Mutations require `Idempotency-Key` and use correct `401`, `403`, `404`, `409`, and validation responses.
- [x] Acting users are derived from verified sessions/tokens, not request identifiers.

**Completion evidence:**
- [x] **RED:** handler tests first failed because `./booking-handlers` did not exist; path-adapter tests then failed because the required `/api/v1` Route Handler files did not exist.
- [x] **GREEN:** all eleven thin authenticated Route Handlers delegate only to the shared booking domain. Request JSON, UUID path parameters, and lifecycle idempotency headers validate at the HTTP boundary; the stable error envelope is `{ "error": { "code", "message", "details" } }`.
- [x] The request factory gates every endpoint with one memoized verified Supabase actor and passes the same server-derived actor to booking use cases; neither JSON bodies nor route IDs can select a customer.
- [x] In-process Route Handler contract tests call every path using the actual HTTP validation/response adapter and cover valid, unauthenticated, validation, `403`, `404`, and `409` flows; unit and adapter tests cover user-scoped appointment lists, query scoping, and unclassified error redaction.
- [x] Final validation: `pnpm test` (12 files, 63 tests), `pnpm typecheck`, `pnpm lint`, and `pnpm build` passed. The production build lists all nine required dynamic API route entries.

**Dependency:** Checkpoint B.


### Task 10: Publish the API contract and verify the backend without screens

**Description:** Create the checked-in API contract/OpenAPI document from the implemented route schemas. Verify the whole API with seeded users, repeatable HTTP tests, and an API client such as Bruno/Postman/Playwright request fixtures. Do not start the UI until this checkpoint passes.

**Acceptance criteria:**
- [x] Every public endpoint has request, success, and error schemas plus authentication requirements.
- [x] Contract checks and HTTP tests cover the entire booking lifecycle.
- [x] The documented API matches actual responses and only exposes implemented booking operations.

**Verification:** `pnpm test:contract`, `pnpm test` (14 files, 75 tests), guarded `pnpm test:db` on a freshly replayed disposable database, `pnpm typecheck`, `pnpm lint`, and `pnpm build` passed. `doc/openapi.v1.json` describes the 11 same-origin cookie-session operations; Route Handler response tests validate both success and standard error payloads against it. The seeded HTTP composition suite verifies customer lifecycle, ownership, stale-slot/retry behavior, and the narrow admin cancellation authority.

**Dependency:** Task 9.

### Checkpoint C: Backend API is complete before frontend

- [x] A test customer can manage pets and appointments entirely through authenticated HTTP calls.
- [x] An admin can use only the intended privileged server operations.
- [x] Double-booking, stale-slot, retry, ownership, and authorization behavior are proven by tests.
- [x] The API contract is checked in and matches running endpoints.

---

## Phase 4 — Customer frontend

### Task 11: Build customer authentication and pet-management screens

**Description:** Add the sign-up, sign-in, account/session shell, and pet-management screens. Use Supabase Auth and the tested API/server actions; do not add booking logic to React components.

**Acceptance criteria:**
- [ ] Customers can sign up, sign in/out, and reach protected pages.
- [ ] Customers can list, add, edit, and delete only their pets.
- [ ] Forms have labels, inline validation, accessible error messages, loading states, and mobile layouts.

**Verification:** Playwright tests cover sign-in/out and pet management as two separate customers.

**Dependency:** Checkpoint C.

### Task 12: Build the customer booking and appointment-management experience

**Description:** Build the polished customer flow: choose/add pet → services → groomer or any available → server-calculated slot → review → explicit confirmation. Then add My Appointments, rescheduling, and cancellation views.

**Acceptance criteria:**
- [ ] The UI uses API/server responses for prices, duration, and availability; it calculates none of them itself.
- [ ] Confirmation sends an idempotency key and gives a clear recovery route for `SLOT_UNAVAILABLE`.
- [ ] A customer can view, reschedule, or cancel only their own appointments.

**Verification:** Playwright completes booking, stale-slot recovery, reschedule, and cancellation at mobile and desktop widths.

**Dependency:** Task 11.

### Checkpoint D: Customer application works without AI

- [ ] A customer can sign in, create a pet, book, view, reschedule, and cancel an appointment.
- [ ] The customer UI is accessible, responsive, and uses the established API/domain behavior.

---

## Phase 5 — Admin frontend and release verification

### Task 13: Build the minimal admin appointment console and release checks

**Description:** Build an admin-only appointment list/calendar with date and groomer filters, and safe transitions to `COMPLETED` or `CANCELLED`. Finish the non-AI booking product with security, accessibility, and deployed-preview testing.

**Acceptance criteria:**
- [ ] Customers cannot reach admin screens or execute admin API operations.
- [ ] Admin status changes follow allowed transitions and are audited.
- [ ] No secrets reach browser code, source control, logs, or API responses.
- [ ] Production variables, Supabase redirect URLs, and migration deployment steps are documented without secret values.

**Verification:** Browser-test admin access and status transitions; run full lint, unit/integration/E2E suite, production build, and deployed-preview smoke test.

**Dependency:** Checkpoint D.

### Checkpoint E: Booking system is demo-ready without AI

- [ ] Customer and admin flows work end to end.
- [ ] The public API contract is documented and tested.
- [ ] No v1 non-goal has been introduced.

---


## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Double bookings under concurrent requests | High | PostgreSQL exclusion constraint, atomic mutation, and idempotency keys |
| Incorrect timezone/DST slots | High | Decide business timezone first; store `timestamptz`; add DST tests |
| API and frontend diverge | Medium | Complete/test shared use cases and `/api/v1` before building any product UI |
| Scope creep delays the showcase | Medium | Treat payments, reminders, memberships, multi-location, Docker, FastAPI, and monorepo as non-goals |

## Open questions to resolve in Task 0

1. Which business timezone, working hours, slot interval, buffer, and cancellation cutoff will Paw & Polish use?
2. Is an account required for every booking? This plan assumes authenticated customers.
3. Are service duration and price fixed for v1, or do they vary by pet size? This plan recommends fixed catalogue values.
