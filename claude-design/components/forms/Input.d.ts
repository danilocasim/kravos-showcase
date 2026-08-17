/** Single-line text input. Always pair with Field for its label. */
export interface InputProps {
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'search' | 'date';
  size?: 'sm' | 'md' | 'lg';
  /** Icon name from assets/icons, rendered inside the left edge. */
  iconLeft?: string;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
