import React from 'react';
import { ChoiceCard } from '../forms/ChoiceCard.jsx';

const PAWPOLISH_SERVICE_ICONS = { 'Bath & Brush': 'droplets', 'Full Groom': 'scissors', 'Puppy Introduction Groom': 'heart', 'Nail Trim': 'paw-print', 'De-shedding Treatment': 'sparkles' };

export function ServiceOption({ name, description, durationMinutes, priceCents, kind = 'BASE', selected = false, disabled = false, disabledReason, onSelect, icon, style, ...rest }) {
  const price = typeof priceCents === 'number' ? '$' + (priceCents / 100).toFixed(priceCents % 100 === 0 ? 0 : 2) : null;
  const meta = [description, durationMinutes ? durationMinutes + ' min' : null].filter(Boolean).join(' · ');
  return (
    <ChoiceCard
      control={kind === 'ADD_ON' ? 'checkbox' : 'radio'}
      icon={icon || PAWPOLISH_SERVICE_ICONS[name] || 'scissors'}
      title={name}
      meta={price}
      description={meta}
      selected={selected}
      disabled={disabled}
      disabledReason={disabledReason}
      onSelect={onSelect}
      style={style}
      {...rest}
    />
  );
}
