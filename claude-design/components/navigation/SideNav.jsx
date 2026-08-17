import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function SideNav({ items = [], value, onChange, footer, style, ...rest }) {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', width: 'var(--sidebar-w)', padding: 'var(--space-4)', ...style }} {...rest}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value} type="button" onClick={() => onChange && onChange(it.value)}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%', textAlign: 'left',
              padding: '9px var(--space-3)', borderRadius: 'var(--radius-control)', border: 'none', cursor: 'pointer',
              background: active ? 'var(--surface-primary-soft)' : 'transparent',
              color: active ? 'var(--spruce-800)' : 'var(--text-body)',
              font: active ? 'var(--type-body-strong)' : 'var(--type-body)', transition: 'var(--transition-control)'
            }}
          >
            <Icon name={it.icon} size={18} color={active ? 'var(--spruce-700)' : 'var(--text-muted)'} />
            <span style={{ flex: 1 }}>{it.label}</span>
            {typeof it.count === 'number' ? <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{it.count}</span> : null}
          </button>
        );
      })}
      {footer ? <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>{footer}</div> : null}
    </nav>
  );
}
