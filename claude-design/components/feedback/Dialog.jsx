import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Dialog({ open = true, title, description, children, footer, onClose, width = 480, tone = 'default', style, ...rest }) {
  if (!open) return null;
  return (
    <div
      role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}
      style={{ position: 'absolute', inset: 0, background: 'var(--scrim)', backdropFilter: 'var(--overlay-blur)', display: 'grid', placeItems: 'center', padding: 'var(--space-6)', zIndex: 40 }}
    >
      <div
        style={{
          width: '100%', maxWidth: width, background: 'var(--surface-card)', borderRadius: 'var(--radius-sheet)',
          boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)', overflow: 'hidden', ...style
        }}
        {...rest}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-6) var(--space-6) var(--space-4)' }}>
          {tone !== 'default' ? (
            <span style={{ flex: 'none', width: 36, height: 36, borderRadius: 'var(--radius-pill)', display: 'grid', placeItems: 'center', background: tone === 'danger' ? 'var(--danger-50)' : 'var(--warning-50)', color: tone === 'danger' ? 'var(--danger-500)' : 'var(--warning-700)' }}>
              <Icon name={tone === 'danger' ? 'triangle-alert' : 'circle-alert'} size={19} />
            </span>
          ) : null}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ font: 'var(--type-h3)', color: 'var(--text-heading)', margin: 0 }}>{title}</h3>
            {description ? <p style={{ font: 'var(--type-small)', color: 'var(--text-muted)', margin: '4px 0 0' }}>{description}</p> : null}
          </div>
          {onClose ? (
            <button type="button" onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', border: 'none', background: 'transparent', borderRadius: 'var(--radius-control)', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <Icon name="x" size={17} />
            </button>
          ) : null}
        </div>
        {children ? <div style={{ padding: '0 var(--space-6) var(--space-5)' }}>{children}</div> : null}
        {footer ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', padding: 'var(--space-4) var(--space-6)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--border-subtle)' }}>{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
