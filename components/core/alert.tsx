import type { ReactNode } from "react";

import { Icon, type IconName } from "./icon";

/**
 * An inline message that stays on screen until the customer acts on it.
 *
 * This is the booking flow's error surface, not Toast: an error needs a recovery
 * route, and a toast disappears. The machine code renders in small mono type
 * underneath the body, so it is honest without becoming the headline.
 */

const toneStyles = {
  info: {
    container: "border-[#cfe1ef] bg-info-50",
    heading: "text-info-700",
    icon: "info",
  },
  success: {
    container: "border-spruce-200 bg-success-50",
    heading: "text-success-700",
    icon: "circle-check",
  },
  warning: {
    container: "border-apricot-200 bg-warning-50",
    heading: "text-warning-700",
    icon: "triangle-alert",
  },
  danger: {
    container: "border-[#f3cfcb] bg-danger-50",
    heading: "text-danger-700",
    icon: "circle-alert",
  },
} as const satisfies Record<
  string,
  { container: string; heading: string; icon: IconName }
>;

export interface AlertProps {
  readonly tone?: keyof typeof toneStyles;
  readonly title?: string;
  /** Machine error code, rendered in mono under the body. */
  readonly code?: string;
  readonly action?: ReactNode;
  readonly children?: ReactNode;
  readonly className?: string;
}

/**
 * Renders an inline alert.
 *
 * A danger alert is announced immediately; the other tones are polite, so a
 * success or informational message does not interrupt what the customer is doing.
 *
 * @param props - Tone, optional title, body, machine code, and action slot.
 * @returns An alert region.
 */
export const Alert = ({
  tone = "info",
  title,
  code,
  action,
  children,
  className = "",
}: AlertProps) => {
  const styles = toneStyles[tone];

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-md border p-4 ${styles.container} ${className}`}
    >
      <span className={`flex-none pt-px ${styles.heading}`}>
        <Icon name={styles.icon} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        {title !== undefined ? (
          <p className={`[font:var(--type-body-strong)] ${styles.heading}`}>
            {title}
          </p>
        ) : null}
        {children !== undefined ? (
          <div className="[font:var(--type-small)] text-body">{children}</div>
        ) : null}
        {code !== undefined ? (
          <p className="mt-1 [font:var(--type-mono)] text-xs text-subtle">
            {code}
          </p>
        ) : null}
      </div>
      {action !== undefined ? <div className="flex-none">{action}</div> : null}
    </div>
  );
};
