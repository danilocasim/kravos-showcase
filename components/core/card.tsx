import type { ReactNode } from "react";

/**
 * A flat surface with a warm border.
 *
 * Borders do the separating here; shadows are reserved for things that genuinely
 * float. Cards never nest more than one level deep -- use `tone="sunken"` for a
 * block inside a card.
 */

const toneStyles = {
  default: "border-subtle-border bg-card",
  sunken: "border-subtle-border bg-sunken",
  primarySoft: "border-spruce-200 bg-primary-soft",
  accentSoft: "border-apricot-200 bg-accent-soft",
  inverse: "border-spruce-800 bg-inverse-surface text-inverse",
} as const;

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-(--pad-card)",
  lg: "p-(--pad-card-lg)",
} as const;

export interface CardProps {
  readonly tone?: keyof typeof toneStyles;
  readonly padding?: keyof typeof paddingStyles;
  readonly as?: "div" | "section" | "article" | "aside" | "li";
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Renders a card surface.
 *
 * @param props - Tone, padding scale, element type, and content.
 * @returns A card container.
 */
export const Card = ({
  tone = "default",
  padding = "md",
  as: Element = "div",
  children,
  className = "",
}: CardProps) => (
  <Element
    className={`rounded-lg border shadow-card ${toneStyles[tone]} ${paddingStyles[padding]} ${className}`}
  >
    {children}
  </Element>
);
