/**
 * A customer's dog: identity, operational notes, and row actions.
 * @startingPoint section="Booking" subtitle="Pet record with operational notes" viewport="700x220"
 */
export interface PetCardProps {
  name: string;
  breed?: string;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  ageYears?: number;
  /** Optional operational note, e.g. "Calm". */
  temperament?: string;
  /** Optional allergy note; rendered as a warning badge. */
  allergies?: string;
  notes?: string;
  /** Makes the whole card a choice in step 1 of booking. */
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  style?: React.CSSProperties;
}
export declare function PetCard(props: PetCardProps): JSX.Element;
