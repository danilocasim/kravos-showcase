import React from 'react';
import { Icon } from '../core/Icon.jsx';

const money = (cents) => '$' + (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);

export function PriceSummary({ lines = [], totalMinutes, subtotalCents, bufferMinutes = 15, footnote, style, ...rest }) {
  return (
    <div style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-card)', padding: 'var(--pad-card)', ...style }} {...rest}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {lines.map((l) => (
          <div key={l.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', font: 'var(--type-body)' }}>
            <span style={{ color: 'var(--text-body)' }}>{l.name}
              {typeof l.durationMinutes === 'number' ? <span style={{ color: 'var(--text-subtle)' }}> · {l.durationMinutes} min</span> : null}
            </span>
            <span style={{ font: 'var(--type-mono)', color: 'var(--text-body)' }}>{money(l.priceCents)}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: 'var(--space-4) 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--space-4)' }}>
        <span style={{ font: 'var(--type-body-strong)', color: 'var(--text-heading)' }}>Subtotal</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-xl)', color: 'var(--text-heading)' }}>{money(subtotalCents || 0)}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-2)', font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
        {typeof totalMinutes === 'number' ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Icon name="clock" size={12} />{totalMinutes} min with your groomer</span>
        ) : null}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Icon name="sparkles" size={12} />{bufferMinutes}-min cleanup buffer</span>
      </div>
      {footnote ? <div style={{ font: 'var(--type-caption)', color: 'var(--text-subtle)', marginTop: 'var(--space-3)' }}>{footnote}</div> : null}
    </div>
  );
}
