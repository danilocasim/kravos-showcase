# Paw &amp; Polish — Design System

Paw &amp; Polish is a single-location dog-grooming salon in Brooklyn, New York, and this design system covers its **booking product**: a Next.js + Supabase application where a signed-in customer manages their dogs, finds real groomer availability, books a visit, and reschedules or cancels it — plus the admin console the salon runs the day from.

The source project is deliberately **backend-first**: at the time this system was authored, the repository contained migrations, row-level security, the booking domain, and a fully tested `/api/v1`, but **no product UI beyond framework boilerplate** (`app/page.tsx` renders one line of text; `app/globals.css` is a single Tailwind import). There is no logo, no brand palette, no component library, and no font files anywhere in the source.

So this system is **built from the product's real rules, not from an existing visual identity**:

- Every service, price, duration, groomer, working hour and policy shown here is copied from `tasks/phase-0.md` and `supabase/seeds/demo_catalogue.sql`.
- Every screen follows the approved five-step flow and its required recovery states.
- The visual language (colour, type, spacing, motion) is **new work** authored for the brief "clean, friendly, trustworthy, easy to navigate". It is a proposal, not a recreation — see **Caveats** at the end.

---

## Sources used

| Source                                                         | What was taken from it                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mounted codebase `app/`, `lib/`, `supabase/`, `tasks/`, `doc/` | `tasks/phase-0.md` (operating defaults, catalogue, groomers, booking flow, recovery states), `tasks/plan.md` (product phases and non-goals), `supabase/seeds/demo_catalogue.sql` (exact service names, prices in cents, durations, qualifications, working hours, time off), `doc/openapi.v1.json` + `README.md` (endpoints, error envelope, status codes) |
| Icons: https://github.com/lucide-icons/lucide                  | 51 SVGs copied verbatim into `assets/icons/`; the same path data backs the `Icon` component                                                                                                                                                                                                                                                                |
| Google Fonts                                                   | Bricolage Grotesque, Plus Jakarta Sans, JetBrains Mono — **substitutions**, since no font files exist in the source                                                                                                                                                                                                                                        |

Non-goals inherited from the product plan (do not design for them): payments, reminders and notifications, memberships, multi-location, waitlists, recurring appointments, walk-ins, cats. Dogs only in v1.

---

## Product surfaces

1. **Customer app** (`ui_kits/customer-app/`) — sign-in, My pets, the five-step booking flow, confirmation, My appointments with reschedule/cancel.
2. **Admin console** (`ui_kits/admin-console/`) — day list with groomer filter, status transitions to `COMPLETED`/`CANCELLED`, groomer schedules, service catalogue.

There is no marketing website in the source, so none is invented here.

---

## CONTENT FUNDAMENTALS

**Voice: the calm receptionist.** Warm, plain, specific. It never gushes and never sounds legal.

- **Person.** Say **you** to the customer, **we** for the salon. Never "the user". Pets are named and referred to as _they/them_: "We've saved Biscuit's spot."
- **Casing.** Sentence case everywhere — headings, buttons, labels, table headers. No Title Case, no ALL CAPS except the 11px overline token and API status codes (`CONFIRMED`, `SLOT_UNAVAILABLE`).
- **Buttons name the outcome**, not the mechanism: "Confirm appointment", "Book a visit", "See new times", "Keep it". Never "Submit", "OK", "Yes/No".
- **Headings are short and human.** "Who's coming in?" · "Pick a service" · "Pick a time" · "Review &amp; confirm" · "You're booked".
- **Errors say what happened, what we kept, and what to do next.** "That time was just booked. We kept your pet and services. Pick another time to finish booking." The machine code (`SLOT_UNAVAILABLE`) appears in small mono type underneath — honest, never the headline.
- **Policy is stated as a benefit first.** "Free changes until 24 hours before" — then the constraint: "After that, call the salon and we'll sort it out."
- **Numbers are concrete and match the server.** "90 min", "$85", "15-minute cleanup buffer", "Eastern time". Never "approx." or "a few minutes". Prices come from the API in cents and are rendered without trailing zeros ($55, not $55.00).
- **Duration vs. buffer.** Customers see their service time and are _told_ about the buffer; they never see `blocked_until`.
- **The ampersand is always `&`** in the brand name — "Paw &amp; Polish", never "Paw and Polish".
- **No emoji. Ever.** No exclamation-mark stacking; at most one per screen, and usually zero.
- **No veterinary advice.** Pet fields are "notes for the groomer" — temperament, coat, product allergies. Never diagnose, never triage.
- **Empty states name the next step**: "No pets yet — add your dog's details once and reuse them at every booking."
- **Time words.** Days as "Wed 2 Sep", times as "10:15 AM", always business-local. Never a raw UTC timestamp in customer copy.

