/**
 * Server-calculated availability, grouped by day. The UI renders slots only; it never computes them.
 * @startingPoint section="Booking" subtitle="Day-grouped availability grid" viewport="700x340"
 */
export interface TimeSlot {
  /** Display time in business timezone, e.g. "10:15 AM". */
  time: string;
  /** Groomer attributed by the server for an any-available slot. */
  groomer?: string;
  unavailable?: boolean;
}
export interface TimeSlotDay {
  /** Stable key, e.g. "2026-09-02". */
  date: string;
  /** Human label, e.g. "Wed 2 Sep". */
  label: string;
  slots: TimeSlot[];
  /** Shown when slots is empty, e.g. "Maya is on training 12:00–2:00 PM." */
  emptyReason?: string;
}
export interface TimeSlotPickerProps {
  days?: TimeSlotDay[];
  selected?: { date: string; time: string } | null;
  onSelect?: (slot: { date: string; time: string; groomer?: string }) => void;
  /** Footnote, e.g. "Times include a 15-minute cleanup buffer." */
  note?: string;
  style?: React.CSSProperties;
}
export declare function TimeSlotPicker(props: TimeSlotPickerProps): JSX.Element;
