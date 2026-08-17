/** Groomer choice for step 3, including the "Any available groomer" option. */
export interface GroomerOptionProps {
  name?: string;
  /** Short groomer bio from the API. */
  bio?: string;
  /** Working-hours summary, e.g. "Tue–Sat, 9:00 AM–5:00 PM". */
  hours?: string;
  /** Renders the server-assigned option instead of a named groomer. */
  anyAvailable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  /** e.g. "Not qualified for De-shedding Treatment". */
  disabledReason?: string;
  onSelect?: () => void;
  style?: React.CSSProperties;
}
export declare function GroomerOption(props: GroomerOptionProps): JSX.Element;
