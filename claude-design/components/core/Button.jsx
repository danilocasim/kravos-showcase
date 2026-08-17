import React from 'react';
import { Icon } from './Icon.jsx';

const PAWPOLISH_BTN_VARIANTS = {
  primary: { background: 'var(--action-primary)', color: 'var(--text-on-primary)', border: '1px solid var(--action-primary)' },
  accent: { background: 'var(--action-accent)', color: 'var(--spruce-950)', border: '1px solid var(--action-accent)' },
  secondary: { background: 'var(--surface-card)', color: 'var(--text-body)', border: '1px solid var(--border-default)' },
  ghost: { background: 'transparent', color: 'var(--text-body)', border: '1px solid transparent' },
  danger: { background: 'var(--danger-500)', color: '#fff', border: '1px solid var(--danger-500)' },
  link: { background: 'transparent', color: 'var(--text-link)', border: '1px solid transparent', padding: 0, height: 'auto' }
};

const PAWPOLISH_BTN_HOVER = {
  primary: { background: 'var(--action-primary-hover)', borderColor: 'var(--action-primary-hover)' },
  accent: { background: 'var(--action-accent-hover)', borderColor: 'var(--action-accent-hover)' },
  secondary: { background: 'var(--sand-50)', borderColor: 'var(--border-strong)' },
  ghost: { background: 'var(--surface-sunken)' },
  danger: { background: 'var(--danger-700)', borderColor: 'var(--danger-700)' },
  link: { color: 'var(--text-link-hover)' }
};

const PAWPOLISH_BTN_SIZES = {
  sm: { height: 'var(--control-h-sm)', padding: '0 var(--space-3)', fontSize: 'var(--text-sm)', gap: '6px' },
  md: { height: 'var(--control-h-md)', padding: '0 var(--space-4)', fontSize: 'var(--text-base)', gap: 'var(--space-2)' },
  lg: { height: 'var(--control-h-lg)', padding: '0 var(--space-6)', fontSize: 'var(--text-md)', gap: 'var(--space-2)' }
};

let pawpolishSpinInjected = false;
function pawpolishEnsureSpinKeyframes() {
  if (pawpolishSpinInjected || typeof document === 'undefined') return;
  pawpolishSpinInjected = true;
  const el = document.createElement('style');
  el.textContent = '@keyframes pawpolish-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(el);
}

export function Button({
  children, variant = 'primary', size = 'md', iconLeft, iconRight, loading = false,
  disabled = false, fullWidth = false, type = 'button', style, onClick, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const isOff = disabled || loading;
  const base = PAWPOLISH_BTN_VARIANTS[variant] || PAWPOLISH_BTN_VARIANTS.primary;
  const sz = PAWPOLISH_BTN_SIZES[size] || PAWPOLISH_BTN_SIZES.md;
  const iconSize = size === 'lg' ? 18 : size === 'sm' ? 14 : 16;
  React.useEffect(() => { if (loading) pawpolishEnsureSpinKeyframes(); }, [loading]);
  return (
    <button
      type={type}
      disabled={isOff}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-sans)', fontWeight: 'var(--weight-semibold)',
        letterSpacing: 'var(--tracking-snug)', borderRadius: variant === 'link' ? 'var(--radius-xs)' : 'var(--radius-control)',
        cursor: isOff ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
        transition: 'var(--transition-control)', width: fullWidth ? '100%' : undefined,
        textDecoration: variant === 'link' ? 'underline' : 'none',
        textUnderlineOffset: '3px',
        ...sz, ...base,
        ...(hover && !isOff ? PAWPOLISH_BTN_HOVER[variant] : null),
        ...(active && !isOff ? { transform: 'translateY(1px)' } : null),
        ...(isOff ? { background: variant === 'ghost' || variant === 'link' ? 'transparent' : 'var(--action-disabled-bg)', borderColor: variant === 'ghost' || variant === 'link' ? 'transparent' : 'var(--action-disabled-bg)', color: 'var(--action-disabled-text)' } : null),
        ...style
      }}
      {...rest}
    >
      {loading ? (
        <span style={{ display: 'inline-flex', animation: 'pawpolish-spin 800ms linear infinite' }}>
          <Icon name="loader-circle" size={iconSize} />
        </span>
      ) : iconLeft ? <Icon name={iconLeft} size={iconSize} /> : null}
      {children}
      {iconRight && !loading ? <Icon name={iconRight} size={iconSize} /> : null}
    </button>
  );
}
