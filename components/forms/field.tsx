import {
  cloneElement,
  isValidElement,
  type ReactElement,
} from "react";

import { Icon } from "../core/icon";
import { fieldIds } from "../../lib/ui/field-ids";

export interface FieldProps {
  readonly label: string;
  readonly htmlFor: string;
  readonly hint?: string | undefined;
  readonly error?: string | undefined;
  readonly required?: boolean;
  readonly optionalLabel?: boolean;
  readonly children: ReactElement<Record<string, unknown>>;
  readonly className?: string;
}

export const Field = ({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  optionalLabel = false,
  children,
  className = "",
}: FieldProps) => {
  const ids = fieldIds(htmlFor, {
    hasHint: hint !== undefined,
    hasError: error !== undefined,
  });
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: ids.controlId,
        "aria-describedby": ids.describedBy,
        "aria-invalid": ids.invalid || undefined,
        "aria-required": required || undefined,
        required,
        invalid: ids.invalid,
      })
    : children;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="flex items-baseline gap-1.5 [font:var(--type-label)] text-heading"
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="text-danger-500">
            *
          </span>
        ) : null}
        {optionalLabel && !required ? (
          <span className="[font:var(--type-caption)] font-normal text-subtle">
            Optional
          </span>
        ) : null}
      </label>
      {control}
      {hint !== undefined ? (
        <span id={ids.hintId} className="[font:var(--type-caption)] text-muted">
          {hint}
        </span>
      ) : null}
      {error !== undefined ? (
        <span
          id={ids.errorId}
          role="alert"
          className="inline-flex items-center gap-1 [font:var(--type-caption)] text-danger-700"
        >
          <Icon name="circle-alert" size={13} />
          {error}
        </span>
      ) : null}
    </div>
  );
};
