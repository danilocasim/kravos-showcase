# Production and preview deployment

This runbook deploys the non-AI Paw & Polish booking product. It intentionally contains variable names and placeholders only—never project URLs, keys, passwords, tokens, or customer data.

## Application variables

Configure these values in the hosting provider separately for Preview and Production:

| Variable                                    | Source                                   | Exposure                                                                   |
| ------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                  | Supabase project API settings            | Public by design                                                           |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`      | Supabase project API settings            | Public by design; RLS remains the authority                                |
| `NEXT_PUBLIC_KRAVOS_APP_URL`                | Kravos hosted web-app origin             | Public by design; HTTPS except for loopback development                    |
| `NEXT_PUBLIC_KRAVOS_WIDGET_API_KEY`         | Signed-in concierge agent chat key       | Public by design; agent-scoped, chat-only, origin-restricted, rate-limited |
| `NEXT_PUBLIC_KRAVOS_LANDING_WIDGET_API_KEY` | Public grooming-guide agent chat key     | Public by design; agent-scoped, chat-only, origin-restricted, rate-limited |
| `SUPABASE_SERVICE_ROLE_KEY`                 | Supabase project API settings            | Secret; server-only access for the Kravos booking integration              |
| `KRAVOS_BOOKING_TOOL_BEARER`                | A dedicated high-entropy generated value | Secret; must match the tenant-scoped Kravos custom-tool environment value  |

The two widget keys deliberately identify separate agents: the landing-page key has no booking tools or account access, while the signed-in key loads only inside the verified `CUSTOMER` layout. Both keys are visible in browser markup by design, so their agent scope, exact origin allowlist, chat-only permission, and rate limit are the security boundary. They must never be reused for server-to-server operations.

The service-role key is now required only by the server-only `/api/v1/integrations/kravos/*` composition. It must never use a `NEXT_PUBLIC_` prefix or appear in browser code, logs, responses, source control, or preview artifacts. All ordinary customer/admin routes continue to use the publishable key plus the verified Supabase session. Database URLs, access tokens, and database passwords remain deployment-only secrets and must not be exposed to the application.

Configure the matching bearer in the Kravos runtime as `KRAVOS_CUSTOM_TOOL_<TENANT_ID>_BOOKING_BEARER`. Custom tools store only this environment reference; they do not store the raw value. Rotate the booking bearer independently if either deployment boundary is exposed.

For the temporary showcase demo, only the name-based `booking/options`, `booking/confirm`, and `booking/reschedule` integration routes also accept `X-Paw-Polish-Concierge: v1`. This deliberately weaker mode exists so the hosted Kravos runtime can demonstrate booking when its environment secret is unavailable; remove the marker scheme before treating the deployment as production.

## Supabase Auth URL configuration

In **Authentication → URL Configuration** for each Supabase project:

1. Set **Site URL** to the canonical HTTPS application origin for that environment.
2. Add the exact production callback URL: `https://<production-host>/auth/confirm`.
3. Add the exact callback URL for the preview selected for acceptance testing: `https://<preview-host>/auth/confirm`.
4. For local development only, allow `http://localhost:3000/auth/confirm` and/or the exact loopback origin used by the developer.
5. Remove retired preview callback URLs after testing. Do not use an unrestricted redirect wildcard.

The application validates its own `next` parameter and accepts only same-origin absolute paths, but the Supabase allowlist is still required at the external auth boundary.

## Migration deployment

Migrations in `supabase/migrations/` are ordered and immutable deployment inputs. In particular, deploy the appointment lifecycle/idempotency functions, the pgcrypto digest compatibility migration, and `20260814160000_admin_appointment_status_audit.sql` before testing the admin console.

1. Back up the target database according to the project recovery policy.
2. Link the Supabase CLI to the intended project using the project reference from the protected deployment environment.
3. Review the target and migration history, then run the CLI's migration dry run.
4. Apply pending migrations using the approved `supabase db push` workflow.
5. Verify that all local migration versions, including `20260817120000_kravos_booking_lifecycle_wrappers.sql`, appear in the target migration history and that no unexpected schema diff remains.
6. Load the reviewed, non-sensitive base catalogue only through the approved environment seed process. The opt-in operational showcase dataset contains persistent mock booking history and is for non-production showcase environments only. Never run a local reset command against a hosted project.
7. Create an Auth account for the operator, then assign `public.profiles.role = 'ADMIN'` in a trusted operational database session. Never accept the role from signup metadata or a browser request.
8. Run schema assertions only on a disposable test database—never point `TEST_DATABASE_URL` at Preview or Production.

The admin audit migration removes direct admin appointment update/delete policies. `CONFIRMED → COMPLETED` and `CONFIRMED → CANCELLED` therefore remain behind guarded database functions that stamp `status_changed_by` and `status_changed_at`.

## Preview smoke test

Use disposable customer and admin accounts and non-production data:

- Sign up or sign in as a customer; add, edit, and safely delete a pet.
- Complete a multi-service booking, then reschedule and cancel it from My Appointments.
- Sign in as an admin; confirm `/admin` shows the correct business-local day and groomer filters.
- Prove a customer is redirected away from `/admin`.
- Complete one confirmed appointment and cancel another; verify both rows display their new state.
- In a trusted database console, verify `status_changed_by` is the admin Auth user and `status_changed_at` is populated for both changes.
- Confirm the cancelled result appears in the owning customer's My Appointments view.
- Exercise the documented `/api/v1` contract with a customer session; verify cross-customer access remains unavailable.
- Exercise all ten `/api/v1/integrations/kravos/*` operations with the configured bearer and a disposable customer: resolve, context, catalogue, availability, ID-based create/reschedule/cancel, and name-based options/confirm/reschedule. Confirm an invalid bearer returns `401` and an exact mutation retry does not duplicate work.
- Check desktop and mobile layouts, keyboard focus, dialog focus return, browser console errors, and unexpected horizontal scrolling.
- Inspect the built browser assets and network responses for secrets. Only the Supabase URL, Supabase publishable key, Kravos app URL, and two constrained widget keys may be public.
- Run `pnpm test`, guarded database/concurrency tests against a disposable database, `pnpm test:e2e`, `pnpm test:contract`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` against the release candidate.

Record the preview URL, deployment identifier, migration versions, tester, timestamp, and pass/fail evidence in the release system rather than this repository. A local run does not substitute for the deployed-preview smoke test.
