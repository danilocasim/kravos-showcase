import React from 'react';

export function Radio({ checked = false, onChange, label, description, name, value, disabled = false, style, ...rest }) {
  return (
    <label style={{ display: 'inline-flex', gap: 'var(--space-3)', alignItems: description ? 'flex-start' : 'center', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1, ...style }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} {...rest} />
      <span
        aria-hidden="true"
        style={{
          flex: 'none', width: 20, height: 20, borderRadius: 'var(--radius-pill)', display: 'grid', placeItems: 'center',
          background: 'var(--surface-card)', transition: 'var(--transition-control)',
          border: '1px solid ' + (checked ? 'var(--action-primary)' : 'var(--border-strong)'),
          boxShadow: checked ? 'inset 0 0 0 1px var(--action-primary)' : 'none', marginTop: description ? '1px' : 0
        }}
      >
        {checked ? <span style={{ width: 10, height: 10, borderRadius: 'var(--radius-pill)', background: 'var(--action-primary)' }} /> : null}
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
