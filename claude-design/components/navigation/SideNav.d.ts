/** Vertical product navigation used by the admin console. */
export interface SideNavItem { value: string; label: string; icon: string; count?: number }
export interface SideNavProps {
  items?: SideNavItem[];
  value?: string;
  onChange?: (value: string) => void;
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function SideNav(props: SideNavProps): JSX.Element;
