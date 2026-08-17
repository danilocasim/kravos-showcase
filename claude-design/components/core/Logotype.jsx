import React from 'react';
import { Icon } from './Icon.jsx';

/* The source project ships no logo file or brand mark. Paw & Polish is set as plain
   type in the display face, optionally beside a Lucide paw glyph. Do not treat this
   as an official logo — replace it when a real mark exists. */
export function Logotype({ size = 'md', tone = 'default', withGlyph = true, style, ...rest }) {
  const sizes = { sm: { font: 'var(--text-base)', glyph: 16, box: 26 }, md: { font: 'var(--text-lg)', glyph: 19, box: 32 }, lg: { font: 'var(--text-2xl)', glyph: 26, box: 44 } }[size];
  const colors = {
    default: { text: 'var(--text-heading)', glyphBg: 'var(--spruce-700)', glyphFg: '#fff' },
    inverse: { text: 'var(--sand-50)', glyphBg: 'var(--apricot-400)', glyphFg: 'var(--spruce-950)' },
    mono: { text: 'currentColor', glyphBg: 'transparent', glyphFg: 'currentColor' }
  }[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', ...style }} {...rest}>
      {withGlyph ? (
        <span style={{ display: 'grid', placeItems: 'center', width: sizes.box, height: sizes.box, borderRadius: 'var(--radius-md)', background: colors.glyphBg, color: colors.glyphFg, border: tone === 'mono' ? '1px solid currentColor' : 'none' }}>
          <Icon name="paw-print" size={sizes.glyph} strokeWidth={2} />
        </span>
      ) : null}
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: sizes.font, letterSpacing: 'var(--tracking-tight)', color: colors.text, whiteSpace: 'nowrap' }}>
        Paw &amp; Polish
      </span>
    </span>
  );
}
