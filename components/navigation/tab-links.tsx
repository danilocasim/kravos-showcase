import Link, { type LinkProps } from "next/link";

import { Icon, type IconName } from "../core/icon";

export interface TabLinkItem {
  readonly value: string;
  readonly label: string;
  readonly href: LinkProps["href"];
  readonly icon?: IconName;
  readonly count?: number;
}

export interface TabLinksProps {
  readonly items: ReadonlyArray<TabLinkItem>;
  readonly activeValue: string;
  readonly ariaLabel: string;
  readonly size?: "sm" | "md";
  readonly className?: string;
}

/** Deep-linkable filters styled as underline tabs, without tab-widget semantics. */
export const TabLinks = ({
  items,
  activeValue,
  ariaLabel,
  size = "md",
  className = "",
}: TabLinksProps) => (
  <nav aria-label={ariaLabel} className={className}>
    <div className="flex overflow-x-auto border-b border-subtle-border">
      {items.map((item) => {
        const active = item.value === activeValue;

        return (
          <Link
            key={item.value}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px inline-flex min-h-(--hit-target-min) flex-none items-center gap-2 border-b-2 px-3 whitespace-nowrap [transition:var(--transition-control)] focus-visible:relative focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus ${
              size === "sm" ? "text-sm" : "text-base"
            } ${
              active
                ? "border-action font-semibold text-heading"
                : "border-transparent text-muted hover:border-default-border hover:text-heading"
            }`}
          >
            {item.icon !== undefined ? <Icon name={item.icon} size={16} /> : null}
            {item.label}
            {item.count !== undefined ? (
              <span
                className={`rounded-full px-1.5 py-0.5 [font:var(--type-caption)] ${
                  active ? "bg-spruce-50 text-spruce-700" : "bg-sunken text-subtle"
                }`}
              >
                {item.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  </nav>
);
