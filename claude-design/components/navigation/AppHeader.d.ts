/**
 * Top bar for both customer and admin surfaces: wordmark, primary links, account.
 * @startingPoint section="Shell" subtitle="Product header with wordmark and account" viewport="700x120"
 */
export interface AppHeaderLink { value: string; label: string; icon?: string }
export interface AppHeaderProps {
  links?: AppHeaderLink[];
  value?: string;
  onNavigate?: (value: string) => void;
  /** Display name; initials are derived for the avatar. */
  userName?: string;
  /** Extra slot before the account block, e.g. a "Book a visit" Button. */
  right?: React.ReactNode;
  onSignOut?: () => void;
  style?: React.CSSProperties;
}
export declare function AppHeader(props: AppHeaderProps): JSX.Element;
