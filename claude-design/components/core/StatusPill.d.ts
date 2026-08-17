/** Appointment lifecycle status, mapped 1:1 to the API's appointment status values. */
export interface StatusPillProps {
  status?: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'PENDING';
  /** Override the default label text. */
  label?: string;
  style?: React.CSSProperties;
}
export declare function StatusPill(props: StatusPillProps): JSX.Element;
