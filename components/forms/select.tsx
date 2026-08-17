import type { SelectHTMLAttributes } from "react";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly options: ReadonlyArray<SelectOption>;
  readonly placeholder?: string;
  readonly invalid?: boolean;
}

export const Select = ({
  options,
  placeholder,
  invalid = false,
  className = "",
  ...props
}: SelectProps) => (
  <select
    aria-invalid={invalid || undefined}
    className={`h-(--control-h-md) w-full appearance-none rounded-md border bg-card px-(--pad-field-x) [font:var(--type-body)] text-body outline-none transition-colors hover:border-strong-border focus:border-focus focus:shadow-[var(--focus-ring)] disabled:cursor-not-allowed disabled:bg-sunken ${
      invalid ? "border-danger-500 focus:border-danger-500 focus:shadow-[0_0_0_3px_var(--danger-50)]" : "border-default-border"
    } ${className}`}
    {...props}
  >
    {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);
