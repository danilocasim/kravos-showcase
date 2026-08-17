/** Underline tab bar for switching between lists of the same object (upcoming / past appointments). */
export interface TabItem { value: string; label: string; icon?: string; count?: number }
export interface TabsProps {
  tabs?: TabItem[];
  value?: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}
export declare function Tabs(props: TabsProps): JSX.Element;
