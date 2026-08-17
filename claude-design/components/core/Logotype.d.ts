/**
 * Brand wordmark stand-in. No logo asset exists in the source project, so the name is
 * set in the display face beside a Lucide paw glyph. Replace when a real mark is supplied.
 */
export interface LogotypeProps {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'inverse' | 'mono';
  withGlyph?: boolean;
  style?: React.CSSProperties;
}
export declare function Logotype(props: LogotypeProps): JSX.Element;
