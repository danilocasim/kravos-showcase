import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Select({ value, onChange, options = [], placeholder, size = 'md', invalid = false, disabled = false, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'sm' ? 'var(--control-h-sm)' : size === 'lg' ? 'var(--control-h-lg)' : 'var(--control-h-md)';
  return (
    <span style={{ position: 'relative', display: 'block' }}>
      <select
        value={value} onChange={onChange} disabled={disabled} aria-invalid={invalid || undefined}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: '100%', height: h, boxSizing: 'border-box', appearance: 'none',
          padding: '0 34px 0 var(--pad-field-x)', font: 'var(--type-body)',
          color: value ? 'var(--text-body)' : 'var(--text-subtle)',
          background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
          border: '1px solid ' + (invalid ? 'var(--danger-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)'),
          borderRadius: 'var(--radius-control)', outline: 'none',
          boxShadow: focus ? 'var(--focus-ring)' : 'none', transition: 'var(--transition-control)',
          cursor: disabled ? 'not-allowed' : 'pointer', ...style
        }}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
        <Icon name="chevron-down" size={16} />
      </span>
    </span>
  );
}
