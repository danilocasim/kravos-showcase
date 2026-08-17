import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { StatusPill } from '../core/StatusPill.jsx';

export function AppointmentCard({
  petName, services = [], groomerName, dateLabel, timeLabel, endTimeLabel, subtotalCents,
  status = 'CONFIRMED', reference, actions, lockedNote, compact = false, style, ...rest
}) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
        padding: compact ? 'var(--space-4)' : 'var(--pad-card)', background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-xs)',
        opacity: status === 'CANCELLED' ? 0.85 : 1, ...style
      }}
      {...rest}
    >
      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
        <div style={{ flex: 'none', width: 56, textAlign: 'center', padding: 'var(--space-2) 0', background: 'var(--surface-primary-soft)', border: '1px solid var(--spruce-200)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ font: 'var(--type-overline)', color: 'var(--spruce-700)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)' }}>{(dateLabel || '').split(' ')[0]}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-xl)', color: 'var(--spruce-900)', lineHeight: 1.1 }}>{(dateLabel || '').split(' ')[1]}</div>
          <div style={{ font: 'var(--type-caption)', color: 'var(--spruce-700)' }}>{(dateLabel || '').split(' ')[2]}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <span style={{ font: 'var(--type-h4)', color: 'var(--text-heading)' }}>{services.join(' + ')}</span>
            <StatusPill status={status} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', font: 'var(--type-small)', color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Icon name="clock" size={14} />{timeLabel}{endTimeLabel ? ' – ' + endTimeLabel : ''}</span>
            {petName ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Icon name="dog" size={14} />{petName}</span> : null}
            {groomerName ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Icon name="user-round" size={14} />{groomerName}</span> : null}
            {typeof subtotalCents === 'number' ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Icon name="credit-card" size={14} />{'$' + (subtotalCents / 100).toFixed(subtotalCents % 100 === 0 ? 0 : 2)}</span> : null}
          </div>
          {reference ? <div style={{ font: 'var(--type-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-subtle)' }}>{reference}</div> : null}
        </div>
      </div>
      {lockedNote ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', font: 'var(--type-caption)', color: 'var(--warning-700)', background: 'var(--warning-50)', border: '1px solid var(--apricot-200)', borderRadius: 'var(--radius-sm)', padding: '7px var(--space-3)' }}>
          <Icon name="lock" size={13} />{lockedNote}
        </div>
      ) : null}
      {actions ? <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>{actions}</div> : null}
    </div>
  );
}
