import Link from "next/link";

import { Logotype } from "../core/logotype";
import { MarketingLink } from "./marketing-link";

const links = [
  ["Services", "#services"],
  ["Our approach", "#approach"],
  ["Groomers", "#groomers"],
  ["Visit", "#visit"],
] as const;

/** Public-site navigation; the section rail stays reachable at every width. */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-subtle-border bg-card">
      <div className="mx-auto flex min-h-(--header-h) max-w-(--container-wide) items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          aria-label="Paw & Polish home"
          className="flex-none rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        >
          <Logotype size="sm" />
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-6 md:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-sm [font:var(--type-small)] font-semibold text-muted hover:text-heading focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/sign-in"
            prefetch={false}
            className="inline-flex h-(--control-h-md) items-center rounded-md px-3 [font:var(--type-small)] font-semibold text-body hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Sign in
          </Link>
          <MarketingLink href="/sign-up" className="h-(--control-h-md) px-4 text-sm">
            Book a visit
          </MarketingLink>
        </div>
      </div>

      <nav
        aria-label="Sections"
        className="border-t border-subtle-border bg-page-alt md:hidden"
      >
        <ul className="flex snap-x gap-1 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map(([label, href]) => (
            <li key={href} className="snap-start">
              <Link
                href={href}
                className="inline-flex min-h-(--hit-target-min) items-center rounded-md px-3 whitespace-nowrap [font:var(--type-small)] font-semibold text-muted hover:text-heading focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
