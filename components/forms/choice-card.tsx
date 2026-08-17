import type { InputHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "../core/icon";

export interface ChoiceCardProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly meta?: ReactNode;
  readonly icon?: IconName;
  readonly avatar?: string;
  readonly control?: "radio" | "checkbox";
  readonly disabledReason?: string;
  readonly children?: ReactNode;
  readonly inputProps: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "children" | "className" | "type"
  >;
  readonly className?: string;
}

/**
 * A booking choice backed by a native form input.
 *
 * The input remains inside its label so the full card is a tap target. Selection,
 * disabled, and focus styling derive from native state rather than duplicated
 * component state.
 */
export const ChoiceCard = ({
  title,
  description,
  meta,
  icon,
  avatar,
  control = "radio",
  disabledReason,
  children,
  inputProps,
  className = "",
}: ChoiceCardProps) => (
  <label
    className={`group relative flex min-h-(--hit-target-min) w-full items-start gap-3 rounded-lg border border-subtle-border bg-card p-4 text-left shadow-card [transition:var(--transition-control)] hover:-translate-y-px hover:border-strong-border hover:shadow-menu has-[:checked]:border-action has-[:checked]:bg-primary-soft has-[:checked]:ring-1 has-[:checked]:ring-action has-[:focus-visible]:border-focus has-[:focus-visible]:shadow-[var(--focus-ring)] has-[:disabled]:cursor-not-allowed has-[:disabled]:border-subtle-border has-[:disabled]:bg-sunken has-[:disabled]:opacity-70 has-[:disabled]:shadow-none has-[:disabled]:hover:translate-y-0 ${
      inputProps.disabled === true ? "cursor-not-allowed" : "cursor-pointer"
    } ${className}`}
  >
    <input
      type={control}
      className="peer sr-only"
      {...inputProps}
    />
    {avatar !== undefined ? (
      <span className="grid size-10 flex-none place-items-center rounded-full bg-apricot-200 [font:var(--type-body-strong)] text-spruce-900">
        {avatar}
      </span>
    ) : icon !== undefined ? (
      <span className="grid size-9 flex-none place-items-center rounded-md bg-sunken text-muted [transition:var(--transition-control)] peer-checked:bg-spruce-100 peer-checked:text-spruce-700 peer-disabled:text-disabled-text">
        <Icon name={icon} size={19} />
      </span>
    ) : null}
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="flex items-baseline justify-between gap-2">
        <span className="[font:var(--type-body-strong)] text-heading">
          {title}
        </span>
        {meta !== undefined ? (
          <span className="flex-none [font:var(--type-body-strong)] text-heading">
            {meta}
          </span>
        ) : null}
      </span>
      {description !== undefined ? (
        <span className="[font:var(--type-small)] text-muted">
          {description}
        </span>
      ) : null}
      {inputProps.disabled === true && disabledReason !== undefined ? (
        <span className="mt-0.5 inline-flex items-center gap-1.5 [font:var(--type-caption)] text-warning-700">
          <Icon name="ban" size={12} />
          {disabledReason}
        </span>
      ) : null}
      {children}
    </span>
    <span
      aria-hidden="true"
      className={`mt-0.5 grid size-5 flex-none place-items-center border border-strong-border bg-card text-transparent [transition:var(--transition-control)] peer-checked:border-action peer-checked:bg-action peer-checked:text-white peer-disabled:border-default-border peer-disabled:bg-disabled ${
        control === "checkbox" ? "rounded-xs" : "rounded-full"
      }`}
    >
      <Icon
        name="check"
        size={13}
      />
    </span>
  </label>
);
