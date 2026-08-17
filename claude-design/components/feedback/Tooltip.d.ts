/** Short clarifying label on hover/focus. Never the only place important information lives. */
export interface TooltipProps {
  label: React.ReactNode;
  children?: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  style?: React.CSSProperties;
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