Admin copy is the same voice with less reassurance and more fact: "Admin overrides are audited", "The customer is not notified automatically".

---

## VISUAL FOUNDATIONS

**The idea:** a clean, well-lit salon on a warm paper background. Cool spruce green does the work (trust, cleanliness, clarity); apricot appears sparingly for warmth and for the single moment that matters — confirming a booking. Nothing bounces, nothing glows, nothing is purple.

**Colour**

- **Spruce** (`--spruce-*`, 50→950) is primary: `--spruce-700` for actions and links, 50/100 for selected surfaces, 900 for inverse panels.
- **Apricot** (`--apricot-*`, 50→700) is the accent: `--apricot-500` is the _only_ confirm-CTA fill; 100/200 tint pet and groomer avatars.
- **Sand** (`--sand-0`→`950`) neutrals are warm-tinted, never blue-grey: page `--sand-100`, cards `#fff`, sunken blocks `--sand-150`, borders 200/300, body text `--sand-800`.
- Semantics are muted, not neon: success reuses spruce, warning is a dull gold, danger is a brick red, info a slate blue. Status pills map 1:1 to the API's four appointment statuses.
- Two background colours per screen maximum: sand page + white cards. Inverse spruce panels appear only on the sign-in marketing half and toasts.

**Type**

- Display: **Bricolage Grotesque** — page titles, big numbers, prices. Bold, `-0.02em`.
- UI/body: **Plus Jakarta Sans** — 15px default, 13px small, 12px caption, 11px overline (uppercase, `0.08em`).
- Mono: **JetBrains Mono** — booking references, timestamps, error codes, price lines in summaries.
- Line-height 1.45 for body, 1.25 for headings. `text-wrap: pretty` on body, `balance` on headings.

**Spacing &amp; layout**

- 4px base scale; 16 and 24 carry most layouts, 32/40 separate sections.
- Content widths: 720px forms, 1080px app content, 248px sidebar, 64px header.
- Booking flow is a two-column grid — steps at `1fr`, a sticky 320px summary rail on the right.
- Control heights 32/40/48; any customer-tappable target is at least 44px (slot buttons are exactly 44).

**Backgrounds**

- Flat warm colour only. **No photography, no illustration, no gradient, no pattern, no texture, no grain** — the source ships no imagery, so none is faked. Where a marketing surface needs presence it uses a solid `--spruce-900` panel with text and icons.

**Borders, radii, cards**

- Radii: 4/6 details, **10 controls**, **14 cards**, 20 sheets and dialogs, pill for badges and avatars.
- Cards are white, `1px solid --sand-200`, `--shadow-xs` — nearly flat. Selected cards swap to `--spruce-50` with a `--spruce-700` border plus a 1px ring (never a coloured left-border stripe).
- Empty states use a 1px **dashed** border to read as a placeholder.
- Borders do the separating; shadows are reserved for things that genuinely float.

**Elevation**

- `xs` cards · `sm` sticky bars · `md` hover lift and menus · `lg` dialogs and toasts. All shadows are warm-tinted (`rgba(43,40,35,…)`), max 10% opacity.

**Motion**

- 140ms for control feedback, 200ms for surfaces, 320ms only for a dialog's entrance. Easing `cubic-bezier(.2,0,.2,1)`.
- Fades and 1–2px lifts. **No bounce, no spring, no scale-in, no slide-across, no skeleton shimmer.** The one spin is the button's loading icon.

**States**

- **Hover:** darken the fill one step (700→800), or tint a transparent control with `--sand-150`; interactive cards lift 1px and gain `--shadow-md`.
- **Press:** darken one more step and `translateY(1px)` — pressed things sink, they never shrink.
- **Focus:** 3px `--spruce-200` ring plus a spruce border; visible on every control, never removed.
- **Selected:** spruce border + 1px ring + soft spruce fill + a check indicator.
- **Disabled:** `--sand-200` fill, `--sand-500` text, `not-allowed` cursor — and, when a rule caused it, a one-line reason ("Already included in Full Groom"). Incompatible options stay visible; hiding them hides the rule.

**Transparency &amp; blur**

- Used exactly once: the dialog scrim (`rgba(28,26,23,.45)` + `blur(8px)`). No frosted headers, no translucent cards.

**Imagery**

- None in v1 beyond icons and letter avatars. If photography is ever added, the direction is warm, natural daylight, matte — no cool-blue clinical tones and no HDR pet portraits.

---

## ICONOGRAPHY

