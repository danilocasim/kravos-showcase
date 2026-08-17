/**
 * A booked visit in the customer's list or the admin console.
 * @startingPoint section="Booking" subtitle="Appointment row with status and actions" viewport="700x260"
 */
export interface AppointmentCardProps {
  petName?: string;
  /** Snapshotted service names, in selection order. */
  services?: string[];
  groomerName?: string;
  /** Three tokens: weekday, day number, month — e.g. "Wed 2 Sep". */
  dateLabel?: string;
  /** Business-timezone start, e.g. "10:15 AM". */
  timeLabel?: string;
  /** Customer-facing end time (excludes the cleanup buffer). */
  endTimeLabel?: string;
  /** Snapshotted subtotal in integer cents. */
  subtotalCents?: number;
  status?: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'PENDING';
  /** Booking reference / appointment id. */
  reference?: string;
  /** Action row, usually Buttons for reschedule and cancel. */
  actions?: React.ReactNode;
  /** Cutoff explanation shown when the customer can no longer change it. */
  lockedNote?: string;
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function AppointmentCard(props: AppointmentCardProps): JSX.Element;
