/** Label + hint + inline error wrapper for every form control. */
export interface FieldProps {
  label?: React.ReactNode;
  /** id of the control it labels. */
  htmlFor?: string;
  hint?: React.ReactNode;
  /** When set, replaces the hint and switches the control to its invalid styling. */
  error?: React.ReactNode;
  required?: boolean;
  /** Shows a quiet "Optional" marker instead of nothing. */
  optionalLabel?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Field(props: FieldProps): JSX.Element;
