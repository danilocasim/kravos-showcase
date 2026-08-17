import React from 'react';
import { Icon } from '../core/Icon.jsx';

const PAWPOLISH_TOAST_TONES = {
  success: { icon: 'circle-check', color: 'var(--spruce-300)' },
  info: { icon: 'info', color: 'var(--info-50)' },
  danger: { icon: 'circle-alert', color: '#f3a9a3' }
};

export function Toast({ tone = 'success', title, description, onDismiss, style, ...rest }) {
  const t = PAWPOLISH_TOAST_TONES[tone] || PAWPOLISH_TOAST_TONES.success;
  return (
    <div
      role="status"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', width: 360, maxWidth: '100%',
        padding: 'var(--space-4)', background: 'var(--surface-inverse)', color: 'var(--text-inverse)',
        borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', ...style
      }}
      {...rest}
    >
      <span style={{ color: t.color, marginTop: '1px' }}><Icon name={t.icon} size={18} strokeWidth={2} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: 'var(--type-body-strong)' }}>{title}</div>
        {description ? <div style={{ font: 'var(--type-small)', color: 'var(--spruce-200)', marginTop: '2px' }}>{description}</div> : null}
      </div>
      {onDismiss ? (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" style={{ background: 'transparent', border: 'none', color: 'var(--spruce-300)', cursor: 'pointer', padding: 0 }}>
          <Icon name="x" size={16} />
        </button>
      ) : null}
    </div>
  );
}
