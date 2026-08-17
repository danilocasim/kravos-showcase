import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Tabs({ tabs = [], value, onChange, size = 'md', style, ...rest }) {
  return (
    <div role="tablist" style={{ display: 'flex', gap: 'var(--space-1)', borderBottom: '1px solid var(--border-subtle)', ...style }} {...rest}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value} role="tab" aria-selected={active} type="button"
            onClick={() => onChange && onChange(t.value)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'transparent',
              border: 'none', borderBottom: '2px solid ' + (active ? 'var(--action-primary)' : 'transparent'),
              padding: size === 'sm' ? '8px 10px' : '10px 12px', marginBottom: -1, cursor: 'pointer',
              font: active ? 'var(--type-body-strong)' : 'var(--type-body)',
              fontSize: size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)',
              color: active ? 'var(--text-heading)' : 'var(--text-muted)', transition: 'var(--transition-control)'
            }}
          >
            {t.icon ? <Icon name={t.icon} size={16} /> : null}
            {t.label}
            {typeof t.count === 'number' ? (
              <span style={{ font: 'var(--type-caption)', color: active ? 'var(--spruce-700)' : 'var(--text-subtle)', background: active ? 'var(--spruce-50)' : 'var(--surface-sunken)', borderRadius: 'var(--radius-pill)', padding: '1px 6px' }}>{t.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
