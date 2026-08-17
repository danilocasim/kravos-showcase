/** One catalogue service, rendered from the API's service record. Prices come from the server, never computed client-side. */
export interface ServiceOptionProps {
  name: string;
  description?: string;
  durationMinutes?: number;
  /** Integer cents, exactly as the API returns it. */
  priceCents?: number;
  /** BASE renders as a single choice; ADD_ON renders as a multi-select. */
  kind?: 'BASE' | 'ADD_ON';
  selected?: boolean;
  disabled?: boolean;
  /** Compatibility reason, e.g. "Included in Full Groom". */
  disabledReason?: string;
  onSelect?: () => void;
  /** Override the mapped icon name. */
  icon?: string;
  style?: React.CSSProperties;
}
export declare function ServiceOption(props: ServiceOptionProps): JSX.Element;
