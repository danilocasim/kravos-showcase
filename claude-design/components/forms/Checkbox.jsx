import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Checkbox({ checked = false, onChange, label, description, disabled = false, style, ...rest }) {
  return (
    <label style={{ display: 'inline-flex', gap: 'var(--space-3)', alignItems: description ? 'flex-start' : 'center', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1, ...style }}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} {...rest} />
      <span
        aria-hidden="true"
        style={{
          flex: 'none', width: 20, height: 20, display: 'grid', placeItems: 'center', marginTop: description ? '1px' : 0,
          borderRadius: 'var(--radius-xs)', transition: 'var(--transition-control)',
          background: checked ? 'var(--action-primary)' : 'var(--surface-card)',
          border: '1px solid ' + (checked ? 'var(--action-primary)' : 'var(--border-strong)'),
          color: '#fff'
        }}
      >
        {checked ? <Icon name="check" size={14} strokeWidth={3} /> : null}
      </span>
      {label || description ? (
        <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {label ? <span style={{ font: 'var(--type-body)', color: 'var(--text-body)' }}>{label}</span> : null}
          {description ? <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{description}</span> : null}
        </span>
      ) : null}
    </label>
  );
}
