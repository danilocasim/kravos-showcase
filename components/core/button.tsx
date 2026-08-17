import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "./icon";

/**
 * The design system's button.
 *
 * Hover, active, and disabled states are Tailwind variants rather than React
 * state, which keeps this a Server Component. Pressed buttons sink by 1px; they
 * never shrink.
 *
 * Use one primary per view. `accent` is reserved for confirming a booking, and
 * `danger` only appears inside a dialog.
 */

const base =
  "inline-flex flex-none items-center justify-center rounded-md border font-semibold tracking-snug whitespace-nowrap [transition:var(--transition-control)] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:active:translate-y-0";

const variantStyles = {
  primary:
    "border-action bg-action text-on-primary hover:border-action-hover hover:bg-action-hover disabled:border-disabled disabled:bg-disabled disabled:text-disabled-text",
  accent:
    "border-accent bg-accent text-spruce-950 hover:border-accent-hover hover:bg-accent-hover disabled:border-disabled disabled:bg-disabled disabled:text-disabled-text",
  secondary:
    "border-default-border bg-card text-body hover:border-strong-border hover:bg-sand-50 disabled:border-disabled disabled:bg-disabled disabled:text-disabled-text",
  ghost:
    "border-transparent bg-transparent text-body hover:bg-sunken disabled:bg-transparent disabled:text-disabled-text",
  danger:
    "border-danger-500 bg-danger-500 text-white hover:border-danger-700 hover:bg-danger-700 disabled:border-disabled disabled:bg-disabled disabled:text-disabled-text",
  link: "h-auto rounded-xs border-transparent bg-transparent p-0 text-link underline underline-offset-[3px] hover:text-link-hover disabled:bg-transparent disabled:text-disabled-text",
} as const;

const sizeStyles = {
  sm: "h-(--control-h-sm) gap-1.5 px-3 text-sm",
  md: "h-(--control-h-md) gap-2 px-4 text-base",
  lg: "h-(--control-h-lg) gap-2 px-6 text-md",
} as const;

const iconSizes = { sm: 14, md: 16, lg: 18 } as const;

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  readonly variant?: keyof typeof variantStyles;
  readonly size?: keyof typeof sizeStyles;
  readonly iconLeft?: IconName;
  readonly iconRight?: IconName;
  /** Shows a spinner and blocks the click while a mutation is in flight. */
  readonly loading?: boolean;
  readonly fullWidth?: boolean;
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Renders a button whose label names the outcome, not the mechanism.
 *
 * @param props - Variant, size, optional icons, and loading state.
 * @returns A button element.
 */
export const Button = ({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) => {
  const iconSize = iconSizes[size];
  const sizing = variant === "link" ? "gap-1.5 text-base" : sizeStyles[size];

  return (
    <button
      type={type}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      className={`${base} ${variantStyles[variant]} ${sizing} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...rest}
    >
      {loading ? (
        <Icon name="loader-circle" size={iconSize} className="animate-spin" />
      ) : iconLeft !== undefined ? (
        <Icon name={iconLeft} size={iconSize} />
      ) : null}
      {children}
      {iconRight !== undefined && !loading ? (
        <Icon name={iconRight} size={iconSize} />
      ) : null}
    </button>
  );
};
