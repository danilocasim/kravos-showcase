import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Field({ label, htmlFor, hint, error, required = false, optionalLabel = false, children, style, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }} {...rest}>
      {label ? (
        <label htmlFor={htmlFor} style={{ font: 'var(--type-label)', color: 'var(--text-heading)', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          {label}
          {required ? <span aria-hidden="true" style={{ color: 'var(--danger-500)' }}>*</span> : null}
          {optionalLabel && !required ? <span style={{ font: 'var(--type-caption)', color: 'var(--text-subtle)', fontWeight: 'var(--weight-regular)' }}>Optional</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <span role="alert" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', font: 'var(--type-caption)', color: 'var(--danger-700)' }}>
          <Icon name="circle-alert" size={13} strokeWidth={2} />{error}
        </span>
      ) : hint ? (
        <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{hint}</span>
      ) : null}
    </div>
  );
}
