/** Small pill for metadata: durations, prices, qualifications, counts. */
export interface BadgeProps {
  children?: React.ReactNode;
  tone?: 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  /** Icon name from assets/icons (Lucide). */
  icon?: string;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;
