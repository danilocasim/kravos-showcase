import React from 'react';
import { Icon } from './Icon.jsx';

export function EmptyState({ icon = 'paw-print', title, description, action, compact = false, style, ...rest }) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        gap: 'var(--space-2)', padding: compact ? 'var(--space-6)' : 'var(--space-9) var(--space-6)',
        background: 'var(--surface-card)', border: '1px dashed var(--border-default)',
        borderRadius: 'var(--radius-card)', ...style
      }}
      {...rest}
    >
      <span style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 'var(--radius-pill)', background: 'var(--surface-primary-soft)', color: 'var(--spruce-600)', marginBottom: 'var(--space-1)' }}>
        <Icon name={icon} size={22} />
      </span>
      <div style={{ font: 'var(--type-h4)', color: 'var(--text-heading)' }}>{title}</div>
      {description ? <div style={{ font: 'var(--type-small)', color: 'var(--text-muted)', maxWidth: 340 }}>{description}</div> : null}
      {action ? <div style={{ marginTop: 'var(--space-3)' }}>{action}</div> : null}
    </div>
  );
}
