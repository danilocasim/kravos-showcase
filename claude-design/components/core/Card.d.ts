/** Neutral surface container: white, 1px warm border, 14px radius, near-flat shadow. */
export interface CardProps {
  children?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  tone?: 'default' | 'sunken' | 'primarySoft' | 'accentSoft' | 'inverse';
  /** Adds hover lift + pointer cursor. */
  interactive?: boolean;
  /** Draws the selected ring (use with interactive). */
  selected?: boolean;
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;
