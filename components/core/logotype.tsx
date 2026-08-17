import { Icon } from "./icon";

/**
 * The project ships no logo file or brand mark, so "Paw & Polish" is set as plain
 * type in the display face beside a Lucide paw glyph. This is a stand-in; replace
 * it when a real mark exists. The ampersand is always "&", never "and".
 */

const sizeStyles = {
  sm: { text: "text-base", box: "size-[26px]", glyph: 16 },
  md: { text: "text-lg", box: "size-8", glyph: 19 },
  lg: { text: "text-2xl", box: "size-11", glyph: 26 },
} as const;

const toneStyles = {
  default: { text: "text-heading", glyph: "bg-spruce-700 text-white" },
  inverse: { text: "text-sand-50", glyph: "bg-apricot-400 text-spruce-950" },
  mono: {
    text: "text-current",
    glyph: "border border-current bg-transparent text-current",
  },
} as const;

export interface LogotypeProps {
  readonly size?: keyof typeof sizeStyles;
  readonly tone?: keyof typeof toneStyles;
  readonly withGlyph?: boolean;
}

/**
 * Renders the Paw & Polish wordmark.
 *
 * @param props - Size, colour tone, and whether to show the paw glyph.
 * @returns The wordmark as inline content.
 */
export const Logotype = ({
  size = "md",
  tone = "default",
  withGlyph = true,
}: LogotypeProps) => {
  const sizing = sizeStyles[size];
  const colours = toneStyles[tone];

  return (
    <span className="inline-flex items-center gap-2">
      {withGlyph ? (
        <span
          className={`grid flex-none place-items-center rounded-md ${sizing.box} ${colours.glyph}`}
        >
          <Icon name="paw-print" size={sizing.glyph} />
        </span>
      ) : null}
      <span
        className={`font-(family-name:--font-display) font-bold tracking-tight whitespace-nowrap ${sizing.text} ${colours.text}`}
      >
        Paw &amp; Polish
      </span>
    </span>
  );
};
