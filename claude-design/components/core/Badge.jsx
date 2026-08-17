import React from 'react';
import { Icon } from './Icon.jsx';

const PAWPOLISH_BADGE_TONES = {
  neutral: { background: 'var(--sand-150)', color: 'var(--sand-700)', border: 'var(--sand-200)' },
  primary: { background: 'var(--spruce-50)', color: 'var(--spruce-700)', border: 'var(--spruce-200)' },
  accent: { background: 'var(--apricot-100)', color: 'var(--apricot-700)', border: 'var(--apricot-200)' },
  success: { background: 'var(--success-50)', color: 'var(--success-700)', border: 'var(--spruce-200)' },
  warning: { background: 'var(--warning-50)', color: 'var(--warning-700)', border: 'var(--apricot-200)' },
  danger: { background: 'var(--danger-50)', color: 'var(--danger-700)', border: '#f3cfcb' },
  info: { background: 'var(--info-50)', color: 'var(--info-700)', border: '#cfe1ef' }
};

export function Badge({ children, tone = 'neutral', icon, size = 'md', style, ...rest }) {
  const t = PAWPOLISH_BADGE_TONES[tone] || PAWPOLISH_BADGE_TONES.neutral;
  const small = size === 'sm';
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: small ? '2px 7px' : '3px 9px',
        borderRadius: 'var(--radius-pill)', background: t.background, color: t.color,
        border: '1px solid ' + t.border, font: 'var(--type-caption)',
        fontSize: small ? 'var(--text-2xs)' : 'var(--text-xs)', whiteSpace: 'nowrap', ...style
      }}
      {...rest}
    >
      {icon ? <Icon name={icon} size={small ? 11 : 13} strokeWidth={2} /> : null}
      {children}
    </span>
  );
}
