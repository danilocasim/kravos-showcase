"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ApplicationRole } from "../../lib/auth/guards";
import { customerNavigationItems } from "../../lib/ui/navigation/items";
import { Icon } from "../core/icon";

/** Customer navigation with an admin-console entry for verified administrators. */
export const CustomerNav = ({ role }: { readonly role: ApplicationRole }) => {
  const pathname = usePathname();
  const items = customerNavigationItems(role);
  return (
    <nav aria-label="Customer" className="order-3 flex w-full items-center gap-1 sm:order-none sm:ml-4 sm:w-auto">
      {items.map((item) => {
        const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            aria-current={current ? "page" : undefined}
            className={`inline-flex min-h-11 items-center gap-2 rounded-md px-3 [font:var(--type-body)] hover:bg-sunken focus-visible:outline-2 focus-visible:outline-focus sm:min-h-9 ${current ? "bg-primary-soft text-heading" : "text-muted hover:text-heading"}`}
          >
            <Icon name={item.icon} size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
