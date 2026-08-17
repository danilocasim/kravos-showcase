"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type IconName } from "../core/icon";

const items: ReadonlyArray<{ readonly href: string; readonly label: string; readonly icon: IconName; readonly exact: boolean }> = [
  { href: "/admin", label: "Schedule", icon: "calendar-check", exact: true },
  { href: "/admin/groomers", label: "Groomers", icon: "users", exact: false },
  { href: "/admin/services", label: "Services", icon: "scissors", exact: false },
];

/** Route-aware admin navigation; horizontal on small screens and vertical on wide screens. */
export const AdminNav = () => {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="overflow-x-auto border-b border-subtle-border bg-page-alt lg:border-r lg:border-b-0">
      <div className="mx-auto flex min-w-max gap-1 px-4 py-3 sm:px-6 lg:sticky lg:top-0 lg:mx-0 lg:w-[248px] lg:min-w-0 lg:flex-col lg:px-4 lg:py-6">
        {items.map((item) => {
          const current = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={current ? "page" : undefined}
              className={`inline-flex min-h-11 items-center gap-3 rounded-md px-3 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${current ? "bg-primary-soft text-spruce-900" : "text-muted hover:bg-sunken hover:text-heading"}`}
            >
              <Icon name={item.icon} size={17} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