- **Set:** [Lucide](https://lucide.dev) — the source project had no icon dependency, so Lucide was chosen for its 24px grid and calm stroke, and **51 SVGs were copied verbatim** into `assets/icons/`. Flagged as a substitution.
- **Rendering:** one component, `Icon`, holds the same path data inline; use it in React. Raw files in `assets/icons/` are for HTML, docs, and slide use.
- **Specs:** 24×24 viewBox, `fill: none`, `stroke: currentColor`, **1.75px stroke** (2px at ≤16px), round caps and joins. Sizes 12–26px; 16 in buttons, 20 in nav, 22–26 in feature/empty tiles.
- **Colour:** always `currentColor`. Icons inherit the text colour beside them; a decorative icon uses `--text-subtle` or `--text-muted`.
- **Rules:** every icon-only control carries a `label` (accessible name + tooltip). Icons never carry meaning alone in customer copy — the words do. **No emoji anywhere. No Unicode dingbats as icons. No hand-drawn SVG.** Service icons are mapped by name (Bath &amp; Brush → droplets, Full Groom → scissors, Puppy Introduction Groom → heart, Nail Trim → paw-print, De-shedding Treatment → sparkles).
- **Logo:** none exists in the source. Wherever a mark belongs, `Logotype` sets "Paw &amp; Polish" in Bricolage Grotesque next to the Lucide paw glyph in a spruce tile. **This is a stand-in, not a logo.**

---

## Components

Authored from scratch (the source defines no component inventory), grouped by concern. Each has `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`, and one `@dsCard` per directory.

**`components/core/`** — `Icon`, `Button`, `IconButton`, `Badge`, `StatusPill`, `Card`, `Alert`, `EmptyState`, `Logotype`

**`components/forms/`** — `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `ChoiceCard`

**`components/navigation/`** — `AppHeader`, `SideNav`, `Tabs`, `StepIndicator`

**`components/feedback/`** — `Dialog`, `Toast`, `Tooltip`

**`components/booking/`** — `PetCard`, `ServiceOption`, `GroomerOption`, `TimeSlotPicker`, `PriceSummary`, `AppointmentCard`

### Intentional additions

The source has no component library, so the whole set is authored. Two groups deserve a note:

- **`components/booking/*`** are domain components, not generic primitives. They exist because the booking flow's steps (pet → services → groomer → time → review) are the product, and each has server-derived data that must not be recomputed in the UI.
- **`Logotype`** stands in for a missing brand mark; **`Icon`** wraps the substituted Lucide set.

---

## Index

| Path                     | What it is                                                     |
| ------------------------ | -------------------------------------------------------------- |
| `styles.css`             | The single entry point consumers link. `@import` lines only.   |
| `tokens/colors.css`      | Spruce, apricot, sand ramps + semantic aliases + status tokens |
| `tokens/typography.css`  | Font stacks, size scale, composed type roles                   |
| `tokens/spacing.css`     | 4px scale, container widths, control heights                   |
| `tokens/radius.css`      | Radii and border widths                                        |
| `tokens/elevation.css`   | Warm shadow set, scrim, blur                                   |
| `tokens/motion.css`      | Durations, easing, control transition                          |
| `tokens/fonts.css`       | Google Fonts import (substituted faces)                        |
| `tokens/base.css`        | Element defaults for raw HTML                                  |
| `assets/icons/*.svg`     | 51 Lucide icons                                                |
| `guidelines/*.card.html` | 16 foundation specimen cards (Colors, Type, Spacing, Brand)    |
| `components/<group>/`    | Reusable primitives + domain components                        |
| `ui_kits/customer-app/`  | Clickable customer booking app                                 |
| `ui_kits/admin-console/` | Clickable admin appointment console                            |
| `thumbnail.html`         | Homepage tile                                                  |
| `SKILL.md`               | Agent-skill entry point                                        |
| `github.md`              | Source-repo association and sync record                        |

---

## Caveats

1. **The visual identity is proposed, not recovered.** No colours, fonts, logo, or components existed in the source. Treat the palette and type as a first-round direction to approve or replace.
2. **Fonts are Google Fonts substitutions** (Bricolage Grotesque / Plus Jakarta Sans / JetBrains Mono). If licensed brand faces exist, drop the files in and rewrite `tokens/fonts.css`.
3. **Icons are substituted** (Lucide) because the project had no icon dependency.
4. **No logo was drawn.** `Logotype` is typography.
5. **No slide template** was produced — the source contains no deck to copy.
6. Screens are cosmetic recreations of the approved flow with fake data; all booking rules stay on the server, exactly as the product plan requires.
