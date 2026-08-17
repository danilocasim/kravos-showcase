/**
 * Primary action control for Paw & Polish.
 * @startingPoint section="Core" subtitle="Buttons, icon buttons, badges and status pills" viewport="700x300"
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** Visual weight. One primary per view; accent is reserved for the booking CTA. */
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  /** Icon name from assets/icons (Lucide). */
  iconLeft?: string;
  iconRight?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
