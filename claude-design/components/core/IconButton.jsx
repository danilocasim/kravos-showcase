import React from 'react';
import { Icon } from './Icon.jsx';

const PAWPOLISH_IB_SIZES = { sm: 28, md: 36, lg: 44 };

export function IconButton({ icon, label, variant = 'ghost', size = 'md', disabled = false, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const box = PAWPOLISH_IB_SIZES[size] || PAWPOLISH_IB_SIZES.md;
  const tone = {
    ghost: { background: hover && !disabled ? 'var(--surface-sunken)' : 'transparent', border: '1px solid transparent', color: 'var(--text-muted)' },
    outline: { background: hover && !disabled ? 'var(--sand-50)' : 'var(--surface-card)', border: '1px solid var(--border-default)', color: 'var(--text-body)' },
    solid: { background: hover && !disabled ? 'var(--action-primary-hover)' : 'var(--action-primary)', border: '1px solid transparent', color: 'var(--text-on-primary)' },
    danger: { background: hover && !disabled ? 'var(--danger-50)' : 'transparent', border: '1px solid transparent', color: 'var(--danger-500)' }
  }[variant];
  return (
    <button
      type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: box, height: box, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-control)', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'var(--transition-control)', opacity: disabled ? 0.5 : 1, ...tone, ...style
      }}
      {...rest}
    >
      <Icon name={icon} size={size === 'lg' ? 20 : size === 'sm' ? 15 : 17} />
    </button>
  );
}
