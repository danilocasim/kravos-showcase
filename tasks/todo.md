# Paw & Polish — Backend-First Implementation Checklist

Follow [`plan.md`](./plan.md) in order. Do not start product frontend work until **Checkpoint C** passes.

## Mandatory TDD gate (for every implementation task)

- [ ] **RED:** Add a focused behavior test first and run it; confirm the test fails for the expected reason.
- [ ] **GREEN:** Implement the minimum code/migration/policy to make that focused test pass.
- [ ] **REFACTOR:** Clean up only with tests green; rerun the focused test and then the relevant broader suite.
- [ ] Record exact targeted-test, full-suite, lint, and build results before marking the task complete.

Never implement a behavior first and add tests afterward. Use unit tests for pure logic, real database/API integration tests for backend boundaries, and Playwright only for critical browser workflows.

## Phase 0 — Product defaults and wireframe

- [x] 0. Reviewed and approved [`phase-0.md`](./phase-0.md); do not build screens.

## Phase 1 — Backend foundation (no product UI)

- [x] 1. Initialize root Next.js project and backend quality baseline.
- [x] 2. Create Supabase schema migration and booking-overlap constraint.
- [x] 3. Add RLS, application roles, and safe demo seed data.
- [x] 4. Implement server authentication verification and role guards.
- [x] **Checkpoint A:** migrations, RLS, seeds, authorization, lint, tests, and build pass.

## Phase 2 — Server booking domain (no product UI)

- [x] 5. Implement catalogue, schedules, and customer-owned pet use cases.
- [x] 6. Implement and test deterministic availability calculation.
- [x] 7. Implement atomic create, reschedule, and cancellation use cases.
- [x] 8. Add and test `Idempotency-Key` and concurrent-booking safety.
- [x] **Checkpoint B:** server use cases safely handle valid, stale, conflicting, unauthorized, and duplicate requests.

## Phase 3 — Versioned API and backend verification (no product UI)

- [x] 9. Add authenticated `/api/v1` Route Handlers using the shared booking domain.
- [x] 10. Publish/validate the API contract and verify all lifecycle HTTP flows.
- [x] **Checkpoint C:** the complete backend API works via seeded authenticated HTTP clients; start frontend only now.

## Phase 4 — Customer frontend

- [x] 11. Build sign-in/session shell and customer pet-management screens.
- [x] 12. Build booking, My Appointments, rescheduling, and cancellation screens.
- [x] **Checkpoint D:** customer booking works on mobile and desktop.

## Phase 5 — Admin frontend and release

- [ ] 13. Build the admin appointment console and run release-quality checks.
  - [x] Admin-only responsive day schedule, groomer/date filters, catalogue/team reference views, and guarded lifecycle actions.
  - [x] Durable verified-actor audit fields, RPC-only appointment transitions, customer denial, and desktop/mobile E2E coverage.
  - [x] Unit, database, concurrency, browser, contract, lint, typecheck, build, visual, and browser-static sensitive-marker checks pass locally.
  - [x] Production variables, Auth redirect URLs, migration rollout, admin provisioning, and preview checks are documented without values.
  - [ ] Run and record the deployed-preview smoke test when a preview URL and disposable accounts are available.
- [ ] **Checkpoint E:** local customer/admin product and public API gates pass; deployed-preview evidence is still required.
