import Link from "next/link";

import { signOutAction } from "../../app/(app)/actions";
import type { ApplicationRole } from "../../lib/auth/guards";
import { Button } from "../core/button";
import { Icon } from "../core/icon";
import { Logotype } from "../core/logotype";
import { CustomerNav } from "./customer-nav";

export interface AppHeaderProps {
  readonly userName: string;
  readonly role: ApplicationRole;
}

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const AppHeader = ({ userName, role }: AppHeaderProps) => (
  <header className="border-b border-subtle-border bg-card">
    <div className="mx-auto flex min-h-(--header-h) max-w-(--container-app) flex-wrap items-center gap-2 px-4 py-2 sm:flex-nowrap sm:gap-6 sm:px-6 sm:py-0">
      <Link href="/appointments" prefetch={false} aria-label="Paw & Polish home" className="flex-none">
        <Logotype size="sm" />
      </Link>
      <CustomerNav role={role} />
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link
          href="/book"
          prefetch={false}
          className="hidden h-(--control-h-sm) items-center gap-1.5 rounded-md border border-action bg-action px-3 text-sm font-semibold text-on-primary hover:bg-action-hover sm:inline-flex"
        >
          <Icon name="plus" size={14} />
          Book a visit
        </Link>
        <span className="inline-flex items-center gap-2 [font:var(--type-small)] text-body">
          <span className="grid size-8 place-items-center rounded-full bg-spruce-100 [font:var(--type-caption)] font-bold text-spruce-800">
            {initials(userName)}
          </span>
          <span className="hidden md:inline">{userName}</span>
        </span>
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            iconLeft="log-out"
            aria-label="Sign out"
            title="Sign out"
            className="min-w-11 px-0 sm:min-w-9"
          >
            <span className="sr-only">Sign out</span>
          </Button>
        </form>
      </div>
    </div>
  </header>
);
