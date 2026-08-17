import type { InputHTMLAttributes, ReactNode } from "react";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "children" | "type"> {
  readonly label: ReactNode;
}

/** Accessible native checkbox presented as an on/off switch. */
export const Switch = ({ label, className = "", ...props }: SwitchProps) => (
  <label className={`inline-flex min-h-11 cursor-pointer items-center gap-2.5 [font:var(--type-small)] text-body ${className}`}>
    <input type="checkbox" role="switch" className="peer sr-only" {...props} />
    <span aria-hidden="true" className="relative h-6 w-11 rounded-full border border-strong-border bg-sand-200 transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-4.5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-action peer-checked:bg-action peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus peer-disabled:cursor-not-allowed peer-disabled:opacity-60" />
    <span>{label}</span>
  </label>
);
