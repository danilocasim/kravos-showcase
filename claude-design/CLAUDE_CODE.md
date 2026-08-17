# Using this design system in your local Next.js project with Claude Code

## What to hand over (no screenshots needed)

Copy this **whole folder** into your repo. Code beats screenshots — Claude Code reads the
tokens and component source directly and will match them exactly. Screenshots only help for
a quick "does it look right" sanity check; they're lossy and optional.

```
your-repo/
  .claude/skills/paw-and-polish-design/     <-- put the downloaded folder here
    SKILL.md          <-- makes it an invocable Agent Skill
    readme.md         <-- content + visual foundations + iconography (the important one)
    styles.css        <-- single CSS entry point
    tokens/*.css
    assets/icons/*.svg
    components/**     <-- .jsx + .d.ts + .prompt.md per component
    ui_kits/**        <-- clickable HTML recreations of the real screens
```

The three markdown files that matter:
- `readme.md` — voice, palette, type, spacing, states, iconography, caveats.
- `<Component>.prompt.md` — one per component: what it is, when to use it, a usage example.
- `ui_kits/*/README.md` — what each screen is and what to click.

## Wiring it into the Next.js app (Tailwind v4)

1. Copy `tokens/` and `styles.css` into the app, e.g. `app/design/`.
2. In `app/globals.css`:
   ```css
   @import "tailwindcss";
   @import "./design/styles.css";
   ```
   Tailwind v4 can consume the custom properties directly with `@theme inline` if you want
   `bg-spruce-700`-style classes; otherwise use `var(--action-primary)` in component styles.
3. Copy `assets/icons/` to `public/icons/`, or `pnpm add lucide-react` — the icon set here **is**
   Lucide, so the npm package is a drop-in with the same names (`paw-print` → `PawPrint`).
4. The `components/**/*.jsx` files are framework-agnostic React with inline styles and no
   dependencies. You can paste them in as-is, or (better) have Claude Code re-express them in
   your conventions — the `.d.ts` files are the prop contracts.

## Prompt to give Claude Code

> Read `.claude/skills/paw-and-polish-design/readme.md` and the `.prompt.md` files, then build
> the customer booking flow (Phase 4, Task 12) as Next.js App Router screens. Match
> `ui_kits/customer-app/` exactly. Use the CSS custom properties from `tokens/`, never new colors.
> All availability, pricing and duration come from `/api/v1` — the UI computes nothing.

If the skill folder is under `.claude/skills/`, you can also just type `/paw-and-polish-design`.

## Is there an MCP for design → Claude Code?

There's no live bridge between this design canvas and your local Claude Code session — the
handoff is the folder above, and it's the reliable path: real CSS, real component source, real
prop types, all readable by the agent. Once it's committed in your repo, Claude Code has
strictly more information than any screenshot or MCP call would give it.

To keep the two in sync: this project records its source repo in `github.md`, so re-import
after the UI ships and I'll refresh the kits against your real components.
