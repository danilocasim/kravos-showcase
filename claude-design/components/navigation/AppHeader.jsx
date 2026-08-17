import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Logotype } from '../core/Logotype.jsx';

export function AppHeader({ links = [], value, onNavigate, userName, right, onSignOut, style, ...rest }) {
  return (
    <header
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-6)', height: 'var(--header-h)',
        padding: '0 var(--space-6)', background: 'var(--surface-card)',
        borderBottom: '1px solid var(--border-subtle)', ...style
      }}
      {...rest}
    >
      <Logotype size="sm" />
      <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginLeft: 'var(--space-4)' }}>
        {links.map((l) => {
          const active = l.value === value;
          return (
            <button
              key={l.value} type="button" onClick={() => onNavigate && onNavigate(l.value)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px', border: 'none', cursor: 'pointer',
                padding: '7px var(--space-3)', borderRadius: 'var(--radius-control)',
                background: active ? 'var(--surface-sunken)' : 'transparent',
                color: active ? 'var(--text-heading)' : 'var(--text-muted)',
                font: active ? 'var(--type-body-strong)' : 'var(--type-body)', transition: 'var(--transition-control)'
              }}
            >
              {l.icon ? <Icon name={l.icon} size={16} /> : null}{l.label}
            </button>
          );
        })}
      </nav>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {right}
        {userName ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', font: 'var(--type-small)', color: 'var(--text-body)' }}>
            <span style={{ width: 30, height: 30, borderRadius: 'var(--radius-pill)', background: 'var(--spruce-100)', color: 'var(--spruce-800)', display: 'grid', placeItems: 'center', font: 'var(--type-caption)', fontWeight: 'var(--weight-bold)' }}>
              {userName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
            </span>
            {userName}
          </span>
        ) : null}
        {onSignOut ? (
          <button type="button" onClick={onSignOut} aria-label="Sign out" title="Sign out"
            style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-control)', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <Icon name="log-out" size={16} />
          </button>
        ) : null}
      </div>
    </header>
  );
}
