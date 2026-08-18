import Link from "next/link";
import type { ReactNode } from "react";

import { Icon, type IconName } from "../core/icon";

const styles = {
  primary:
    "border-action bg-action text-on-primary hover:border-action-hover hover:bg-action-hover",
  secondary:
    "border-default-border bg-card text-body hover:border-strong-border hover:bg-sand-50",
  inverse:
    "border-spruce-600 bg-spruce-900 text-sand-50 hover:border-spruce-400 hover:bg-spruce-800",
} as const;

interface MarketingLinkProps {
  readonly href: string;
  readonly children: ReactNode;
  readonly variant?: keyof typeof styles;
  readonly icon?: IconName;
  readonly className?: string;
}

/** Branded link styled as a button while preserving native navigation semantics. */
export function MarketingLink({
  href,
  children,
  variant = "primary",
  icon,
  className = "",
}: MarketingLinkProps) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={`inline-flex h-(--control-h-lg) items-center justify-center gap-2 rounded-md border px-5 font-semibold tracking-snug [transition:var(--transition-control)] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${styles[variant]} ${className}`}
    >
      {children}
      {icon === undefined ? null : <Icon name={icon} size={17} />}
    </Link>
  );
}
