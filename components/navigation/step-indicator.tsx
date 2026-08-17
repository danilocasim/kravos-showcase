import Link, { type LinkProps } from "next/link";

import { Icon } from "../core/icon";

export interface StepIndicatorItem {
  readonly label: string;
  /** Present only when a completed step can be revisited. */
  readonly href?: LinkProps["href"];
}

export interface StepIndicatorProps {
  readonly steps: ReadonlyArray<StepIndicatorItem>;
  /** Zero-based index of the current step. */
  readonly current: number;
  readonly ariaLabel?: string;
  readonly className?: string;
}

/** Responsive progress navigation for the five-step booking flow. */
export const StepIndicator = ({
  steps,
  current,
  ariaLabel = "Booking progress",
  className = "",
}: StepIndicatorProps) => (
  <nav aria-label={ariaLabel} className={className}>
    <ol className="flex w-full items-center">
      {steps.map((step, index) => {
        const completed = index < current;
        const active = index === current;
        const marker = (
          <>
            <span
              aria-hidden="true"
              className={`grid size-6 flex-none place-items-center rounded-full border [font:var(--type-caption)] font-bold ${
                completed
                  ? "border-spruce-200 bg-spruce-100 text-spruce-700"
                  : active
                    ? "border-action bg-action text-on-primary"
                    : "border-subtle-border bg-sunken text-subtle"
              }`}
            >
              {completed ? <Icon name="check" size={13} /> : index + 1}
            </span>
            <span className="hidden whitespace-nowrap sm:inline">{step.label}</span>
            <span className="sr-only sm:hidden">{step.label}</span>
          </>
        );
        const label = `Step ${index + 1}: ${step.label}${active ? ", current step" : completed ? ", completed" : ""}`;
        const markerClass = `inline-flex min-h-(--hit-target-min) min-w-11 items-center justify-center gap-2 rounded-md [font:var(--type-small)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:min-w-0 ${
          active
            ? "font-semibold text-heading"
            : completed
              ? "text-body"
              : "text-subtle"
        }`;

        return (
          <li
            key={step.label}
            className="flex min-w-0 flex-1 items-center last:flex-none"
          >
            {completed && step.href !== undefined ? (
              <Link href={step.href} aria-label={label} className={markerClass}>
                {marker}
              </Link>
            ) : (
              <span
                aria-current={active ? "step" : undefined}
                aria-label={label}
                className={markerClass}
              >
                {marker}
              </span>
            )}
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={`mx-1 h-px min-w-2 flex-1 sm:mx-3 ${
                  completed ? "bg-spruce-300" : "bg-default-border"
                }`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  </nav>
);
