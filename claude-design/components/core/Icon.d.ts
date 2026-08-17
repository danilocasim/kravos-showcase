/** Lucide icon renderer. Path data is copied verbatim from lucide-icons/lucide; source SVGs are in assets/icons/. */
export interface IconProps {
  /** File stem from assets/icons, e.g. "paw-print", "calendar-check", "scissors". */
  name: string;
  size?: number;
  /** Default 1.75; use 2 at 16px and below. */
  strokeWidth?: number;
  color?: string;
  /** Supplying a title makes the icon exposed to assistive tech. */
  title?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Icon(props: IconProps): JSX.Element | null;
export declare const iconNames: string[];
