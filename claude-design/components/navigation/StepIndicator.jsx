import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function StepIndicator({ steps = [], current = 0, onStepClick, compact = false, style, ...rest }) {
  return (
    <ol style={{ display: 'flex', alignItems: 'center', gap: compact ? 'var(--space-2)' : 'var(--space-3)', listStyle: 'none', margin: 0, padding: 0, ...style }} {...rest}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = done && onStepClick;
        return (
          <li key={label} style={{ display: 'flex', alignItems: 'center', gap: compact ? 'var(--space-2)' : 'var(--space-3)', minWidth: 0 }}>
            <span
              onClick={() => clickable && onStepClick(i)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: clickable ? 'pointer' : 'default' }}
            >
              <span style={{
                width: 24, height: 24, flex: 'none', display: 'grid', placeItems: 'center', borderRadius: 'var(--radius-pill)',
                font: 'var(--type-caption)', fontWeight: 'var(--weight-bold)',
                background: done ? 'var(--spruce-100)' : active ? 'var(--action-primary)' : 'var(--surface-sunken)',
                color: done ? 'var(--spruce-700)' : active ? '#fff' : 'var(--text-subtle)',
                border: '1px solid ' + (done ? 'var(--spruce-200)' : active ? 'var(--action-primary)' : 'var(--border-subtle)')
              }}>
                {done ? <Icon name="check" size={13} strokeWidth={3} /> : i + 1}
              </span>
              {!compact ? (
                <span style={{ font: active ? 'var(--type-body-strong)' : 'var(--type-small)', color: active ? 'var(--text-heading)' : done ? 'var(--text-body)' : 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{label}</span>
              ) : null}
            </span>
            {i < steps.length - 1 ? <span style={{ width: compact ? 16 : 28, height: 1, background: done ? 'var(--spruce-300)' : 'var(--border-default)', flex: 'none' }} /> : null}
          </li>
        );
      })}
    </ol>
  );
}
