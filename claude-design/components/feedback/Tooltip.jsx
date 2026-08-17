import React from 'react';

export function Tooltip({ label, children, placement = 'top', style, ...rest }) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top: { bottom: '100%', left: '50%', transform: 'translate(-50%, -6px)' },
    bottom: { top: '100%', left: '50%', transform: 'translate(-50%, 6px)' },
    left: { right: '100%', top: '50%', transform: 'translate(-6px, -50%)' },
    right: { left: '100%', top: '50%', transform: 'translate(6px, -50%)' }
  }[placement];
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', ...style }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)} onBlur={() => setShow(false)}
      {...rest}
    >
      {children}
      {show ? (
        <span role="tooltip" style={{
          position: 'absolute', ...pos, zIndex: 30, whiteSpace: 'nowrap',
          background: 'var(--sand-950)', color: 'var(--sand-50)', font: 'var(--type-caption)',
          padding: '5px 9px', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)', pointerEvents: 'none'
        }}>{label}</span>
      ) : null}
    </span>
  );
}
