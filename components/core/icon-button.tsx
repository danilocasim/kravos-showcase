import type { ButtonHTMLAttributes } from "react";

import { Icon, type IconName } from "./icon";

const variantStyles = {
  ghost: "border-transparent text-muted hover:bg-sunken",
  outline: "border-default-border bg-card text-body hover:border-strong-border hover:bg-sand-50",
  solid: "border-transparent bg-action text-on-primary hover:bg-action-hover",
  danger: "border-transparent text-danger-500 hover:bg-danger-50",
} as const;

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  readonly icon: IconName;
  readonly label: string;
  readonly variant?: keyof typeof variantStyles;
  readonly size?: "sm" | "md" | "lg";
}

export const IconButton = ({
  icon,
  label,
  variant = "ghost",
  size = "md",
  className = "",
  type = "button",
  ...props
}: IconButtonProps) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={`inline-flex items-center justify-center rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50 ${
      size === "lg" ? "size-11" : size === "sm" ? "size-11 sm:size-7" : "size-11 sm:size-9"
    } ${variantStyles[variant]} ${className}`}
    {...props}
  >
    <Icon name={icon} size={size === "lg" ? 20 : size === "sm" ? 15 : 17} />
  </button>
);
