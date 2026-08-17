/** Friendly placeholder for empty lists and no-result states. */
export interface EmptyStateProps {
  /** Icon name from assets/icons (Lucide). */
  icon?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function EmptyState(props: EmptyStateProps): JSX.Element;
