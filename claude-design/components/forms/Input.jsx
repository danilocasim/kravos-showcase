import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Input({ value, onChange, placeholder, type = 'text', size = 'md', iconLeft, invalid = false, disabled = false, readOnly = false, fullWidth = true, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'sm' ? 'var(--control-h-sm)' : size === 'lg' ? 'var(--control-h-lg)' : 'var(--control-h-md)';
  return (
    <span style={{ position: 'relative', display: fullWidth ? 'block' : 'inline-block', width: fullWidth ? '100%' : undefined }}>
      {iconLeft ? (
        <span style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }}>
          <Icon name={iconLeft} size={16} />
        </span>
      ) : null}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} readOnly={readOnly}
        aria-invalid={invalid || undefined}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: '100%', height: h, boxSizing: 'border-box',
          padding: '0 var(--pad-field-x)', paddingLeft: iconLeft ? '34px' : 'var(--pad-field-x)',
          font: 'var(--type-body)', color: 'var(--text-body)',
          background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
          border: '1px solid ' + (invalid ? 'var(--danger-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)'),
          borderRadius: 'var(--radius-control)', outline: 'none',
          boxShadow: focus ? (invalid ? '0 0 0 3px var(--danger-50)' : 'var(--focus-ring)') : 'none',
          transition: 'var(--transition-control)',
          cursor: disabled ? 'not-allowed' : 'text', ...style
        }}
        {...rest}
      />
    </span>
  );
}
