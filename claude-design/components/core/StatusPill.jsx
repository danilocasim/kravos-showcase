import React from 'react';
import { Icon } from './Icon.jsx';

const PAWPOLISH_STATUS = {
  CONFIRMED: { label: 'Confirmed', bg: 'var(--status-confirmed-bg)', fg: 'var(--status-confirmed-fg)', icon: 'circle-check' },
  COMPLETED: { label: 'Completed', bg: 'var(--status-completed-bg)', fg: 'var(--status-completed-fg)', icon: 'check' },
  CANCELLED: { label: 'Cancelled', bg: 'var(--status-cancelled-bg)', fg: 'var(--status-cancelled-fg)', icon: 'circle-x' },
  PENDING: { label: 'Awaiting confirmation', bg: 'var(--status-pending-bg)', fg: 'var(--status-pending-fg)', icon: 'clock' }
};

export function StatusPill({ status = 'CONFIRMED', label, style, ...rest }) {
  const s = PAWPOLISH_STATUS[status] || PAWPOLISH_STATUS.CONFIRMED;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px 4px 8px',
        borderRadius: 'var(--radius-pill)', background: s.bg, color: s.fg,
        font: 'var(--type-caption)', fontWeight: 'var(--weight-semibold)', ...style
      }}
      {...rest}
    >
      <Icon name={s.icon} size={13} strokeWidth={2.25} />
      {label || s.label}
    </span>
  );
}
