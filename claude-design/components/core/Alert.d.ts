/** Inline message block for policy notes, recovery paths, and API error states. */
export interface AlertProps {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Right-aligned recovery action, usually a Button. */
  action?: React.ReactNode;
  /** Monospace API error code, e.g. SLOT_UNAVAILABLE. */
  code?: string;
  style?: React.CSSProperties;
}
export declare function Alert(props: AlertProps): JSX.Element;
