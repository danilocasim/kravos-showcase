import Link from "next/link";

import { signOutAction } from "../../app/(app)/actions";
import { Badge } from "../core/badge";
import { Button } from "../core/button";
import { Logotype } from "../core/logotype";

const initials = (name: string): string => name
  .split(/\s+/)
  .filter(Boolean)
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

/** Verified administrator identity and global product actions. */
export const AdminHeader = ({ userName }: { readonly userName: string }) => (
  <header className="border-b border-subtle-border bg-card">
    <div className="mx-auto flex min-h-(--header-h) max-w-(--container-wide) items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
      <Link href="/admin" prefetch={false} aria-label="Paw & Polish admin home" className="flex-none">
        <Logotype size="sm" />
      </Link>
      <Badge tone="primary" icon="shield-check">Admin</Badge>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <span className="inline-flex items-center gap-2 [font:var(--type-small)] text-body">
          <span className="grid size-8 place-items-center rounded-full bg-apricot-100 [font:var(--type-caption)] font-bold text-spruce-900">
            {initials(userName)}
          </span>
          <span className="hidden md:inline">{userName}</span>
        </span>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm" iconLeft="log-out" aria-label="Sign out" title="Sign out" className="min-w-11 px-0 sm:min-w-9">
            <span className="sr-only">Sign out</span>
          </Button>
        </form>
      </div>
    </div>
  </header>
);
