import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Badge } from '../core/Badge.jsx';
import { IconButton } from '../core/IconButton.jsx';

const PAWPOLISH_SIZE_LABEL = { SMALL: 'Small', MEDIUM: 'Medium', LARGE: 'Large' };

export function PetCard({ name, breed, size, ageYears, temperament, allergies, notes, selectable = false, selected = false, onSelect, onEdit, onDelete, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={() => selectable && onSelect && onSelect()}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-4)', borderRadius: 'var(--radius-card)',
        background: selected ? 'var(--surface-primary-soft)' : 'var(--surface-card)',
        border: '1px solid ' + (selected ? 'var(--action-primary)' : hover && selectable ? 'var(--border-strong)' : 'var(--border-subtle)'),
        boxShadow: selected ? '0 0 0 1px var(--action-primary)' : 'var(--shadow-xs)',
        cursor: selectable ? 'pointer' : 'default', transition: 'var(--transition-control)', ...style
      }}
      {...rest}
    >
      <span style={{ flex: 'none', width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--apricot-100)', color: 'var(--apricot-700)', display: 'grid', placeItems: 'center' }}>
        <Icon name="dog" size={23} />
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ font: 'var(--type-h4)', color: 'var(--text-heading)' }}>{name}</span>
          {selected ? <Icon name="circle-check" size={16} color="var(--action-primary)" /> : null}
        </div>
        <div style={{ font: 'var(--type-small)', color: 'var(--text-muted)' }}>
          {[breed, PAWPOLISH_SIZE_LABEL[size] || size, typeof ageYears === 'number' ? ageYears + (ageYears === 1 ? ' yr' : ' yrs') : null].filter(Boolean).join(' · ')}
        </div>
        {(temperament || allergies || notes) ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
            {temperament ? <Badge size="sm" icon="heart">{temperament}</Badge> : null}
            {allergies ? <Badge size="sm" tone="warning" icon="triangle-alert">{allergies}</Badge> : null}
            {notes ? <Badge size="sm" icon="notebook-pen">{notes}</Badge> : null}
          </div>
        ) : null}
      </div>
      {(onEdit || onDelete) ? (
        <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-start' }}>
          {onEdit ? <IconButton icon="pencil" label={'Edit ' + name} onClick={(e) => { e.stopPropagation(); onEdit(); }} /> : null}
          {onDelete ? <IconButton icon="trash-2" label={'Delete ' + name} variant="danger" onClick={(e) => { e.stopPropagation(); onDelete(); }} /> : null}
        </div>
      ) : null}
    </div>
  );
}
