import { Icon, type IconName } from "./icon";

/** Appointment lifecycle values exposed by the booking UI. */
export type AppointmentStatus =
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "PENDING";

const statusStyles = {
  CONFIRMED: {
    label: "Confirmed",
    icon: "circle-check",
    className: "bg-status-confirmed-bg text-status-confirmed-fg",
  },
  COMPLETED: {
    label: "Completed",
    icon: "check",
    className: "bg-status-completed-bg text-status-completed-fg",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: "circle-x",
    className: "bg-status-cancelled-bg text-status-cancelled-fg",
  },
  PENDING: {
    label: "Awaiting confirmation",
    icon: "clock",
    className: "bg-status-pending-bg text-status-pending-fg",
  },
} as const satisfies Record<
  AppointmentStatus,
  { readonly label: string; readonly icon: IconName; readonly className: string }
>;

export interface StatusPillProps {
  readonly status?: AppointmentStatus;
  readonly label?: string;
  readonly className?: string;
}

/** Renders a text-and-icon appointment status without relying on colour alone. */
export const StatusPill = ({
  status = "CONFIRMED",
  label,
  className = "",
}: StatusPillProps) => {
  const styles = statusStyles[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 [font:var(--type-caption)] font-semibold whitespace-nowrap ${styles.className} ${className}`}
    >
      <Icon name={styles.icon} size={13} />
      {label ?? styles.label}
    </span>
  );
};
