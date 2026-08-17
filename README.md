# Paw & Polish

A full-stack pet-grooming booking system for customers and salon administrators.

## Stack

- Next.js App Router + TypeScript + `pnpm`
- Tailwind CSS
- Supabase PostgreSQL and Auth
- Zod validation, React Hook Form, and date-fns/date-fns-tz
- Vitest for unit/integration tests and Playwright for critical browser flows

The implementation decisions and delivery order are in [AGENTS.md](./AGENTS.md), [tasks/plan.md](./tasks/plan.md), and [tasks/todo.md](./tasks/todo.md). The approved business rules are in [tasks/phase-0.md](./tasks/phase-0.md).

## Local setup

1. Install Node.js and the `pnpm` version declared in `package.json`.
2. Install dependencies:

   ```bash
   pnpm install --frozen-lockfile
   ```

3. Copy the public Supabase variable names into a local file and supply values from your Supabase project:

   ```bash
   cp .env.example .env.local
   ```

   Do not commit `.env.local`. Do not add a Supabase service-role key to this application or browser code.

## Commands

```bash
pnpm dev          # Start the Next.js development server
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript without emitting files
pnpm test         # Run Vitest
pnpm test:contract # Validate doc/openapi.v1.json with Swagger Parser
pnpm test:watch   # Run Vitest in watch mode
pnpm test:db      # Run guarded destructive DB assertions against TEST_DATABASE_URL
pnpm test:db:concurrency # Run only the guarded two-connection DB race test
pnpm test:e2e     # Run Playwright (browser tests are added with UI work)
pnpm build        # Create a production build
```

## Database migrations

Versioned Supabase migrations live in `supabase/migrations/`:

- `20260812184025_initial_booking_schema.sql` — booking tables, constraints, and overlap protection.
- `20260812192046_rls_policies.sql` — role-based row-level security policies.
- `20260812195911_profile_creation_trigger.sql` — safe CUSTOMER profile creation on Auth signup.
- `20260813044700_confirmed_appointment_blocks.sql` — minimal confirmed busy intervals for server availability without widening appointment reads.
- `20260813050000_appointment_lifecycle.sql` — atomic authenticated create, reschedule, and cancellation RPCs with authoritative validation and snapshots.
- `20260813060000_appointment_idempotency.sql` — keyed lifecycle retries that replay the original successful response and retain the overlap constraint as the concurrency authority.
- `20260814123000_pgcrypto_digest_compatibility.sql` — schema-qualified digest compatibility for hosted and local PostgreSQL search paths.
- `20260814160000_admin_appointment_status_audit.sql` — guarded admin completion plus durable status actor/time auditing and removal of direct admin appointment writes.

The non-sensitive base catalogue is `supabase/seeds/demo_catalogue.sql`. It contains services, groomers, qualifications, hours, and time off only—never credentials, customers, pets, or appointments. Local Supabase resets load it through `supabase/config.toml`.

An opt-in, idempotent operational showcase dataset lives at `supabase/seeds/showcase_operational_data.sql`. It adds five groomers, seven services, 20 clearly labelled non-login mock customers, 30 pets, and 493 appointments with 801 service snapshots across July–September 2026. It is intentionally excluded from normal resets and must be applied only to an explicitly selected non-production showcase environment after the base catalogue.

Apply migrations to a local Supabase stack with `supabase migration up --local`, or use your approved Supabase deployment workflow for a hosted environment. Run the schema/policy assertion suite only against a **disposable development/test database** with the standard Supabase `auth` schema and `authenticated` role available:

```bash
ALLOW_DESTRUCTIVE_TEST_DATABASE=1 TEST_DATABASE_URL='postgresql://…' pnpm test:db
```

The test runner requires the explicit opt-in and refuses any database whose name is not `paw_polish_test_*`, `paw_polish_task*`, or `paw_polish_ci_*`. SQL assertions open transactions and roll back their fixtures. They verify the cleanup buffer, compatibility, RLS customer/admin boundaries, non-overlap constraint, lifecycle policy, idempotent create/reschedule/cancel replay, audited admin transitions, the minimal confirmed-appointment availability query, and demo seed data. Run `pnpm test:db:concurrency` separately with the same guarded environment to prove that exactly one same-groomer/same-slot create may succeed. Idempotency keys are opaque nonblank values up to 255 characters; successful records are retained for 24 hours, and expired keys are rejected rather than reused. A Supabase local stack requires Docker Desktop, but the application itself has no Dockerfile or Docker Compose setup.

## Authentication and roles

Supabase Auth verifies a request session on the server. The application then reads the matching `public.profiles` row for its `CUSTOMER` or `ADMIN` role; roles in JWT metadata or request bodies are never trusted. The `auth.users` signup trigger creates a `CUSTOMER` profile and ignores any supplied role metadata. Administrator assignment is a trusted operational database action until an explicit admin-management feature is designed.

The server-only auth boundary exposes `getOptionalActor`, `requireAuthenticatedActor`, and `requireAdmin`. They return `null` or raise predictable `401` / `403` errors so future Route Handlers and Server Actions can use one identity path. Direct browser table writes remain constrained by RLS.

## API v1

All `/api/v1` endpoints require a verified Supabase session. The server derives the acting user from that session and its database-backed profile; request bodies never contain a customer ID.

The machine-readable contract is [`doc/openapi.v1.json`](./doc/openapi.v1.json). Validate it with `pnpm test:contract`. It describes the implemented same-origin, cookie-session API.

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

`POST /appointments`, `/reschedule`, and `/cancel` require a nonblank `Idempotency-Key` header of at most 255 characters. All errors use this shape; `details` is a field-level validation array and is empty for domain errors:

```json
{
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "This appointment time is no longer available.",
    "details": []
  }
}
```

The API returns `401` for missing/invalid sessions, `403` for authorized-but-forbidden lifecycle changes, `404` for inaccessible pets/appointments, `409` for booking and idempotency conflicts, and `422` for malformed request input.

`pnpm test` includes deterministic HTTP composition tests with two seeded authenticated customers. They exercise service and groomer discovery, customer-owned pet CRUD, availability, create/retry, appointment listing, stale-slot rejection, rescheduling, cancellation, and ownership isolation through the real Route Handler and server factory. The separate guarded database suite proves the PostgreSQL RPC, RLS, and concurrent-insert guarantees when a disposable Supabase-compatible database is available.

## Deployment

Production variables, Supabase Auth callback configuration, migration rollout, admin provisioning, and the preview smoke checklist are documented in [`doc/deployment.md`](./doc/deployment.md). The runbook contains placeholders only and forbids application access to service-role or database credentials.

## Development rules

Every behavior change follows RED → GREEN → REFACTOR: write and run a focused failing test, implement the minimum change, refactor with the test green, then run the relevant broader checks. See [AGENTS.md](./AGENTS.md) for the complete architecture, security, and TDD rules.

Phase 1 intentionally contains no customer or admin booking interface. It establishes the project, testing tools, and Supabase client boundaries before database and booking-domain work begins.
