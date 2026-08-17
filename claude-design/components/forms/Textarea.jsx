import React from 'react';

export function Textarea({ value, onChange, placeholder, rows = 3, invalid = false, disabled = false, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <textarea
      value={value} onChange={onChange} placeholder={placeholder} rows={rows} disabled={disabled}
      aria-invalid={invalid || undefined}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        width: '100%', boxSizing: 'border-box', padding: 'var(--pad-field-y) var(--pad-field-x)',
        font: 'var(--type-body)', color: 'var(--text-body)', resize: 'vertical', minHeight: 76,
        background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
        border: '1px solid ' + (invalid ? 'var(--danger-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)'),
        borderRadius: 'var(--radius-control)', outline: 'none',
        boxShadow: focus ? 'var(--focus-ring)' : 'none', transition: 'var(--transition-control)', ...style
      }}
      {...rest}
    />
  );
}
