/** Centered modal for explicit confirmations (cancel appointment, delete pet). */
export interface DialogProps {
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Right-aligned action row; put the cancel/secondary action first. */
  footer?: React.ReactNode;
  onClose?: () => void;
  width?: number;
  tone?: 'default' | 'warning' | 'danger';
  style?: React.CSSProperties;
}
export declare function Dialog(props: DialogProps): JSX.Element | null;
