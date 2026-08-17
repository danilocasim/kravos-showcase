/** Transient confirmation of a completed action. Never used for errors that need a recovery route (use Alert). */
export interface ToastProps {
  tone?: 'success' | 'info' | 'danger';
  title: React.ReactNode;
  description?: React.ReactNode;
  onDismiss?: () => void;
  style?: React.CSSProperties;
}
export declare function Toast(props: ToastProps): JSX.Element;
