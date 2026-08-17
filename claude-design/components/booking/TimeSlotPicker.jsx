import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function TimeSlotPicker({ days = [], selected, onSelect, note, style, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', ...style }} {...rest}>
      {days.map((day) => (
        <div key={day.date} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <span style={{ font: 'var(--type-label)', color: 'var(--text-heading)' }}>{day.label}</span>
            <span style={{ font: 'var(--type-caption)', color: 'var(--text-subtle)' }}>
              {day.slots.length ? day.slots.length + ' times' : 'Fully booked'}
            </span>
          </div>
          {day.slots.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: 'var(--space-2)' }}>
              {day.slots.map((slot) => {
                const isSel = selected && selected.date === day.date && selected.time === slot.time;
                return (
                  <button
                    key={slot.time} type="button" disabled={slot.unavailable}
                    onClick={() => onSelect && onSelect({ date: day.date, time: slot.time, groomer: slot.groomer })}
                    style={{
                      height: 'var(--hit-target-min)', padding: '0 var(--space-2)', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '1px', cursor: slot.unavailable ? 'not-allowed' : 'pointer',
                      background: isSel ? 'var(--slot-selected-bg)' : slot.unavailable ? 'var(--surface-sunken)' : 'var(--surface-card)',
                      color: isSel ? '#fff' : slot.unavailable ? 'var(--slot-unavailable-fg)' : 'var(--text-heading)',
                      border: '1px solid ' + (isSel ? 'var(--slot-selected-bg)' : slot.unavailable ? 'var(--border-subtle)' : 'var(--slot-free-border)'),
                      borderRadius: 'var(--radius-control)', font: 'var(--type-body-strong)',
                      textDecoration: slot.unavailable ? 'line-through' : 'none', transition: 'var(--transition-control)'
                    }}
                  >
                    {slot.time}
                    {slot.groomer ? (
                      <span style={{ font: 'var(--type-caption)', fontSize: 'var(--text-2xs)', color: isSel ? 'var(--spruce-200)' : 'var(--text-subtle)' }}>{slot.groomer}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', font: 'var(--type-small)', color: 'var(--text-muted)', padding: 'var(--space-3)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)' }}>
              <Icon name="calendar-x" size={15} />{day.emptyReason || 'No times available on this day.'}
            </div>
          )}
        </div>
      ))}
      {note ? (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
          <Icon name="info" size={13} />{note}
        </div>
      ) : null}
    </div>
  );
}
