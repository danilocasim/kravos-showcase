import React from 'react';
import { ChoiceCard } from '../forms/ChoiceCard.jsx';

export function GroomerOption({ name, bio, hours, anyAvailable = false, selected = false, disabled = false, disabledReason, onSelect, style, ...rest }) {
  const initials = anyAvailable ? null : (name || '').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <ChoiceCard
      control="radio"
      icon={anyAvailable ? 'users' : undefined}
      avatar={initials || undefined}
      title={anyAvailable ? 'Any available groomer' : name}
      description={anyAvailable ? 'We assign a qualified groomer — usually the widest choice of times.' : [bio, hours].filter(Boolean).join(' · ')}
      selected={selected}
      disabled={disabled}
      disabledReason={disabledReason}
      onSelect={onSelect}
      style={style}
      {...rest}
    />
  );
}
