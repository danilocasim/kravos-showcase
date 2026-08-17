import React from 'react';

export function Card({ children, padding = 'md', tone = 'default', interactive = false, selected = false, as = 'div', style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const Tag = as;
  const tones = {
    default: { background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' },
    sunken: { background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)' },
    primarySoft: { background: 'var(--surface-primary-soft)', border: '1px solid var(--spruce-200)' },
    accentSoft: { background: 'var(--surface-accent-soft)', border: '1px solid var(--apricot-200)' },
    inverse: { background: 'var(--surface-inverse)', border: '1px solid var(--spruce-800)', color: 'var(--text-inverse)' }
  }[tone];
  const pads = { none: 0, sm: 'var(--space-4)', md: 'var(--pad-card)', lg: 'var(--pad-card-lg)' };
  return (
    <Tag
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 'var(--radius-card)', padding: pads[padding], boxShadow: 'var(--shadow-xs)',
        transition: 'var(--transition-control)', ...tones,
        ...(interactive ? { cursor: 'pointer' } : null),
        ...(interactive && hover && !selected ? { boxShadow: 'var(--shadow-md)', transform: 'translateY(-1px)', borderColor: 'var(--border-default)' } : null),
        ...(selected ? { borderColor: 'var(--action-primary)', boxShadow: '0 0 0 1px var(--action-primary)' } : null),
        ...style
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
