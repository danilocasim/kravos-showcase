import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function ChoiceCard({
  title, description, meta, icon, avatar, selected = false, disabled = false,
  control = 'radio', onSelect, disabledReason, children, style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const showRing = selected;
  return (
    <div
      role={control === 'checkbox' ? 'checkbox' : 'radio'}
      aria-checked={selected} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect && onSelect()}
      onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect && onSelect(); } }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', textAlign: 'left', width: '100%',
        padding: 'var(--space-4)', borderRadius: 'var(--radius-card)',
        background: disabled ? 'var(--surface-sunken)' : selected ? 'var(--surface-primary-soft)' : 'var(--surface-card)',
        border: '1px solid ' + (selected ? 'var(--action-primary)' : hover && !disabled ? 'var(--border-strong)' : 'var(--border-subtle)'),
        boxShadow: showRing ? '0 0 0 1px var(--action-primary)' : 'var(--shadow-xs)',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1,
        transition: 'var(--transition-control)', ...style
      }}
      {...rest}
    >
      {avatar ? (
        <span style={{ flex: 'none', width: 40, height: 40, borderRadius: 'var(--radius-pill)', background: 'var(--apricot-200)', color: 'var(--spruce-900)', display: 'grid', placeItems: 'center', font: 'var(--type-body-strong)' }}>{avatar}</span>
      ) : icon ? (
        <span style={{ flex: 'none', width: 36, height: 36, borderRadius: 'var(--radius-md)', background: selected ? 'var(--spruce-100)' : 'var(--surface-sunken)', color: selected ? 'var(--spruce-700)' : 'var(--text-muted)', display: 'grid', placeItems: 'center' }}>
          <Icon name={icon} size={19} />
        </span>
      ) : null}
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', justifyContent: 'space-between' }}>
          <span style={{ font: 'var(--type-body-strong)', color: 'var(--text-heading)' }}>{title}</span>
          {meta ? <span style={{ font: 'var(--type-body-strong)', color: 'var(--text-heading)', flex: 'none' }}>{meta}</span> : null}
        </span>
        {description ? <span style={{ font: 'var(--type-small)', color: 'var(--text-muted)' }}>{description}</span> : null}
        {disabled && disabledReason ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', font: 'var(--type-caption)', color: 'var(--warning-700)', marginTop: '2px' }}>
            <Icon name="ban" size={12} strokeWidth={2} />{disabledReason}
          </span>
        ) : null}
        {children}
      </span>
      <span
        aria-hidden="true"
        style={{
          flex: 'none', width: 20, height: 20, marginTop: '2px', display: 'grid', placeItems: 'center',
          borderRadius: control === 'checkbox' ? 'var(--radius-xs)' : 'var(--radius-pill)',
          background: selected ? 'var(--action-primary)' : 'var(--surface-card)',
          border: '1px solid ' + (selected ? 'var(--action-primary)' : 'var(--border-strong)'), color: '#fff'
        }}
      >
        {selected ? <Icon name="check" size={13} strokeWidth={3} /> : null}
      </span>
    </div>
  );
}
