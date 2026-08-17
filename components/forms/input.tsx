import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly invalid?: boolean;
}

export const Input = ({ invalid = false, className = "", ...props }: InputProps) => (
  <input
    aria-invalid={invalid || undefined}
    className={`h-(--control-h-md) w-full rounded-md border bg-card px-(--pad-field-x) [font:var(--type-body)] text-body outline-none transition-colors placeholder:text-subtle hover:border-strong-border focus:border-focus focus:shadow-[var(--focus-ring)] disabled:cursor-not-allowed disabled:bg-sunken disabled:text-disabled-text ${
      invalid ? "border-danger-500 focus:border-danger-500 focus:shadow-[0_0_0_3px_var(--danger-50)]" : "border-default-border"
    } ${className}`}
    {...props}
  />
);
