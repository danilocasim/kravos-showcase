# Phase 4 — Customer frontend (Tasks 11 → 12)

## Context

`tasks/plan.md` Checkpoint C is complete: migrations, RLS, the server booking domain, `/api/v1`, and the OpenAPI contract are all built and tested, but the app has **no product UI** — `app/page.tsx` renders one line of text and `app/globals.css` is a single `@import "tailwindcss";`.

Phase 4 builds the customer-facing product on that tested backend: **Task 11** (auth + pet management), then **Task 12** (booking wizard, My Appointments, reschedule, cancel). Per the request, Task 11 is completed and verified in full before Task 12 begins.

`claude-design/` is an untracked design system authored for this exact product — tokens, 30 component specs, and clickable recreations of every screen in `ui_kits/customer-app/`. It is the visual source of truth.

**Outcome:** Checkpoint D — a customer can sign in, create a pet, book, view, reschedule, and cancel with an accessible, responsive interface.

## Decisions (confirmed)

1. **Data path:** Server Components read via `createSupabaseBookingUseCases()`; all mutations and the interactive availability search are **Server Actions**. App code never calls `/api/v1`, and `/api/v1` remains the authenticated booking API. (AGENTS.md: _"Do not make server code call this application's own HTTP routes"_.)
2. **Styling:** `claude-design/tokens/*.css` copied verbatim as the source of truth, exposed to Tailwind v4 via `@theme inline`. Components are `.tsx` using Tailwind utilities + `var()`. Responsive variants supply the mobile layouts the design system lacks. Fonts via `next/font/google`, not the Google `@import`.
3. **E2E:** local `supabase start` (Docker + CLI 2.113.0 confirmed working), `supabase db reset` applies the 6 migrations + demo seed, real test customers created with the local service-role key.
4. **UI testing:** presentation logic extracted into pure node-testable modules with focused Vitest tests; Playwright for browser flows. No jsdom, no Testing Library.

## Blocking gaps found in existing code

Verified directly. All must be fixed via TDD before the screens that need them.

|        | Gap                                                                                                                                                                                                                                                                                   | Evidence | Fix                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| **G1** | `listServiceCompatibility` exists on `BookingRepository` ([use-cases.ts:190](lib/booking/use-cases.ts:190)) but is **not** in the object `createBookingUseCases` returns ([:1050-1064](lib/booking/use-cases.ts:1050)). Step 2 needs it to disable add-ons with a reason.             | verified | Passthrough use case.                                                                          |
| **G2** | **No way to read an appointment's services.** `appointment_services` is never queried anywhere in `lib/`; `Appointment` carries no services; `rescheduleAppointment` **requires** `selectedServiceIds`. **Reschedule is impossible and `AppointmentCard` has no title without this.** | verified | Add `BookingRepository.listAppointmentServices(ids)` + use case `listMyAppointmentServices()`. |
| **G3** | `appointments.pet_id` is `on delete restrict` ([schema:163](supabase/migrations/20260812184025_initial_booking_schema.sql:163)) but `deletePetByOwner` does a bare `.delete()` — deleting a booked pet throws a raw DB error.                                                         | verified | `PetInUseError` (`PET_IN_USE`, 409) mapping PG `23503`.                                        |
| **G4** | [`lib/supabase/server.ts:25`](lib/supabase/server.ts:25) `setAll` calls `cookieStore.set` with no `try/catch`. Next throws on cookie writes during an RSC render — every protected page 500s on token refresh (`jwt_expiry = 3600`, so it only appears after ~1h).                    | verified | `try/catch`; `proxy.ts` is what actually persists the refresh.                                 |
| **G5** | `businessTimeZone` / `cleanupBufferMinutes` / `slotIntervalMinutes` are private consts in a `server-only` module ([use-cases.ts:8-11](lib/booking/use-cases.ts:8)). Client formatters can't import them.                                                                              | verified | Extract to pure `lib/booking/business-time.ts`.                                                |
| **G6** | `AuthenticatedActor` is `{id, role}`; `profiles.display_name` exists and the signup trigger fills it. Adding a field would break 5 test files.                                                                                                                                        | verified | New `lib/auth/profile.ts` → `getCurrentProfile()`.                                             |

Two contract facts that drive the design:

- **The cutoff is `<=`** (`starts_at <= now() + interval '24 hours'` at [lifecycle:325](supabase/migrations/20260813050000_appointment_lifecycle.sql:325) and [idempotency:418](supabase/migrations/20260813060000_appointment_idempotency.sql:418)). Changeable **iff `startsAt > now + 24h`**; exactly 24h is locked.
- **Local `enable_confirmations = false`** ([config.toml:203](supabase/config.toml:203)), hosted defaults to on. Sign-up must branch on `data.session === null`. Password auth has no PKCE code, so the route is `app/auth/confirm/route.ts` (`verifyOtp`), **not** `/auth/callback`.

---

## Task 10.5 — Design foundation

No screens. Exists so Task 11's first RED test can render something.

**Domain/infra prerequisites, each RED → GREEN:**

|     | RED test                                                                                                            | GREEN                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| F1  | `lib/supabase/server.test.ts` → `"ignores cookie writes that Next.js rejects during a Server Component render"`     | `try/catch` in `setAll` (G4)                                                          |
| F2  | `lib/booking/business-time.test.ts` → `"exposes the approved business timezone, cleanup buffer, and slot interval"` | pure `lib/booking/business-time.ts`; `use-cases.ts` imports it (G5)                   |
| F3  | `lib/booking/pet-schema.test.ts` → 4 tests                                                                          | pure `lib/booking/pet-schema.ts`; `use-cases.ts` imports it — **no rule duplication** |
| F4  | `lib/auth/profile.test.ts` → 2 tests                                                                                | `lib/auth/profile.ts` (`server-only`) `getCurrentProfile()` (G6)                      |

**Tokens:** copy the 7 token files verbatim to `styles/tokens/` (repo root, so nothing reads as a route and the mirror to `claude-design/tokens/` stays 1:1). `fonts.css` is **deliberately not copied** — `next/font` replaces it.

**`app/globals.css`:** `@import "tailwindcss"` + the 7 token files (`base.css` as `layer(base)` so utilities beat element defaults — see R11) + a `:root` block remapping `--font-display/-sans/-mono` onto the `next/font` variables + `@theme inline` + a base layer adding `dialog::backdrop` (scrim + blur) and a `prefers-reduced-motion` block.

