import type { ReactNode } from "react";

import { Icon, type IconName } from "./icon";

const toneStyles = {
  neutral: "border-sand-200 bg-sand-150 text-sand-700",
  primary: "border-spruce-200 bg-spruce-50 text-spruce-700",
  accent: "border-apricot-200 bg-apricot-100 text-apricot-700",
  success: "border-spruce-200 bg-success-50 text-success-700",
  warning: "border-apricot-200 bg-warning-50 text-warning-700",
  danger: "border-danger-500/20 bg-danger-50 text-danger-700",
  info: "border-info-500/20 bg-info-50 text-info-700",
} as const;

export interface BadgeProps {
  readonly children: ReactNode;
  readonly tone?: keyof typeof toneStyles;
  readonly icon?: IconName;
  readonly size?: "sm" | "md";
}

export const Badge = ({
  children,
  tone = "neutral",
  icon,
  size = "md",
}: BadgeProps) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border whitespace-nowrap [font:var(--type-caption)] ${
      size === "sm" ? "px-2 py-0.5 text-2xs" : "px-2.5 py-1 text-xs"
    } ${toneStyles[tone]}`}
  >
    {icon !== undefined ? <Icon name={icon} size={size === "sm" ? 11 : 13} /> : null}
    {children}
  </span>
);
