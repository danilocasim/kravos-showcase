/** Square icon-only control. Always requires an accessible label. */
export interface IconButtonProps {
  /** Icon name from assets/icons (Lucide). */
  icon: string;
  /** Accessible name; also used as the tooltip title. */
  label: string;
  variant?: 'ghost' | 'outline' | 'solid' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
