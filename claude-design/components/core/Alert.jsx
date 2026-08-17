import React from 'react';
import { Icon } from './Icon.jsx';

const PAWPOLISH_ALERT_TONES = {
  info: { bg: 'var(--info-50)', border: '#cfe1ef', fg: 'var(--info-700)', icon: 'info' },
  success: { bg: 'var(--success-50)', border: 'var(--spruce-200)', fg: 'var(--success-700)', icon: 'circle-check' },
  warning: { bg: 'var(--warning-50)', border: 'var(--apricot-200)', fg: 'var(--warning-700)', icon: 'triangle-alert' },
  danger: { bg: 'var(--danger-50)', border: '#f3cfcb', fg: 'var(--danger-700)', icon: 'circle-alert' }
};

export function Alert({ tone = 'info', title, children, action, code, style, ...rest }) {
  const t = PAWPOLISH_ALERT_TONES[tone] || PAWPOLISH_ALERT_TONES.info;
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-4)', background: t.bg, border: '1px solid ' + t.border, borderRadius: 'var(--radius-md)', ...style }}
      {...rest}
    >
      <span style={{ color: t.fg, marginTop: '1px' }}><Icon name={t.icon} size={18} strokeWidth={2} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title ? <div style={{ font: 'var(--type-body-strong)', color: t.fg, marginBottom: children ? '2px' : 0 }}>{title}</div> : null}
        {children ? <div style={{ font: 'var(--type-small)', color: 'var(--text-body)' }}>{children}</div> : null}
        {code ? <div style={{ font: 'var(--type-mono)', fontSize: 'var(--text-xs)', color: t.fg, marginTop: 'var(--space-2)' }}>{code}</div> : null}
      </div>
      {action ? <div style={{ flex: 'none' }}>{action}</div> : null}
    </div>
  );
}
