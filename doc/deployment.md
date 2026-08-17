# Production and preview deployment

This runbook deploys the non-AI Paw & Polish booking product. It intentionally contains variable names and placeholders only—never project URLs, keys, passwords, tokens, or customer data.

## Application variables

Configure these values in the hosting provider separately for Preview and Production:

| Variable | Source | Exposure |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API settings | Public by design |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase project API settings | Public by design; RLS remains the authority |

Do **not** configure a Supabase service-role key, database URL, access token, or database password in the Next.js application. The browser and Next.js server both use the publishable key plus the verified customer/admin session. Deployment tooling may require a database credential or Supabase access token in its own protected CI secret store; it must not be exposed to the application build, preview environment, logs, or repository.

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
5. Verify that all local migration versions appear in the target migration history and that no unexpected schema diff remains.
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
- Check desktop and mobile layouts, keyboard focus, dialog focus return, browser console errors, and unexpected horizontal scrolling.
- Inspect the built browser assets and network responses for secrets. Only the Supabase URL and publishable key may be public.
- Run `pnpm test`, guarded database/concurrency tests against a disposable database, `pnpm test:e2e`, `pnpm test:contract`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` against the release candidate.

Record the preview URL, deployment identifier, migration versions, tester, timestamp, and pass/fail evidence in the release system rather than this repository. A local run does not substitute for the deployed-preview smoke test.
