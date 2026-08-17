/** Server-derived service subtotal and duration. Every value is echoed from the API response. */
export interface PriceSummaryLine { name: string; priceCents: number; durationMinutes?: number }
export interface PriceSummaryProps {
  lines?: PriceSummaryLine[];
  /** Server-calculated total service duration in minutes. */
  totalMinutes?: number;
  /** Server-calculated subtotal in integer cents. */
  subtotalCents?: number;
  /** Persisted cleanup buffer; 15 in v1. */
  bufferMinutes?: number;
  footnote?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function PriceSummary(props: PriceSummaryProps): JSX.Element;