**`@theme inline` mapping:** colour ramps and semantic aliases → `--color-*`; type scale → `--text-*` (deliberately overriding Tailwind's defaults so `text-base` is 15px); `--radius-*`, `--shadow-*`, `--ease-*`, `--container-*`, `--font-weight-*`, `--tracking-*`, `--leading-*`; plus `--spacing-card/-card-lg/-field-x/-field-y` for the off-scale composites. Left as raw `var()`: control heights (`h-(--control-h-md)`), `--hit-target-min`, `--header-h`, durations, `--focus-ring`, `--scrim`. **The composed type roles stay arbitrary properties — `[font:var(--type-h2)]`** — they are CSS `font` shorthand with no Tailwind namespace, and still need `tracking-tight`/`tracking-snug` alongside (shorthand does not reset letter-spacing). Plain spacing uses Tailwind's native scale (same 4px base); the design's `--space-7..12` are off-scale (32/40/48/64/80/96) and get a mapping comment rather than a theme key, so `p-7` never silently means 32px.

**`app/layout.tsx`:** `Bricolage_Grotesque` / `Plus_Jakarta_Sans` / `JetBrains_Mono` from `next/font/google` (all three accept `weight: "variable"`), variables on `<html>`, plus a skip link as the first `<body>` child. Every layout below renders `<main id="main-content">`.

**Icons:** `pnpm add lucide-react` — the design system states its 51 SVGs _are_ Lucide, the icons contain no hooks so they render in Server Components, and Next already lists the package in `optimizePackageImports`. Wrapped by `components/core/icon.tsx` with a kebab-name registry so call sites keep the design contract (and the wrapper is the fallback seam if the dependency is rejected).

**Gate:** `pnpm test` (75 existing + F1–F4), `pnpm lint`, `pnpm typecheck`, `pnpm build`, then load `/` and confirm fonts and `--bg-page` render.

---

## Component port strategy

```
components/core/{icon,button,icon-button,badge,status-pill,card,alert,empty-state,logotype}.tsx
components/forms/{field,input,textarea,select,checkbox,choice-card}.tsx
components/navigation/{app-header,step-indicator,tab-links}.tsx
components/feedback/{dialog,toast}.tsx
components/booking/{pet-card,service-option,groomer-option,time-slot-picker,price-summary,appointment-card}.tsx
```

Build only what each task needs. Task 11: icon, button, icon-button, badge, card, alert, empty-state, logotype, field, input, textarea, select, app-header, dialog, toast, pet-card. Task 12 adds: status-pill, checkbox, choice-card, service-option, groomer-option, time-slot-picker, price-summary, appointment-card, step-indicator, tab-links. **Not built in Phase 4:** `SideNav` (admin, Task 13), `Radio`, `Switch`, `Tooltip`.

**~20 of the 30 stay Server Components** because hover/active/focus become Tailwind variants rather than the reference's `useState`. `"use client"` only for: `dialog`, `toast`, `time-step`, `review-step`, the form wrappers using `useActionState`, and submit buttons using `useFormStatus`.

**Deliberate deviations from the reference `.jsx`, all closing stated a11y gaps:**

- `choice-card` becomes a **real `<input>` inside a `<label>`** with `sr-only peer` + `has-[:checked]:` / `has-[:disabled]:` / `has-[:focus-visible]:` variants — not `<div role="radio" tabIndex={0}>`. Gets native roving tabindex, arrow keys, `aria-checked`, form submission, and needs no hooks. Same for `checkbox` and each slot in `time-slot-picker`.
- `Tabs` becomes `tab-links`: two `<Link href="?tab=…">` with `aria-current="page"`, styled as the design's underline tabs. Sidesteps the roving-tabindex gap, gives Playwright deep links, keeps the page a Server Component. Not `role="tablist"` with links.
- `dialog` uses native `<dialog>` + `showModal()` → focus trap, Escape, focus restore, top layer for free.
- `field` wires `aria-describedby`/`aria-invalid` through a tested pure helper `lib/ui/field-ids.ts`.
- `app-header` nav uses `<Link aria-current>`; active state passed as a prop, not `usePathname` (which would force `"use client"`).
- `appointment-card` takes `dateLabel: {weekday, day, month}` from the tested formatter, not a string it splits on spaces.
- `icon-button` is `h-11 w-11 sm:h-9 sm:w-9` to honour the 44px minimum tap target.

---

## Task 11 — Auth + pet management

Pure modules first, each RED before any screen exists:

- `lib/ui/auth/credentials.ts` — form-data parsing, field errors keyed by input name (4 tests)
- `lib/ui/error-messages.ts` — domain code → customer message, following the voice rules (what happened + what we kept + what to do next, machine code carried separately for the mono line) (6 tests, incl. `SLOT_UNAVAILABLE`, `CANCELLATION_CUTOFF_PASSED`, `PET_IN_USE`, `IDEMPOTENCY_KEY_EXPIRED`, unknown-code fallback)
- `lib/ui/auth/supabase-auth-errors.ts` — provider error → app code, never leaking the provider message (5 tests)
- `lib/ui/field-ids.ts` (4 tests)
- `lib/ui/pet-form.ts` — `FormData` → `lib/booking/pet-schema.ts`, `ZodError.issues` → `Record<inputName, message>`. **No new validation rules** (6 tests)

**Increments** (each RED → GREEN → REFACTOR):

|       | RED (E2E unless noted)                                                                                                                                                                        | Files                                                                                                                                   |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 11.2  | `"signs a customer in and lands on my appointments"`                                                                                                                                          | `app/(auth)/{layout,actions}.tsx`, `sign-in/{page,sign-in-form}.tsx`, `submit-button.tsx`; `app/page.tsx` → `redirect("/appointments")` |
| 11.3  | `"signs the customer out and returns them to sign in"`                                                                                                                                        | `app/(app)/layout.tsx` (guard + header), `app/(app)/actions.ts`                                                                         |
| 11.4  | `"creates an account and signs the new customer straight in"`                                                                                                                                 | `sign-up/{page,sign-up-form}.tsx`, `app/auth/confirm/route.ts`                                                                          |
| 11.6  | `"shows the empty state when the customer has no pets"`                                                                                                                                       | `app/(app)/pets/page.tsx`                                                                                                               |
| 11.7  | `"adds a pet and shows it in the list"`                                                                                                                                                       | `pets/actions.ts`, `pets/pet-form-dialog.tsx`                                                                                           |
| 11.8  | `"edits a pet's breed and shows the new value"`                                                                                                                                               | reuse dialog in `mode="edit"`                                                                                                           |
| 11.9  | unit `"reports a pet that still has appointments as PET_IN_USE"`, then `"refuses to remove a pet that has an appointment and explains why"` + `"removes a pet the customer has never booked"` | G3 fix + `pets/delete-pet-dialog.tsx`                                                                                                   |
| 11.10 | `"keeps each customer's pets private"` + mobile dialog spec                                                                                                                                   | responsive classes only                                                                                                                 |

**Server Action contract** (the pattern for all of Phase 4):

```ts
export type ActionResult =
  | { status: "success" }
  | { status: "pending"; code: string; message: string } // e.g. EMAIL_CONFIRMATION_REQUIRED
  | {
      status: "error";
      code: string;
      message: string;
      fieldErrors?: Readonly<Record<string, string>>;
    };
```

Actions never throw domain errors. `redirect()` is called **after** the try/catch (or as the terminal statement of a specific catch branch) — `redirect` throws `NEXT_REDIRECT` and a broad catch silently swallows it. Shared mapper `app/action-error.ts` mirrors `isDomainError` in [booking-handlers.ts:263](lib/api/v1/booking-handlers.ts:263). Client forms use `useActionState` for errors and `useFormStatus` for the loading state, with a `useEffect` focusing the first invalid control.

**Security note for the PR:** the `(app)` layout guard is a UX redirect only. Real authorization is `requireAuthenticatedActor` inside every use case plus RLS.

**Gate:** targeted tests → `pnpm test` → `pnpm lint` → `pnpm typecheck` → `pnpm build` → `pnpm test:e2e` (both projects) → manual browser pass.

---

## Task 12 — Booking, appointments, reschedule, cancel

### Wizard architecture: URL-as-state

One route `app/(app)/book/page.tsx`, entire selection in `searchParams`:

```
/book?intent=<uuid>&step=services&petId=…&baseServiceId=…&addOnServiceId=…
     &groomerId=any|<uuid>&startsOn=…&endsOn=…&startsAt=<ISO>
```

Chosen over client `useReducer` because: **the subtotal and duration can only come from the server** — the sticky rail is a Server Component calling `resolveServiceSelection(ids)`, so no client code path could compute a price (the AGENTS.md non-negotiable); refresh/back-button and sign-in bounce preserve selections (a Phase 0 recovery requirement); steps 1–3 work without client JS; stale-slot recovery becomes a redirect; Playwright can deep-link any step. Untrusted params are a non-issue — everything is re-validated server-side and finally by the RPC.

```
app/(app)/book/page.tsx, actions.ts, summary-rail.tsx, mobile-subtotal-bar.tsx
app/(app)/book/steps/{pet,services,groomer}-step.tsx   # Server
app/(app)/book/steps/{time,review}-step.tsx            # "use client"
app/(app)/book/confirmed/[appointmentId]/page.tsx
app/(app)/appointments/{page,actions}.tsx, cancel-dialog.tsx
app/(app)/appointments/[appointmentId]/reschedule/{page,actions}.tsx
```

### 12.0 — Domain additions (own commit, before any UI)

`listServiceCompatibility()` passthrough (G1); `AppointmentServiceSnapshot` type + `BookingRepository.listAppointmentServices()` + `listMyAppointmentServices()` (G2), with the Supabase query gated by RLS as a second boundary. **Adding to `BookingRepository` breaks four in-memory fakes** (`use-cases.test.ts`, `availability.test.ts`, `lifecycle.test.ts`, `backend-http.integration.test.ts`) — land the interface change and `[]` stubs as one commit, confirm green, _then_ write the RED behaviour test, so the typecheck noise doesn't obscure the RED signal. **No `/api/v1`, `lib/api/v1/*`, or `doc/openapi.v1.json` changes** — `BookingApiUseCases` is structural and unaffected.

### 12.1 — Pure modules (all under `lib/ui/`, node env)

`format/money.ts` (`$55` not `$55.00`) · `format/duration.ts` · `format/datetime.ts` · `booking/slot-days.ts` · `booking/add-on-availability.ts` · `booking/wizard-state.ts` · `booking/step-gate.ts` · `booking/change-window.ts` · `booking/appointment-view.ts` · `booking/summary.ts` · `lib/booking/idempotency-key.ts`

Highest-value tests:

- `datetime`: `"attributes a late-evening instant to the business day, not the UTC day"` (`2026-09-03T01:00:00Z` → `Wed 2 Sep`, `9:00 PM`); `"keeps eastern daylight and standard offsets distinct across the change"`; `"splits a day into the weekday, day, and month tokens the appointment card needs"`.
- `slot-days`: **`"collapses slots that share a start instant across groomers into one time"`** — `searchAvailability` emits one slot per qualified groomer, so 10:15 AM otherwise renders three identical buttons; plus `"keeps the exact ISO start instant on each rendered time"`.
- `add-on-availability`: selectability derived **only** from the server's `ServiceCompatibility[]`; the "Already included in Full Groom" wording is a presentation-only override map keyed by service name — a content string, never a rule.
- `change-window`: **`"blocks a change exactly twenty-four hours before the start"`** — matches the RPC's `<=`.
- `step-gate`: deliberately dumb; the rules stay in `resolveServiceSelection`, this only gates the button.

### 12.2–12.9 — Increments

|      | RED (E2E)                                                                                                                                                                                        | Notes                                                                                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12.1 | `"starts a booking and lists the customer's pets"` / `"asks the customer to add a pet before booking when they have none"`                                                                       | `startBookingAction` mints `intent` and redirects                                                                                                          |
| 12.2 | `"disables Nail Trim with a written reason once Full Groom is chosen"` / `"shows the server subtotal and duration in the summary rail"`                                                          | incompatible options stay **visible**                                                                                                                      |
| 12.3 | `"disables a groomer who is not qualified and names the service"`                                                                                                                                | `listActiveGroomers` for the visible list, `listQualifiedGroomers` for the enabled set                                                                     |
| 12.4 | `"shows server-calculated times grouped by day"` / `"shows nothing bookable for a Sunday range"` / `"changes the date range and refreshes the times"`                                            | RSC does first paint; range changes + "Refresh times" call `searchAvailabilityAction` in `useTransition`; both render the same `groupSlotsIntoDays` output |
| 12.5 | `"confirms a booking and shows the reference on the confirmation screen"`                                                                                                                        | review checkbox gates submit; hidden `bookingIntentId`                                                                                                     |
| 12.6 | `"lists the customer's upcoming appointments with their services"` / `"moves cancelled visits to the past tab"` / `"locks a visit inside the twenty-four-hour window and shows the salon phone"` | needs G2                                                                                                                                                   |
| 12.7 | `"cancels an upcoming visit and frees the slot"`                                                                                                                                                 | `Dialog tone="danger"` + nested warning `Alert`, per the design                                                                                            |
| 12.8 | `"reschedules a visit to a new time"` / `"refuses to reschedule a visit inside the cutoff"`                                                                                                      | **no reschedule screen was designed** — reuse `time-step.tsx` with groomer pinned and services from the snapshot                                           |
| 12.9 | all three specs under `mobile-chromium`                                                                                                                                                          | `grid-cols-1 lg:grid-cols-[1fr_320px]`, rail `lg:order-2`, `sticky bottom-0 lg:hidden` subtotal bar, step labels `hidden sm:inline`                        |

### Idempotency key lifecycle

The RPC fingerprints a canonical request ([idempotency:236,382,531](supabase/migrations/20260813060000_appointment_idempotency.sql:236)); same key + same fingerprint replays, different fingerprint → `IDEMPOTENCY_KEY_REUSED`. A failed mutation **rolls the idempotency record back**, so a key consumed by a failure is free again.

```
idempotencyKey = `${operationPrefix}:${intentId}:${sha256(canonicalRequest)}`
```

`intentId` is a `crypto.randomUUID()` nonce — the only part the client supplies — living **in the URL** (`?intent=`) for confirm and reschedule so a refresh of the review step replays rather than duplicates, and in component state for the cancel dialog (which unmounts on close). The hash half is computed **server-side inside the Server Action** from the same validated payload sent to the RPC, sorted identically, so key and fingerprint can never disagree. Result: retries replay; any change to pet/groomer/instant/services changes the key so a changed request never hits `IDEMPOTENCY_KEY_REUSED`; two genuinely distinct bookings get different nonces and the second correctly loses to the exclusion constraint. `IDEMPOTENCY_KEY_EXPIRED` is a first-class state — `Alert tone="warning"` + a "Start again" button that mints a fresh nonce while preserving selections.

### `SLOT_UNAVAILABLE` recovery

`confirmAppointmentAction` catches the code and redirects to `?step=time&error=SLOT_UNAVAILABLE` with `startsAt` dropped and **everything else preserved**. The step-4 RSC then re-runs `searchAvailability` with the unchanged pet/services/groomer — so the times shown are freshly recalculated by the server, not a cached list — and renders the designed block above the picker:

```tsx
<Alert
  tone="danger"
  title="That time was just booked"
  code="SLOT_UNAVAILABLE"
  action={<RefreshTimesButton />}
>
  We kept your pet and services. Pick another time to finish booking.
</Alert>
```

The step indicator sits back on "Date & time" with 1–3 complete; the summary rail still shows pet, services, groomer, subtotal and duration. Retry uses the same `intentId` with a different `startsAt`, so the key changes and no reuse error occurs.

---

## E2E infrastructure

```bash
supabase start && supabase db reset
```

`db.seed.sql_paths` already points at `demo_catalogue.sql`, and `site_url` is already `http://127.0.0.1:3000` — matching Playwright's `baseURL`, so `emailRedirectTo` works unchanged.

```
e2e/load-env.ts              # 12-line dependency-free .env.local parser, imported first in playwright.config.ts
e2e/fixtures/{supabase-admin,test-users,seed,dates,auth}.ts
e2e/global-setup.ts
e2e/{auth,pets,booking,reschedule-cancel,stale-slot}.spec.ts
```

`SUPABASE_SERVICE_ROLE_KEY` and `E2E_CUSTOMER_PASSWORD` go in `.env.local` (already gitignored via `.env*` / `!.env.example`). **No `NEXT_PUBLIC_` prefix**, so Next cannot inline the key into a client bundle; read only by `e2e/fixtures/`, never imported by `app/` or `lib/`. `.env.example` gets the names with a warning, no values.

**Authentication: sign in through the UI per test, not `storageState`.** `enable_refresh_token_rotation = true` with `refresh_token_reuse_interval = 10` means a saved refresh token is rotated on first use and the next test loading that file is signed out. Per-test sign-in costs ~1s and removes a whole class of flake, and continuously exercises Task 11's required two-customer flow.

**Determinism** (today is 2026-08-14, a Friday):

- Range = the Mon–Sat two weeks out (`nextBookableWeek`, its own Vitest file) — inside the 31-day window, well outside the 24h cutoff, never Sunday-only.
- **Always click the first available time**, never a hardcoded one, so slots consumed by an earlier test or the other project don't break the spec.
- "No slots" recovery uses **the next Sunday** — every groomer's working hours are ISO days 1–6, so zero slots is guaranteed by the schema with no seeding.
- The locked (inside-cutoff) appointment can't be produced through the RPC deterministically; **insert it directly with the service-role client** at `now + 2h` (verified safe — `appointments` has no working-hours constraint).
- **Do not depend on the seed's September-2026 time-off rows** — they are pinned to a month that drifts into the past; `seed.ts` upserts its own now-relative row if needed.
- Stale-slot: read `groomerId`/`startsAt` from the review form's hidden inputs, service-role-insert a conflicting `CONFIRMED` row at exactly that groomer and instant, then click Confirm. The exclusion constraint raises `SLOT_UNAVAILABLE`, which [supabase-repository.ts:258](lib/booking/supabase-repository.ts:258) already translates. Cleaned up in `afterEach`. (Two-browser-context variant is the documented fallback.)

**`playwright.config.ts`:** add `import "./e2e/load-env"`, `globalSetup`, `fullyParallel: false`, `workers: 1` (shared local DB), a `mobile-chromium` project (`devices["Pixel 7"]`), and `webServer.timeout: 120_000` (Turbopack cold compile exceeds the 60s default).

**Known coverage gap to record:** the "no qualified groomer" recovery state is **unreachable with the seed** — Maya Chen is qualified for all five services. Covered by a Vitest test on the groomer-step view builder; E2E covers the adjacent reachable case (Liam disabled with "Not qualified for Full Groom").

---

## Risks

|        | Risk                                                                                                                               | Mitigation                                                                                                                                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1     | `cookies().set` throws during RSC render (G4) — intermittent 500s only after ~1h of session age, near-invisible in a short E2E run | F1. `proxy.ts` needs **no other change**: its matcher already covers every route, and its deliberate absence of authorization is correct.                                                                         |
| R2     | `redirect()` inside `try/catch` silently swallowed                                                                                 | House rule + doc comment in `app/action-error.ts`; one E2E assertion per redirecting action                                                                                                                       |
| R3     | `Date` across the Server Action boundary                                                                                           | **Server Actions accept and return plain view models with ISO strings.** One mapper per shape, mirroring `toAvailabilityResponse`. Formatters take strings.                                                       |
| R4     | Timezone at the display boundary — `toLocaleString` uses the _browser's_ zone, giving hydration mismatches and a wrong day         | Everything through `formatInTimeZone(iso, businessTimeZone, …)` on both server and client, from the single F2 constant. Never `toLocaleString`, never `new Date().getHours()`. Explicit March/November DST tests. |
| R5     | Duplicate slots per instant (one per qualified groomer)                                                                            | `groupSlotsIntoDays` collapses with a deterministic groomer pick                                                                                                                                                  |
| R6     | `BookingRepository` change breaks 4 fakes at once, obscuring RED                                                                   | Interface + stubs as their own green commit first                                                                                                                                                                 |
| R7     | RSC/client creep making the whole wizard `"use client"` — the exact AGENTS.md violation                                            | Only 5 files are `"use client"`. Convention: no file under `components/booking/` performs arithmetic on `priceCents` or `durationMinutes`.                                                                        |
| R8     | Next 16 async `params`/`searchParams`                                                                                              | `await` on the first line of every page; `wizard-state.ts` normalizes `string \| string[] \| undefined` with a test per arity                                                                                     |
| R11    | `base.css` fights Tailwind Preflight — unlayered, it beats every utility and `text-muted` stops working                            | Import as `layer(base)`; verify a `<p className="text-muted">` is actually muted                                                                                                                                  |
| R13/14 | Two projects contending for slots; `storageState` vs token rotation                                                                | `workers: 1` + first-available-slot; per-test UI sign-in                                                                                                                                                          |
| R15    | `enable_confirmations` differs local vs hosted                                                                                     | Branch on `data.session === null`; ship `/auth/confirm`; document both in the README                                                                                                                              |

---

## Verification

**Task 11 gate:** `pnpm test` → `pnpm lint` → `pnpm typecheck` → `pnpm build` → `pnpm test:e2e` (both projects) → manual browser pass: sign-up → sign-in → add/edit/delete pet → sign-out.

**Task 12 gate:** the same, **plus `pnpm test:contract`** to prove `/api/v1` and `doc/openapi.v1.json` are untouched, plus a manual browser pass at 1280 and 390 widths covering book → confirm → reschedule → cancel.

Record exact commands and results in the `tasks/plan.md` completion-evidence blocks and tick `tasks/todo.md` items 11, 12, and Checkpoint D. Both gates are hard: Task 12 does not begin until Task 11's gate passes.

# Phase 4 — Customer frontend (Tasks 11 → 12)

## Context

`tasks/plan.md` Checkpoint C is complete: migrations, RLS, the server booking domain, `/api/v1`, and the OpenAPI contract are all built and tested, but the app has **no product UI** — `app/page.tsx` renders one line of text and `app/globals.css` is a single `@import "tailwindcss";`.

Phase 4 builds the customer-facing product on that tested backend: **Task 11** (auth + pet management), then **Task 12** (booking wizard, My Appointments, reschedule, cancel). Per the request, Task 11 is completed and verified in full before Task 12 begins.

`claude-design/` is an untracked design system authored for this exact product — tokens, 30 component specs, and clickable recreations of every screen in `ui_kits/customer-app/`. It is the visual source of truth.

**Outcome:** Checkpoint D — a customer can sign in, create a pet, book, view, reschedule, and cancel with an accessible, responsive interface.

## Decisions (confirmed)

1. **Data path:** Server Components read via `createSupabaseBookingUseCases()`; all mutations and the interactive availability search are **Server Actions**. App code never calls `/api/v1`, and `/api/v1` remains the authenticated booking API. (AGENTS.md: _"Do not make server code call this application's own HTTP routes"_.)
2. **Styling:** `claude-design/tokens/*.css` copied verbatim as the source of truth, exposed to Tailwind v4 via `@theme inline`. Components are `.tsx` using Tailwind utilities + `var()`. Responsive variants supply the mobile layouts the design system lacks. Fonts via `next/font/google`, not the Google `@import`.
3. **E2E:** local `supabase start` (Docker + CLI 2.113.0 confirmed working), `supabase db reset` applies the 6 migrations + demo seed, real test customers created with the local service-role key.
4. **UI testing:** presentation logic extracted into pure node-testable modules with focused Vitest tests; Playwright for browser flows. No jsdom, no Testing Library.

## Blocking gaps found in existing code

Verified directly. All must be fixed via TDD before the screens that need them.

|        | Gap                                                                                                                                                                                                                                                                                   | Evidence | Fix                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| **G1** | `listServiceCompatibility` exists on `BookingRepository` ([use-cases.ts:190](lib/booking/use-cases.ts:190)) but is **not** in the object `createBookingUseCases` returns ([:1050-1064](lib/booking/use-cases.ts:1050)). Step 2 needs it to disable add-ons with a reason.             | verified | Passthrough use case.                                                                          |
| **G2** | **No way to read an appointment's services.** `appointment_services` is never queried anywhere in `lib/`; `Appointment` carries no services; `rescheduleAppointment` **requires** `selectedServiceIds`. **Reschedule is impossible and `AppointmentCard` has no title without this.** | verified | Add `BookingRepository.listAppointmentServices(ids)` + use case `listMyAppointmentServices()`. |
| **G3** | `appointments.pet_id` is `on delete restrict` ([schema:163](supabase/migrations/20260812184025_initial_booking_schema.sql:163)) but `deletePetByOwner` does a bare `.delete()` — deleting a booked pet throws a raw DB error.                                                         | verified | `PetInUseError` (`PET_IN_USE`, 409) mapping PG `23503`.                                        |
| **G4** | [`lib/supabase/server.ts:25`](lib/supabase/server.ts:25) `setAll` calls `cookieStore.set` with no `try/catch`. Next throws on cookie writes during an RSC render — every protected page 500s on token refresh (`jwt_expiry = 3600`, so it only appears after ~1h).                    | verified | `try/catch`; `proxy.ts` is what actually persists the refresh.                                 |
| **G5** | `businessTimeZone` / `cleanupBufferMinutes` / `slotIntervalMinutes` are private consts in a `server-only` module ([use-cases.ts:8-11](lib/booking/use-cases.ts:8)). Client formatters can't import them.                                                                              | verified | Extract to pure `lib/booking/business-time.ts`.                                                |
| **G6** | `AuthenticatedActor` is `{id, role}`; `profiles.display_name` exists and the signup trigger fills it. Adding a field would break 5 test files.                                                                                                                                        | verified | New `lib/auth/profile.ts` → `getCurrentProfile()`.                                             |

Two contract facts that drive the design:

- **The cutoff is `<=`** (`starts_at <= now() + interval '24 hours'` at [lifecycle:325](supabase/migrations/20260813050000_appointment_lifecycle.sql:325) and [idempotency:418](supabase/migrations/20260813060000_appointment_idempotency.sql:418)). Changeable **iff `startsAt > now + 24h`**; exactly 24h is locked.
- **Local `enable_confirmations = false`** ([config.toml:203](supabase/config.toml:203)), hosted defaults to on. Sign-up must branch on `data.session === null`. Password auth has no PKCE code, so the route is `app/auth/confirm/route.ts` (`verifyOtp`), **not** `/auth/callback`.

---

## Task 10.5 — Design foundation

No screens. Exists so Task 11's first RED test can render something.

**Domain/infra prerequisites, each RED → GREEN:**

|     | RED test                                                                                                            | GREEN                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| F1  | `lib/supabase/server.test.ts` → `"ignores cookie writes that Next.js rejects during a Server Component render"`     | `try/catch` in `setAll` (G4)                                                          |
| F2  | `lib/booking/business-time.test.ts` → `"exposes the approved business timezone, cleanup buffer, and slot interval"` | pure `lib/booking/business-time.ts`; `use-cases.ts` imports it (G5)                   |
| F3  | `lib/booking/pet-schema.test.ts` → 4 tests                                                                          | pure `lib/booking/pet-schema.ts`; `use-cases.ts` imports it — **no rule duplication** |
| F4  | `lib/auth/profile.test.ts` → 2 tests                                                                                | `lib/auth/profile.ts` (`server-only`) `getCurrentProfile()` (G6)                      |

**Tokens:** copy the 7 token files verbatim to `styles/tokens/` (repo root, so nothing reads as a route and the mirror to `claude-design/tokens/` stays 1:1). `fonts.css` is **deliberately not copied** — `next/font` replaces it.

**`app/globals.css`:** `@import "tailwindcss"` + the 7 token files (`base.css` as `layer(base)` so utilities beat element defaults — see R11) + a `:root` block remapping `--font-display/-sans/-mono` onto the `next/font` variables + `@theme inline` + a base layer adding `dialog::backdrop` (scrim + blur) and a `prefers-reduced-motion` block.

**`@theme inline` mapping:** colour ramps and semantic aliases → `--color-*`; type scale → `--text-*` (deliberately overriding Tailwind's defaults so `text-base` is 15px); `--radius-*`, `--shadow-*`, `--ease-*`, `--container-*`, `--font-weight-*`, `--tracking-*`, `--leading-*`; plus `--spacing-card/-card-lg/-field-x/-field-y` for the off-scale composites. Left as raw `var()`: control heights (`h-(--control-h-md)`), `--hit-target-min`, `--header-h`, durations, `--focus-ring`, `--scrim`. **The composed type roles stay arbitrary properties — `[font:var(--type-h2)]`** — they are CSS `font` shorthand with no Tailwind namespace, and still need `tracking-tight`/`tracking-snug` alongside (shorthand does not reset letter-spacing). Plain spacing uses Tailwind's native scale (same 4px base); the design's `--space-7..12` are off-scale (32/40/48/64/80/96) and get a mapping comment rather than a theme key, so `p-7` never silently means 32px.

**`app/layout.tsx`:** `Bricolage_Grotesque` / `Plus_Jakarta_Sans` / `JetBrains_Mono` from `next/font/google` (all three accept `weight: "variable"`), variables on `<html>`, plus a skip link as the first `<body>` child. Every layout below renders `<main id="main-content">`.

**Icons:** `pnpm add lucide-react` — the design system states its 51 SVGs _are_ Lucide, the icons contain no hooks so they render in Server Components, and Next already lists the package in `optimizePackageImports`. Wrapped by `components/core/icon.tsx` with a kebab-name registry so call sites keep the design contract (and the wrapper is the fallback seam if the dependency is rejected).

**Gate:** `pnpm test` (75 existing + F1–F4), `pnpm lint`, `pnpm typecheck`, `pnpm build`, then load `/` and confirm fonts and `--bg-page` render.

---

## Component port strategy

```
components/core/{icon,button,icon-button,badge,status-pill,card,alert,empty-state,logotype}.tsx
components/forms/{field,input,textarea,select,checkbox,choice-card}.tsx
components/navigation/{app-header,step-indicator,tab-links}.tsx
components/feedback/{dialog,toast}.tsx
components/booking/{pet-card,service-option,groomer-option,time-slot-picker,price-summary,appointment-card}.tsx
```

Build only what each task needs. Task 11: icon, button, icon-button, badge, card, alert, empty-state, logotype, field, input, textarea, select, app-header, dialog, toast, pet-card. Task 12 adds: status-pill, checkbox, choice-card, service-option, groomer-option, time-slot-picker, price-summary, appointment-card, step-indicator, tab-links. **Not built in Phase 4:** `SideNav` (admin, Task 13), `Radio`, `Switch`, `Tooltip`.

**~20 of the 30 stay Server Components** because hover/active/focus become Tailwind variants rather than the reference's `useState`. `"use client"` only for: `dialog`, `toast`, `time-step`, `review-step`, the form wrappers using `useActionState`, and submit buttons using `useFormStatus`.

**Deliberate deviations from the reference `.jsx`, all closing stated a11y gaps:**

- `choice-card` becomes a **real `<input>` inside a `<label>`** with `sr-only peer` + `has-[:checked]:` / `has-[:disabled]:` / `has-[:focus-visible]:` variants — not `<div role="radio" tabIndex={0}>`. Gets native roving tabindex, arrow keys, `aria-checked`, form submission, and needs no hooks. Same for `checkbox` and each slot in `time-slot-picker`.
- `Tabs` becomes `tab-links`: two `<Link href="?tab=…">` with `aria-current="page"`, styled as the design's underline tabs. Sidesteps the roving-tabindex gap, gives Playwright deep links, keeps the page a Server Component. Not `role="tablist"` with links.
- `dialog` uses native `<dialog>` + `showModal()` → focus trap, Escape, focus restore, top layer for free.
- `field` wires `aria-describedby`/`aria-invalid` through a tested pure helper `lib/ui/field-ids.ts`.
- `app-header` nav uses `<Link aria-current>`; active state passed as a prop, not `usePathname` (which would force `"use client"`).
- `appointment-card` takes `dateLabel: {weekday, day, month}` from the tested formatter, not a string it splits on spaces.
- `icon-button` is `h-11 w-11 sm:h-9 sm:w-9` to honour the 44px minimum tap target.

---

## Task 11 — Auth + pet management

Pure modules first, each RED before any screen exists:

- `lib/ui/auth/credentials.ts` — form-data parsing, field errors keyed by input name (4 tests)
- `lib/ui/error-messages.ts` — domain code → customer message, following the voice rules (what happened + what we kept + what to do next, machine code carried separately for the mono line) (6 tests, incl. `SLOT_UNAVAILABLE`, `CANCELLATION_CUTOFF_PASSED`, `PET_IN_USE`, `IDEMPOTENCY_KEY_EXPIRED`, unknown-code fallback)
- `lib/ui/auth/supabase-auth-errors.ts` — provider error → app code, never leaking the provider message (5 tests)
- `lib/ui/field-ids.ts` (4 tests)
- `lib/ui/pet-form.ts` — `FormData` → `lib/booking/pet-schema.ts`, `ZodError.issues` → `Record<inputName, message>`. **No new validation rules** (6 tests)

**Increments** (each RED → GREEN → REFACTOR):

|       | RED (E2E unless noted)                                                                                                                                                                        | Files                                                                                                                                   |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 11.2  | `"signs a customer in and lands on my appointments"`                                                                                                                                          | `app/(auth)/{layout,actions}.tsx`, `sign-in/{page,sign-in-form}.tsx`, `submit-button.tsx`; `app/page.tsx` → `redirect("/appointments")` |
| 11.3  | `"signs the customer out and returns them to sign in"`                                                                                                                                        | `app/(app)/layout.tsx` (guard + header), `app/(app)/actions.ts`                                                                         |
| 11.4  | `"creates an account and signs the new customer straight in"`                                                                                                                                 | `sign-up/{page,sign-up-form}.tsx`, `app/auth/confirm/route.ts`                                                                          |
| 11.6  | `"shows the empty state when the customer has no pets"`                                                                                                                                       | `app/(app)/pets/page.tsx`                                                                                                               |
| 11.7  | `"adds a pet and shows it in the list"`                                                                                                                                                       | `pets/actions.ts`, `pets/pet-form-dialog.tsx`                                                                                           |
| 11.8  | `"edits a pet's breed and shows the new value"`                                                                                                                                               | reuse dialog in `mode="edit"`                                                                                                           |
| 11.9  | unit `"reports a pet that still has appointments as PET_IN_USE"`, then `"refuses to remove a pet that has an appointment and explains why"` + `"removes a pet the customer has never booked"` | G3 fix + `pets/delete-pet-dialog.tsx`                                                                                                   |
| 11.10 | `"keeps each customer's pets private"` + mobile dialog spec                                                                                                                                   | responsive classes only                                                                                                                 |

**Server Action contract** (the pattern for all of Phase 4):

```ts
export type ActionResult =
  | { status: "success" }
  | { status: "pending"; code: string; message: string } // e.g. EMAIL_CONFIRMATION_REQUIRED
  | {
      status: "error";
      code: string;
      message: string;
      fieldErrors?: Readonly<Record<string, string>>;
    };
```

Actions never throw domain errors. `redirect()` is called **after** the try/catch (or as the terminal statement of a specific catch branch) — `redirect` throws `NEXT_REDIRECT` and a broad catch silently swallows it. Shared mapper `app/action-error.ts` mirrors `isDomainError` in [booking-handlers.ts:263](lib/api/v1/booking-handlers.ts:263). Client forms use `useActionState` for errors and `useFormStatus` for the loading state, with a `useEffect` focusing the first invalid control.

**Security note for the PR:** the `(app)` layout guard is a UX redirect only. Real authorization is `requireAuthenticatedActor` inside every use case plus RLS.

**Gate:** targeted tests → `pnpm test` → `pnpm lint` → `pnpm typecheck` → `pnpm build` → `pnpm test:e2e` (both projects) → manual browser pass.

---

## Task 12 — Booking, appointments, reschedule, cancel

### Wizard architecture: URL-as-state

One route `app/(app)/book/page.tsx`, entire selection in `searchParams`:

```
/book?intent=<uuid>&step=services&petId=…&baseServiceId=…&addOnServiceId=…
     &groomerId=any|<uuid>&startsOn=…&endsOn=…&startsAt=<ISO>
```

Chosen over client `useReducer` because: **the subtotal and duration can only come from the server** — the sticky rail is a Server Component calling `resolveServiceSelection(ids)`, so no client code path could compute a price (the AGENTS.md non-negotiable); refresh/back-button and sign-in bounce preserve selections (a Phase 0 recovery requirement); steps 1–3 work without client JS; stale-slot recovery becomes a redirect; Playwright can deep-link any step. Untrusted params are a non-issue — everything is re-validated server-side and finally by the RPC.

```
app/(app)/book/page.tsx, actions.ts, summary-rail.tsx, mobile-subtotal-bar.tsx
app/(app)/book/steps/{pet,services,groomer}-step.tsx   # Server
app/(app)/book/steps/{time,review}-step.tsx            # "use client"
app/(app)/book/confirmed/[appointmentId]/page.tsx
app/(app)/appointments/{page,actions}.tsx, cancel-dialog.tsx
app/(app)/appointments/[appointmentId]/reschedule/{page,actions}.tsx
```

### 12.0 — Domain additions (own commit, before any UI)

`listServiceCompatibility()` passthrough (G1); `AppointmentServiceSnapshot` type + `BookingRepository.listAppointmentServices()` + `listMyAppointmentServices()` (G2), with the Supabase query gated by RLS as a second boundary. **Adding to `BookingRepository` breaks four in-memory fakes** (`use-cases.test.ts`, `availability.test.ts`, `lifecycle.test.ts`, `backend-http.integration.test.ts`) — land the interface change and `[]` stubs as one commit, confirm green, _then_ write the RED behaviour test, so the typecheck noise doesn't obscure the RED signal. **No `/api/v1`, `lib/api/v1/*`, or `doc/openapi.v1.json` changes** — `BookingApiUseCases` is structural and unaffected.

### 12.1 — Pure modules (all under `lib/ui/`, node env)

`format/money.ts` (`$55` not `$55.00`) · `format/duration.ts` · `format/datetime.ts` · `booking/slot-days.ts` · `booking/add-on-availability.ts` · `booking/wizard-state.ts` · `booking/step-gate.ts` · `booking/change-window.ts` · `booking/appointment-view.ts` · `booking/summary.ts` · `lib/booking/idempotency-key.ts`

Highest-value tests:

- `datetime`: `"attributes a late-evening instant to the business day, not the UTC day"` (`2026-09-03T01:00:00Z` → `Wed 2 Sep`, `9:00 PM`); `"keeps eastern daylight and standard offsets distinct across the change"`; `"splits a day into the weekday, day, and month tokens the appointment card needs"`.
- `slot-days`: **`"collapses slots that share a start instant across groomers into one time"`** — `searchAvailability` emits one slot per qualified groomer, so 10:15 AM otherwise renders three identical buttons; plus `"keeps the exact ISO start instant on each rendered time"`.
- `add-on-availability`: selectability derived **only** from the server's `ServiceCompatibility[]`; the "Already included in Full Groom" wording is a presentation-only override map keyed by service name — a content string, never a rule.
- `change-window`: **`"blocks a change exactly twenty-four hours before the start"`** — matches the RPC's `<=`.
- `step-gate`: deliberately dumb; the rules stay in `resolveServiceSelection`, this only gates the button.

### 12.2–12.9 — Increments

|      | RED (E2E)                                                                                                                                                                                        | Notes                                                                                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12.1 | `"starts a booking and lists the customer's pets"` / `"asks the customer to add a pet before booking when they have none"`                                                                       | `startBookingAction` mints `intent` and redirects                                                                                                          |
| 12.2 | `"disables Nail Trim with a written reason once Full Groom is chosen"` / `"shows the server subtotal and duration in the summary rail"`                                                          | incompatible options stay **visible**                                                                                                                      |
| 12.3 | `"disables a groomer who is not qualified and names the service"`                                                                                                                                | `listActiveGroomers` for the visible list, `listQualifiedGroomers` for the enabled set                                                                     |
| 12.4 | `"shows server-calculated times grouped by day"` / `"shows nothing bookable for a Sunday range"` / `"changes the date range and refreshes the times"`                                            | RSC does first paint; range changes + "Refresh times" call `searchAvailabilityAction` in `useTransition`; both render the same `groupSlotsIntoDays` output |
| 12.5 | `"confirms a booking and shows the reference on the confirmation screen"`                                                                                                                        | review checkbox gates submit; hidden `bookingIntentId`                                                                                                     |
| 12.6 | `"lists the customer's upcoming appointments with their services"` / `"moves cancelled visits to the past tab"` / `"locks a visit inside the twenty-four-hour window and shows the salon phone"` | needs G2                                                                                                                                                   |
| 12.7 | `"cancels an upcoming visit and frees the slot"`                                                                                                                                                 | `Dialog tone="danger"` + nested warning `Alert`, per the design                                                                                            |
| 12.8 | `"reschedules a visit to a new time"` / `"refuses to reschedule a visit inside the cutoff"`                                                                                                      | **no reschedule screen was designed** — reuse `time-step.tsx` with groomer pinned and services from the snapshot                                           |
| 12.9 | all three specs under `mobile-chromium`                                                                                                                                                          | `grid-cols-1 lg:grid-cols-[1fr_320px]`, rail `lg:order-2`, `sticky bottom-0 lg:hidden` subtotal bar, step labels `hidden sm:inline`                        |

### Idempotency key lifecycle

The RPC fingerprints a canonical request ([idempotency:236,382,531](supabase/migrations/20260813060000_appointment_idempotency.sql:236)); same key + same fingerprint replays, different fingerprint → `IDEMPOTENCY_KEY_REUSED`. A failed mutation **rolls the idempotency record back**, so a key consumed by a failure is free again.

```
idempotencyKey = `${operationPrefix}:${intentId}:${sha256(canonicalRequest)}`
```

`intentId` is a `crypto.randomUUID()` nonce — the only part the client supplies — living **in the URL** (`?intent=`) for confirm and reschedule so a refresh of the review step replays rather than duplicates, and in component state for the cancel dialog (which unmounts on close). The hash half is computed **server-side inside the Server Action** from the same validated payload sent to the RPC, sorted identically, so key and fingerprint can never disagree. Result: retries replay; any change to pet/groomer/instant/services changes the key so a changed request never hits `IDEMPOTENCY_KEY_REUSED`; two genuinely distinct bookings get different nonces and the second correctly loses to the exclusion constraint. `IDEMPOTENCY_KEY_EXPIRED` is a first-class state — `Alert tone="warning"` + a "Start again" button that mints a fresh nonce while preserving selections.

### `SLOT_UNAVAILABLE` recovery

`confirmAppointmentAction` catches the code and redirects to `?step=time&error=SLOT_UNAVAILABLE` with `startsAt` dropped and **everything else preserved**. The step-4 RSC then re-runs `searchAvailability` with the unchanged pet/services/groomer — so the times shown are freshly recalculated by the server, not a cached list — and renders the designed block above the picker:

```tsx
<Alert
  tone="danger"
  title="That time was just booked"
  code="SLOT_UNAVAILABLE"
  action={<RefreshTimesButton />}
>
  We kept your pet and services. Pick another time to finish booking.
</Alert>
```

The step indicator sits back on "Date & time" with 1–3 complete; the summary rail still shows pet, services, groomer, subtotal and duration. Retry uses the same `intentId` with a different `startsAt`, so the key changes and no reuse error occurs.

---

## E2E infrastructure

```bash
supabase start && supabase db reset
```

`db.seed.sql_paths` already points at `demo_catalogue.sql`, and `site_url` is already `http://127.0.0.1:3000` — matching Playwright's `baseURL`, so `emailRedirectTo` works unchanged.

```
e2e/load-env.ts              # 12-line dependency-free .env.local parser, imported first in playwright.config.ts
e2e/fixtures/{supabase-admin,test-users,seed,dates,auth}.ts
e2e/global-setup.ts
e2e/{auth,pets,booking,reschedule-cancel,stale-slot}.spec.ts
```

`SUPABASE_SERVICE_ROLE_KEY` and `E2E_CUSTOMER_PASSWORD` go in `.env.local` (already gitignored via `.env*` / `!.env.example`). **No `NEXT_PUBLIC_` prefix**, so Next cannot inline the key into a client bundle; read only by `e2e/fixtures/`, never imported by `app/` or `lib/`. `.env.example` gets the names with a warning, no values.

**Authentication: sign in through the UI per test, not `storageState`.** `enable_refresh_token_rotation = true` with `refresh_token_reuse_interval = 10` means a saved refresh token is rotated on first use and the next test loading that file is signed out. Per-test sign-in costs ~1s and removes a whole class of flake, and continuously exercises Task 11's required two-customer flow.

**Determinism** (today is 2026-08-14, a Friday):

- Range = the Mon–Sat two weeks out (`nextBookableWeek`, its own Vitest file) — inside the 31-day window, well outside the 24h cutoff, never Sunday-only.
- **Always click the first available time**, never a hardcoded one, so slots consumed by an earlier test or the other project don't break the spec.
- "No slots" recovery uses **the next Sunday** — every groomer's working hours are ISO days 1–6, so zero slots is guaranteed by the schema with no seeding.
- The locked (inside-cutoff) appointment can't be produced through the RPC deterministically; **insert it directly with the service-role client** at `now + 2h` (verified safe — `appointments` has no working-hours constraint).
- **Do not depend on the seed's September-2026 time-off rows** — they are pinned to a month that drifts into the past; `seed.ts` upserts its own now-relative row if needed.
- Stale-slot: read `groomerId`/`startsAt` from the review form's hidden inputs, service-role-insert a conflicting `CONFIRMED` row at exactly that groomer and instant, then click Confirm. The exclusion constraint raises `SLOT_UNAVAILABLE`, which [supabase-repository.ts:258](lib/booking/supabase-repository.ts:258) already translates. Cleaned up in `afterEach`. (Two-browser-context variant is the documented fallback.)

**`playwright.config.ts`:** add `import "./e2e/load-env"`, `globalSetup`, `fullyParallel: false`, `workers: 1` (shared local DB), a `mobile-chromium` project (`devices["Pixel 7"]`), and `webServer.timeout: 120_000` (Turbopack cold compile exceeds the 60s default).

**Known coverage gap to record:** the "no qualified groomer" recovery state is **unreachable with the seed** — Maya Chen is qualified for all five services. Covered by a Vitest test on the groomer-step view builder; E2E covers the adjacent reachable case (Liam disabled with "Not qualified for Full Groom").

---

## Risks

|     | Risk                                                                                                                               | Mitigation                                                                                                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | `cookies().set` throws during RSC render (G4) — intermittent 500s only after ~1h of session age, near-invisible in a short E2E run | F1. `proxy.ts` needs **no other change**: its matcher already covers every route, and its deliberate absence of authorization is correct. |
| R2  | `redirect()` inside `try/catch` silently swallowed                                                                                 | House rule + doc comment in `app/act# Phase 4 — Customer frontend (Tasks 11 → 12)                                                         |

## Context

`tasks/plan.md` Checkpoint C is complete: migrations, RLS, the server booking domain, `/api/v1`, and the OpenAPI contract are all built and tested, but the app has **no product UI** — `app/page.tsx` renders one line of text and `app/globals.css` is a single `@import "tailwindcss";`.

Phase 4 builds the customer-facing product on that tested backend: **Task 11** (auth + pet management), then **Task 12** (booking wizard, My Appointments, reschedule, cancel). Per the request, Task 11 is completed and verified in full before Task 12 begins.

`claude-design/` is an untracked design system authored for this exact product — tokens, 30 component specs, and clickable recreations of every screen in `ui_kits/customer-app/`. It is the visual source of truth.

**Outcome:** Checkpoint D — a customer can sign in, create a pet, book, view, reschedule, and cancel with an accessible, responsive interface.

## Decisions (confirmed)

1. **Data path:** Server Components read via `createSupabaseBookingUseCases()`; all mutations and the interactive availability search are **Server Actions**. App code never calls `/api/v1`, and `/api/v1` remains the authenticated booking API. (AGENTS.md: _"Do not make server code call this application's own HTTP routes"_.)
2. **Styling:** `claude-design/tokens/*.css` copied verbatim as the source of truth, exposed to Tailwind v4 via `@theme inline`. Components are `.tsx` using Tailwind utilities + `var()`. Responsive variants supply the mobile layouts the design system lacks. Fonts via `next/font/google`, not the Google `@import`.
3. **E2E:** local `supabase start` (Docker + CLI 2.113.0 confirmed working), `supabase db reset` applies the 6 migrations + demo seed, real test customers created with the local service-role key.
4. **UI testing:** presentation logic extracted into pure node-testable modules with focused Vitest tests; Playwright for browser flows. No jsdom, no Testing Library.

## Blocking gaps found in existing code

Verified directly. All must be fixed via TDD before the screens that need them.

|        | Gap                                                                                                                                                                                                                                                                                   | Evidence | Fix                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| **G1** | `listServiceCompatibility` exists on `BookingRepository` ([use-cases.ts:190](lib/booking/use-cases.ts:190)) but is **not** in the object `createBookingUseCases` returns ([:1050-1064](lib/booking/use-cases.ts:1050)). Step 2 needs it to disable add-ons with a reason.             | verified | Passthrough use case.                                                                          |
| **G2** | **No way to read an appointment's services.** `appointment_services` is never queried anywhere in `lib/`; `Appointment` carries no services; `rescheduleAppointment` **requires** `selectedServiceIds`. **Reschedule is impossible and `AppointmentCard` has no title without this.** | verified | Add `BookingRepository.listAppointmentServices(ids)` + use case `listMyAppointmentServices()`. |
| **G3** | `appointments.pet_id` is `on delete restrict` ([schema:163](supabase/migrations/20260812184025_initial_booking_schema.sql:163)) but `deletePetByOwner` does a bare `.delete()` — deleting a booked pet throws a raw DB error.                                                         | verified | `PetInUseError` (`PET_IN_USE`, 409) mapping PG `23503`.                                        |
| **G4** | [`lib/supabase/server.ts:25`](lib/supabase/server.ts:25) `setAll` calls `cookieStore.set` with no `try/catch`. Next throws on cookie writes during an RSC render — every protected page 500s on token refresh (`jwt_expiry = 3600`, so it only appears after ~1h).                    | verified | `try/catch`; `proxy.ts` is what actually persists the refresh.                                 |
| **G5** | `businessTimeZone` / `cleanupBufferMinutes` / `slotIntervalMinutes` are private consts in a `server-only` module ([use-cases.ts:8-11](lib/booking/use-cases.ts:8)). Client formatters can't import them.                                                                              | verified | Extract to pure `lib/booking/business-time.ts`.                                                |
| **G6** | `AuthenticatedActor` is `{id, role}`; `profiles.display_name` exists and the signup trigger fills it. Adding a field would break 5 test files.                                                                                                                                        | verified | New `lib/auth/profile.ts` → `getCurrentProfile()`.                                             |

Two contract facts that drive the design:

- **The cutoff is `<=`** (`starts_at <= now() + interval '24 hours'` at [lifecycle:325](supabase/migrations/20260813050000_appointment_lifecycle.sql:325) and [idempotency:418](supabase/migrations/20260813060000_appointment_idempotency.sql:418)). Changeable **iff `startsAt > now + 24h`**; exactly 24h is locked.
- **Local `enable_confirmations = false`** ([config.toml:203](supabase/config.toml:203)), hosted defaults to on. Sign-up must branch on `data.session === null`. Password auth has no PKCE code, so the route is `app/auth/confirm/route.ts` (`verifyOtp`), **not** `/auth/callback`.

---

## Task 10.5 — Design foundation

No screens. Exists so Task 11's first RED test can render something.

**Domain/infra prerequisites, each RED → GREEN:**

|     | RED test                                                                                                            | GREEN                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| F1  | `lib/supabase/server.test.ts` → `"ignores cookie writes that Next.js rejects during a Server Component render"`     | `try/catch` in `setAll` (G4)                                                          |
| F2  | `lib/booking/business-time.test.ts` → `"exposes the approved business timezone, cleanup buffer, and slot interval"` | pure `lib/booking/business-time.ts`; `use-cases.ts` imports it (G5)                   |
| F3  | `lib/booking/pet-schema.test.ts` → 4 tests                                                                          | pure `lib/booking/pet-schema.ts`; `use-cases.ts` imports it — **no rule duplication** |
| F4  | `lib/auth/profile.test.ts` → 2 tests                                                                                | `lib/auth/profile.ts` (`server-only`) `getCurrentProfile()` (G6)                      |

**Tokens:** copy the 7 token files verbatim to `styles/tokens/` (repo root, so nothing reads as a route and the mirror to `claude-design/tokens/` stays 1:1). `fonts.css` is **deliberately not copied** — `next/font` replaces it.

**`app/globals.css`:** `@import "tailwindcss"` + the 7 token files (`base.css` as `layer(base)` so utilities beat element defaults — see R11) + a `:root` block remapping `--font-display/-sans/-mono` onto the `next/font` variables + `@theme inline` + a base layer adding `dialog::backdrop` (scrim + blur) and a `prefers-reduced-motion` block.

**`@theme inline` mapping:** colour ramps and semantic aliases → `--color-*`; type scale → `--text-*` (deliberately overriding Tailwind's defaults so `text-base` is 15px); `--radius-*`, `--shadow-*`, `--ease-*`, `--container-*`, `--font-weight-*`, `--tracking-*`, `--leading-*`; plus `--spacing-card/-card-lg/-field-x/-field-y` for the off-scale composites. Left as raw `var()`: control heights (`h-(--control-h-md)`), `--hit-target-min`, `--header-h`, durations, `--focus-ring`, `--scrim`. **The composed type roles stay arbitrary properties — `[font:var(--type-h2)]`** — they are CSS `font` shorthand with no Tailwind namespace, and still need `tracking-tight`/`tracking-snug` alongside (shorthand does not reset letter-spacing). Plain spacing uses Tailwind's native scale (same 4px base); the design's `--space-7..12` are off-scale (32/40/48/64/80/96) and get a mapping comment rather than a theme key, so `p-7` never silently means 32px.

**`app/layout.tsx`:** `Bricolage_Grotesque` / `Plus_Jakarta_Sans` / `JetBrains_Mono` from `next/font/google` (all three accept `weight: "variable"`), variables on `<html>`, plus a skip link as the first `<body>` child. Every layout below renders `<main id="main-content">`.

**Icons:** `pnpm add lucide-react` — the design system states its 51 SVGs _are_ Lucide, the icons contain no hooks so they render in Server Components, and Next already lists the package in `optimizePackageImports`. Wrapped by `components/core/icon.tsx` with a kebab-name registry so call sites keep the design contract (and the wrapper is the fallback seam if the dependency is rejected).

**Gate:** `pnpm test` (75 existing + F1–F4), `pnpm lint`, `pnpm typecheck`, `pnpm build`, then load `/` and confirm fonts and `--bg-page` render.

---

## Component port strategy

```
components/core/{icon,button,icon-button,badge,status-pill,card,alert,empty-state,logotype}.tsx
components/forms/{field,input,textarea,select,checkbox,choice-card}.tsx
components/navigation/{app-header,step-indicator,tab-links}.tsx
components/feedback/{dialog,toast}.tsx
components/booking/{pet-card,service-option,groomer-option,time-slot-picker,price-summary,appointment-card}.tsx
```

Build only what each task needs. Task 11: icon, button, icon-button, badge, card, alert, empty-state, logotype, field, input, textarea, select, app-header, dialog, toast, pet-card. Task 12 adds: status-pill, checkbox, choice-card, service-option, groomer-option, time-slot-picker, price-summary, appointment-card, step-indicator, tab-links. **Not built in Phase 4:** `SideNav` (admin, Task 13), `Radio`, `Switch`, `Tooltip`.

**~20 of the 30 stay Server Components** because hover/active/focus become Tailwind variants rather than the reference's `useState`. `"use client"` only for: `dialog`, `toast`, `time-step`, `review-step`, the form wrappers using `useActionState`, and submit buttons using `useFormStatus`.

**Deliberate deviations from the reference `.jsx`, all closing stated a11y gaps:**

- `choice-card` becomes a **real `<input>` inside a `<label>`** with `sr-only peer` + `has-[:checked]:` / `has-[:disabled]:` / `has-[:focus-visible]:` variants — not `<div role="radio" tabIndex={0}>`. Gets native roving tabindex, arrow keys, `aria-checked`, form submission, and needs no hooks. Same for `checkbox` and each slot in `time-slot-picker`.
- `Tabs` becomes `tab-links`: two `<Link href="?tab=…">` with `aria-current="page"`, styled as the design's underline tabs. Sidesteps the roving-tabindex gap, gives Playwright deep links, keeps the page a Server Component. Not `role="tablist"` with links.
- `dialog` uses native `<dialog>` + `showModal()` → focus trap, Escape, focus restore, top layer for free.
- `field` wires `aria-describedby`/`aria-invalid` through a tested pure helper `lib/ui/field-ids.ts`.
- `app-header` nav uses `<Link aria-current>`; active state passed as a prop, not `usePathname` (which would force `"use client"`).
- `appointment-card` takes `dateLabel: {weekday, day, month}` from the tested formatter, not a string it splits on spaces.
- `icon-button` is `h-11 w-11 sm:h-9 sm:w-9` to honour the 44px minimum tap target.

---

## Task 11 — Auth + pet management

Pure modules first, each RED before any screen exists:

- `lib/ui/auth/credentials.ts` — form-data parsing, field errors keyed by input name (4 tests)
- `lib/ui/error-messages.ts` — domain code → customer message, following the voice rules (what happened + what we kept + what to do next, machine code carried separately for the mono line) (6 tests, incl. `SLOT_UNAVAILABLE`, `CANCELLATION_CUTOFF_PASSED`, `PET_IN_USE`, `IDEMPOTENCY_KEY_EXPIRED`, unknown-code fallback)
- `lib/ui/auth/supabase-auth-errors.ts` — provider error → app code, never leaking the provider message (5 tests)
- `lib/ui/field-ids.ts` (4 tests)
- `lib/ui/pet-form.ts` — `FormData` → `lib/booking/pet-schema.ts`, `ZodError.issues` → `Record<inputName, message>`. **No new validation rules** (6 tests)

**Increments** (each RED → GREEN → REFACTOR):

|       | RED (E2E unless noted)                                                                                                                                                                        | Files                                                                                                                                   |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 11.2  | `"signs a customer in and lands on my appointments"`                                                                                                                                          | `app/(auth)/{layout,actions}.tsx`, `sign-in/{page,sign-in-form}.tsx`, `submit-button.tsx`; `app/page.tsx` → `redirect("/appointments")` |
| 11.3  | `"signs the customer out and returns them to sign in"`                                                                                                                                        | `app/(app)/layout.tsx` (guard + header), `app/(app)/actions.ts`                                                                         |
| 11.4  | `"creates an account and signs the new customer straight in"`                                                                                                                                 | `sign-up/{page,sign-up-form}.tsx`, `app/auth/confirm/route.ts`                                                                          |
| 11.6  | `"shows the empty state when the customer has no pets"`                                                                                                                                       | `app/(app)/pets/page.tsx`                                                                                                               |
| 11.7  | `"adds a pet and shows it in the list"`                                                                                                                                                       | `pets/actions.ts`, `pets/pet-form-dialog.tsx`                                                                                           |
| 11.8  | `"edits a pet's breed and shows the new value"`                                                                                                                                               | reuse dialog in `mode="edit"`                                                                                                           |
| 11.9  | unit `"reports a pet that still has appointments as PET_IN_USE"`, then `"refuses to remove a pet that has an appointment and explains why"` + `"removes a pet the customer has never booked"` | G3 fix + `pets/delete-pet-dialog.tsx`                                                                                                   |
| 11.10 | `"keeps each customer's pets private"` + mobile dialog spec                                                                                                                                   | responsive classes only                                                                                                                 |

**Server Action contract** (the pattern for all of Phase 4):

```ts
export type ActionResult =
  | { status: "success" }
  | { status: "pending"; code: string; message: string } // e.g. EMAIL_CONFIRMATION_REQUIRED
  | {
      status: "error";
      code: string;
      message: string;
      fieldErrors?: Readonly<Record<string, string>>;
    };
```

Actions never throw domain errors. `redirect()` is called **after** the try/catch (or as the terminal statement of a specific catch branch) — `redirect` throws `NEXT_REDIRECT` and a broad catch silently swallows it. Shared mapper `app/action-error.ts` mirrors `isDomainError` in [booking-handlers.ts:263](lib/api/v1/booking-handlers.ts:263). Client forms use `useActionState` for errors and `useFormStatus` for the loading state, with a `useEffect` focusing the first invalid control.

**Security note for the PR:** the `(app)` layout guard is a UX redirect only. Real authorization is `requireAuthenticatedActor` inside every use case plus RLS.

**Gate:** targeted tests → `pnpm test` → `pnpm lint` → `pnpm typecheck` → `pnpm build` → `pnpm test:e2e` (both projects) → manual browser pass.

---

## Task 12 — Booking, appointments, reschedule, cancel

### Wizard architecture: URL-as-state

One route `app/(app)/book/page.tsx`, entire selection in `searchParams`:

```
/book?intent=<uuid>&step=services&petId=…&baseServiceId=…&addOnServiceId=…
     &groomerId=any|<uuid>&startsOn=…&endsOn=…&startsAt=<ISO>
```

Chosen over client `useReducer` because: **the subtotal and duration can only come from the server** — the sticky rail is a Server Component calling `resolveServiceSelection(ids)`, so no client code path could compute a price (the AGENTS.md non-negotiable); refresh/back-button and sign-in bounce preserve selections (a Phase 0 recovery requirement); steps 1–3 work without client JS; stale-slot recovery becomes a redirect; Playwright can deep-link any step. Untrusted params are a non-issue — everything is re-validated server-side and finally by the RPC.

```
app/(app)/book/page.tsx, actions.ts, summary-rail.tsx, mobile-subtotal-bar.tsx
app/(app)/book/steps/{pet,services,groomer}-step.tsx   # Server
app/(app)/book/steps/{time,review}-step.tsx            # "use client"
app/(app)/book/confirmed/[appointmentId]/page.tsx
app/(app)/appointments/{page,actions}.tsx, cancel-dialog.tsx
app/(app)/appointments/[appointmentId]/reschedule/{page,actions}.tsx
```

### 12.0 — Domain additions (own commit, before any UI)

`listServiceCompatibility()` passthrough (G1); `AppointmentServiceSnapshot` type + `BookingRepository.listAppointmentServices()` + `listMyAppointmentServices()` (G2), with the Supabase query gated by RLS as a second boundary. **Adding to `BookingRepository` breaks four in-memory fakes** (`use-cases.test.ts`, `availability.test.ts`, `lifecycle.test.ts`, `backend-http.integration.test.ts`) — land the interface change and `[]` stubs as one commit, confirm green, _then_ write the RED behaviour test, so the typecheck noise doesn't obscure the RED signal. **No `/api/v1`, `lib/api/v1/*`, or `doc/openapi.v1.json` changes** — `BookingApiUseCases` is structural and unaffected.

### 12.1 — Pure modules (all under `lib/ui/`, node env)

`format/money.ts` (`$55` not `$55.00`) · `format/duration.ts` · `format/datetime.ts` · `booking/slot-days.ts` · `booking/add-on-availability.ts` · `booking/wizard-state.ts` · `booking/step-gate.ts` · `booking/change-window.ts` · `booking/appointment-view.ts` · `booking/summary.ts` · `lib/booking/idempotency-key.ts`

Highest-value tests:

- `datetime`: `"attributes a late-evening instant to the business day, not the UTC day"` (`2026-09-03T01:00:00Z` → `Wed 2 Sep`, `9:00 PM`); `"keeps eastern daylight and standard offsets distinct across the change"`; `"splits a day into the weekday, day, and month tokens the appointment card needs"`.
- `slot-days`: **`"collapses slots that share a start instant across groomers into one time"`** — `searchAvailability` emits one slot per qualified groomer, so 10:15 AM otherwise renders three identical buttons; plus `"keeps the exact ISO start instant on each rendered time"`.
- `add-on-availability`: selectability derived **only** from the server's `ServiceCompatibility[]`; the "Already included in Full Groom" wording is a presentation-only override map keyed by service name — a content string, never a rule.
- `change-window`: **`"blocks a change exactly twenty-four hours before the start"`** — matches the RPC's `<=`.
- `step-gate`: deliberately dumb; the rules stay in `resolveServiceSelection`, this only gates the button.

### 12.2–12.9 — Increments

|      | RED (E2E)                                                                                                                                                                                        | Notes                                                                                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12.1 | `"starts a booking and lists the customer's pets"` / `"asks the customer to add a pet before booking when they have none"`                                                                       | `startBookingAction` mints `intent` and redirects                                                                                                          |
| 12.2 | `"disables Nail Trim with a written reason once Full Groom is chosen"` / `"shows the server subtotal and duration in the summary rail"`                                                          | incompatible options stay **visible**                                                                                                                      |
| 12.3 | `"disables a groomer who is not qualified and names the service"`                                                                                                                                | `listActiveGroomers` for the visible list, `listQualifiedGroomers` for the enabled set                                                                     |
| 12.4 | `"shows server-calculated times grouped by day"` / `"shows nothing bookable for a Sunday range"` / `"changes the date range and refreshes the times"`                                            | RSC does first paint; range changes + "Refresh times" call `searchAvailabilityAction` in `useTransition`; both render the same `groupSlotsIntoDays` output |
| 12.5 | `"confirms a booking and shows the reference on the confirmation screen"`                                                                                                                        | review checkbox gates submit; hidden `bookingIntentId`                                                                                                     |
| 12.6 | `"lists the customer's upcoming appointments with their services"` / `"moves cancelled visits to the past tab"` / `"locks a visit inside the twenty-four-hour window and shows the salon phone"` | needs G2                                                                                                                                                   |
| 12.7 | `"cancels an upcoming visit and frees the slot"`                                                                                                                                                 | `Dialog tone="danger"` + nested warning `Alert`, per the design                                                                                            |
| 12.8 | `"reschedules a visit to a new time"` / `"refuses to reschedule a visit inside the cutoff"`                                                                                                      | **no reschedule screen was designed** — reuse `time-step.tsx` with groomer pinned and services from the snapshot                                           |
| 12.9 | all three specs under `mobile-chromium`                                                                                                                                                          | `grid-cols-1 lg:grid-cols-[1fr_320px]`, rail `lg:order-2`, `sticky bottom-0 lg:hidden` subtotal bar, step labels `hidden sm:inline`                        |

### Idempotency key lifecycle

The RPC fingerprints a canonical request ([idempotency:236,382,531](supabase/migrations/20260813060000_appointment_idempotency.sql:236)); same key + same fingerprint replays, different fingerprint → `IDEMPOTENCY_KEY_REUSED`. A failed mutation **rolls the idempotency record back**, so a key consumed by a failure is free again.

```
idempotencyKey = `${operationPrefix}:${intentId}:${sha256(canonicalRequest)}`
```

`intentId` is a `crypto.randomUUID()` nonce — the only part the client supplies — living **in the URL** (`?intent=`) for confirm and reschedule so a refresh of the review step replays rather than duplicates, and in component state for the cancel dialog (which unmounts on close). The hash half is computed **server-side inside the Server Action** from the same validated payload sent to the RPC, sorted identically, so key and fingerprint can never disagree. Result: retries replay; any change to pet/groomer/instant/services changes the key so a changed request never hits `IDEMPOTENCY_KEY_REUSED`; two genuinely distinct bookings get different nonces and the second correctly loses to the exclusion constraint. `IDEMPOTENCY_KEY_EXPIRED` is a first-class state — `Alert tone="warning"` + a "Start again" button that mints a fresh nonce while preserving selections.

### `SLOT_UNAVAILABLE` recovery

`confirmAppointmentAction` catches the code and redirects to `?step=time&error=SLOT_UNAVAILABLE` with `startsAt` dropped and **everything else preserved**. The step-4 RSC then re-runs `searchAvailability` with the unchanged pet/services/groomer — so the times shown are freshly recalculated by the server, not a cached list — and renders the designed block above the picker:

```tsx
<Alert
  tone="danger"
  title="That time was just booked"
  code="SLOT_UNAVAILABLE"
  action={<RefreshTimesButton />}
>
  We kept your pet and services. Pick another time to finish booking.
</Alert>
```

The step indicator sits back on "Date & time" with 1–3 complete; the summary rail still shows pet, services, groomer, subtotal and duration. Retry uses the same `intentId` with a different `startsAt`, so the key changes and no reuse error occurs.

---

## E2E infrastructure

```bash
supabase start && supabase db reset
```

`db.seed.sql_paths` already points at `demo_catalogue.sql`, and `site_url` is already `http://127.0.0.1:3000` — matching Playwright's `baseURL`, so `emailRedirectTo` works unchanged.

```
e2e/load-env.ts              # 12-line dependency-free .env.local parser, imported first in playwright.config.ts
e2e/fixtures/{supabase-admin,test-users,seed,dates,auth}.ts
e2e/global-setup.ts
e2e/{auth,pets,booking,reschedule-cancel,stale-slot}.spec.ts
```

`SUPABASE_SERVICE_ROLE_KEY` and `E2E_CUSTOMER_PASSWORD` go in `.env.local` (already gitignored via `.env*` / `!.env.example`). **No `NEXT_PUBLIC_` prefix**, so Next cannot inline the key into a client bundle; read only by `e2e/fixtures/`, never imported by `app/` or `lib/`. `.env.example` gets the names with a warning, no values.

**Authentication: sign in through the UI per test, not `storageState`.** `enable_refresh_token_rotation = true` with `refresh_token_reuse_interval = 10` means a saved refresh token is rotated on first use and the next test loading that file is signed out. Per-test sign-in costs ~1s and removes a whole class of flake, and continuously exercises Task 11's required two-customer flow.

**Determinism** (today is 2026-08-14, a Friday):

- Range = the Mon–Sat two weeks out (`nextBookableWeek`, its own Vitest file) — inside the 31-day window, well outside the 24h cutoff, never Sunday-only.
- **Always click the first available time**, never a hardcoded one, so slots consumed by an earlier test or the other project don't break the spec.
- "No slots" recovery uses **the next Sunday** — every groomer's working hours are ISO days 1–6, so zero slots is guaranteed by the schema with no seeding.
- The locked (inside-cutoff) appointment can't be produced through the RPC deterministically; **insert it directly with the service-role client** at `now + 2h` (verified safe — `appointments` has no working-hours constraint).
- **Do not depend on the seed's September-2026 time-off rows** — they are pinned to a month that drifts into the past; `seed.ts` upserts its own now-relative row if needed.
- Stale-slot: read `groomerId`/`startsAt` from the review form's hidden inputs, service-role-insert a conflicting `CONFIRMED` row at exactly that groomer and instant, then click Confirm. The exclusion constraint raises `SLOT_UNAVAILABLE`, which [supabase-repository.ts:258](lib/booking/supabase-repository.ts:258) already translates. Cleaned up in `afterEach`. (Two-browser-context variant is the documented fallback.)

**`playwright.config.ts`:** add `import "./e2e/load-env"`, `globalSetup`, `fullyParallel: false`, `workers: 1` (shared local DB), a `mobile-chromium` project (`devices["Pixel 7"]`), and `webServer.timeout: 120_000` (Turbopack cold compile exceeds the 60s default).

**Known coverage gap to record:** the "no qualified groomer" recovery state is **unreachable with the seed** — Maya Chen is qualified for all five services. Covered by a Vitest test on the groomer-step view builder; E2E covers the adjacent reachable case (Liam disabled with "Not qualified for Full Groom").

---

## Risks

|        | Risk                                                                                                                               | Mitigation                                                                                                                                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1     | `cookies().set` throws during RSC render (G4) — intermittent 500s only after ~1h of session age, near-invisible in a short E2E run | F1. `proxy.ts` needs **no other change**: its matcher already covers every route, and its deliberate absence of authorization is correct.                                                                         |
| R2     | `redirect()` inside `try/catch` silently swallowed                                                                                 | House rule + doc comment in `app/action-error.ts`; one E2E assertion per redirecting action                                                                                                                       |
| R3     | `Date` across the Server Action boundary                                                                                           | **Server Actions accept and return plain view models with ISO strings.** One mapper per shape, mirroring `toAvailabilityResponse`. Formatters take strings.                                                       |
| R4     | Timezone at the display boundary — `toLocaleString` uses the _browser's_ zone, giving hydration mismatches and a wrong day         | Everything through `formatInTimeZone(iso, businessTimeZone, …)` on both server and client, from the single F2 constant. Never `toLocaleString`, never `new Date().getHours()`. Explicit March/November DST tests. |
| R5     | Duplicate slots per instant (one per qualified groomer)                                                                            | `groupSlotsIntoDays` collapses with a deterministic groomer pick                                                                                                                                                  |
| R6     | `BookingRepository` change breaks 4 fakes at once, obscuring RED                                                                   | Interface + stubs as their own green commit first                                                                                                                                                                 |
| R7     | RSC/client creep making the whole wizard `"use client"` — the exact AGENTS.md violation                                            | Only 5 files are `"use client"`. Convention: no file under `components/booking/` performs arithmetic on `priceCents` or `durationMinutes`.                                                                        |
| R8     | Next 16 async `params`/`searchParams`                                                                                              | `await` on the first line of every page; `wizard-state.ts` normalizes `string \| string[] \| undefined` with a test per arity                                                                                     |
| R11    | `base.css` fights Tailwind Preflight — unlayered, it beats every utility and `text-muted` stops working                            | Import as `layer(base)`; verify a `<p className="text-muted">` is actually muted                                                                                                                                  |
| R13/14 | Two projects contending for slots; `storageState` vs token rotation                                                                | `workers: 1` + first-available-slot; per-test UI sign-in                                                                                                                                                          |
| R15    | `enable_confirmations` differs local vs hosted                                                                                     | Branch on `data.session === null`; ship `/auth/confirm`; document both in the README                                                                                                                              |

---

## Verification

**Task 11 gate:** `pnpm test` → `pnpm lint` → `pnpm typecheck` → `pnpm build` → `pnpm test:e2e` (both projects) → manual browser pass: sign-up → sign-in → add/edit/delete pet → sign-out.

**Task 12 gate:** the same, **plus `pnpm test:contract`** to prove `/api/v1` and `doc/openapi.v1.json` are untouched, plus a manual browser pass at 1280 and 390 widths covering book → confirm → reschedule → cancel.

Record exact commands and results in the `tasks/plan.md` completion-evidence blocks and tick `tasks/todo.md` items 11, 12, and Checkpoint D. Both gates are hard: Task 12 does not begin until Task 11's gate passes.
ion-error.ts`; one E2E assertion per redirecting action |
| R3 | `Date`across the Server Action boundary | **Server Actions accept and return plain view models with ISO strings.** One mapper per shape, mirroring`toAvailabilityResponse`. Formatters take strings. |
| R4 | Timezone at the display boundary — `toLocaleString`uses the *browser's* zone, giving hydration mismatches and a wrong day | Everything through`formatInTimeZone(iso, businessTimeZone, …)`on both server and client, from the single F2 constant. Never`toLocaleString`, never `new Date().getHours()`. Explicit March/November DST tests. |
| R5 | Duplicate slots per instant (one per qualified groomer) | `groupSlotsIntoDays`collapses with a deterministic groomer pick |
| R6 |`BookingRepository`change breaks 4 fakes at once, obscuring RED | Interface + stubs as their own green commit first |
| R7 | RSC/client creep making the whole wizard`"use client"`— the exact AGENTS.md violation | Only 5 files are`"use client"`. Convention: no file under `components/booking/`performs arithmetic on`priceCents`or`durationMinutes`. |
| R8 | Next 16 async `params`/`searchParams`|`await`on the first line of every page;`wizard-state.ts`normalizes`string \| string[] \| undefined`with a test per arity |
| R11 |`base.css`fights Tailwind Preflight — unlayered, it beats every utility and`text-muted`stops working | Import as`layer(base)`; verify a `<p className="text-muted">`is actually muted |
| R13/14 | Two projects contending for slots;`storageState`vs token rotation |`workers: 1`+ first-available-slot; per-test UI sign-in |
| R15 |`enable_confirmations`differs local vs hosted | Branch on`data.session === null`; ship `/auth/confirm`; document both in the README |

---

## Verification

**Task 11 gate:** `pnpm test` → `pnpm lint` → `pnpm typecheck` → `pnpm build` → `pnpm test:e2e` (both projects) → manual browser pass: sign-up → sign-in → add/edit/delete pet → sign-out.

**Task 12 gate:** the same, **plus `pnpm test:contract`** to prove `/api/v1` and `doc/openapi.v1.json` are untouched, plus a manual browser pass at 1280 and 390 widths covering book → confirm → reschedule → cancel.

Record exact commands and results in the `tasks/plan.md` completion-evidence blocks and tick `tasks/todo.md` items 11, 12, and Checkpoint D. Both gates are hard: Task 12 does not begin until Task 11's gate passes.
