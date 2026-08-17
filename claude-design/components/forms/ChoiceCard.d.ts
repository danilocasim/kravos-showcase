/**
 * Large selectable row used for every primary booking choice: pet, service, add-on, groomer.
 * @startingPoint section="Booking" subtitle="Selectable pet / service / groomer rows" viewport="700x340"
 */
export interface ChoiceCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned value, e.g. "$55" or "90 min". */
  meta?: React.ReactNode;
  /** Icon name from assets/icons. */
  icon?: string;
  /** Short initials shown in a round avatar (groomers). */
  avatar?: string;
  selected?: boolean;
  disabled?: boolean;
  /** Shape of the indicator: single choice or multi-select. */
  control?: 'radio' | 'checkbox';
  onSelect?: () => void;
  /** Explains why the option is unavailable, e.g. "Included in Full Groom". */
  disabledReason?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function ChoiceCard(props: ChoiceCardProps): JSX.Element;
