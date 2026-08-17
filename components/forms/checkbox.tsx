import type { InputHTMLAttributes, ReactNode } from "react";

import { Icon } from "../core/icon";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "children" | "className" | "type"> {
  readonly label?: ReactNode;
  readonly description?: ReactNode;
  readonly className?: string;
  readonly inputClassName?: string;
}

/** A native checkbox with a large label target and visible checked/focus states. */
export const Checkbox = ({
  label,
  description,
  className = "",
  inputClassName = "",
  ...inputProps
}: CheckboxProps) => (
  <label
    className={`inline-flex min-h-(--hit-target-min) items-start gap-3 rounded-sm py-1.5 text-left has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 ${
      inputProps.disabled === true ? "cursor-not-allowed" : "cursor-pointer"
    } ${className}`}
  >
    <input
      type="checkbox"
      className={`peer sr-only ${inputClassName}`}
      {...inputProps}
    />
    <span
      aria-hidden="true"
      className="mt-px grid size-5 flex-none place-items-center rounded-xs border border-strong-border bg-card text-transparent [transition:var(--transition-control)] peer-checked:border-action peer-checked:bg-action peer-checked:text-white peer-focus-visible:border-focus peer-focus-visible:shadow-[var(--focus-ring)] peer-disabled:border-default-border peer-disabled:bg-disabled"
    >
      <Icon
        name="check"
        size={14}
      />
    </span>
    {label !== undefined || description !== undefined ? (
      <span className="flex min-w-0 flex-col gap-0.5">
        {label !== undefined ? (
          <span className="[font:var(--type-body)] text-body">{label}</span>
        ) : null}
        {description !== undefined ? (
          <span className="[font:var(--type-caption)] text-muted">
            {description}
          </span>
        ) : null}
      </span>
    ) : null}
  </label>
);
