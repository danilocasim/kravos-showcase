import type { TextareaHTMLAttributes } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly invalid?: boolean;
}

export const Textarea = ({ invalid = false, className = "", ...props }: TextareaProps) => (
  <textarea
    aria-invalid={invalid || undefined}
    className={`min-h-24 w-full resize-y rounded-md border bg-card px-(--pad-field-x) py-(--pad-field-y) [font:var(--type-body)] text-body outline-none transition-colors placeholder:text-subtle hover:border-strong-border focus:border-focus focus:shadow-[var(--focus-ring)] disabled:cursor-not-allowed disabled:bg-sunken ${
      invalid ? "border-danger-500 focus:border-danger-500 focus:shadow-[0_0_0_3px_var(--danger-50)]" : "border-default-border"
    } ${className}`}
    {...props}
  />
);
