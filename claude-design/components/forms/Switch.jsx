import React from 'react';

export function Switch({ checked = false, onChange, label, disabled = false, style, ...rest }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1, ...style }}>
      <input type="checkbox" role="switch" checked={checked} onChange={onChange} disabled={disabled} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} {...rest} />
      <span
        aria-hidden="true"
        style={{
          flex: 'none', width: 40, height: 24, borderRadius: 'var(--radius-pill)', padding: 2,
          background: checked ? 'var(--action-primary)' : 'var(--sand-300)',
          transition: 'var(--transition-control)', display: 'flex', justifyContent: checked ? 'flex-end' : 'flex-start'
        }}
      >
        <span style={{ width: 20, height: 20, borderRadius: 'var(--radius-pill)', background: '#fff', boxShadow: 'var(--shadow-xs)' }} />
      </span>
      {label ? <span style={{ font: 'var(--type-body)', color: 'var(--text-body)' }}>{label}</span> : null}
    </label>
  );
}
