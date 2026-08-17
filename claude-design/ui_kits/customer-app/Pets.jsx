const { Button, Card, PetCard, EmptyState, Dialog, Field, Input, Select, Textarea, Icon } = window.PawAmpPolishDesignSystem_25f2e9;

function Pets({ pets, onAdd, onDelete }) {
  const [adding, setAdding] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', breed: '', size: '', ageYears: '', temperament: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <div style={{ maxWidth: 'var(--container-app)', margin: '0 auto', padding: 'var(--space-8) var(--space-6)', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ font: 'var(--type-h1)', letterSpacing: 'var(--tracking-tight)' }}>My pets</h1>
          <p style={{ font: 'var(--type-body)', color: 'var(--text-muted)', margin: '4px 0 0' }}>Details you save here are shared with your groomer at every visit.</p>
        </div>
        <Button iconLeft="plus" onClick={() => setAdding(true)}>Add a pet</Button>
      </div>
      {pets.length ? (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {pets.map((p) => <PetCard key={p.id} {...p} onEdit={() => {}} onDelete={() => onDelete(p.id)} />)}
        </div>
      ) : (
        <EmptyState icon="dog" title="No pets yet" description="Add your dog's details once and reuse them at every booking." action={<Button iconLeft="plus" onClick={() => setAdding(true)}>Add a pet</Button>} />
      )}
      <Card tone="sunken" padding="sm" style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
        <Icon name="info" size={16} color="var(--text-muted)" style={{ marginTop: 2 }} />
        <div style={{ font: 'var(--type-small)', color: 'var(--text-muted)' }}>
          Pet details are operational notes for your groomer — coat condition, temperament, product allergies. They aren't medical records, and we don't give veterinary advice.
        </div>
      </Card>
      <Dialog
        open={adding} title="Add a pet" description="Dogs only for now. You can edit any of this later."
        onClose={() => setAdding(false)} width={520}
        footer={<>
          <Button variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
          <Button onClick={() => { onAdd({ ...form, ageYears: Number(form.ageYears) || 0 }); setAdding(false); setForm({ name: '', breed: '', size: '', ageYears: '', temperament: '' }); }}>Save pet</Button>
        </>}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Field label="Name" htmlFor="pn" required><Input id="pn" placeholder="Biscuit" value={form.name} onChange={set('name')} /></Field>
          <Field label="Breed" htmlFor="pb" required><Input id="pb" placeholder="Cockapoo" value={form.breed} onChange={set('breed')} /></Field>
          <Field label="Size" htmlFor="ps" required><Select id="ps" placeholder="Select a size" value={form.size} onChange={set('size')} options={[{ value: 'SMALL', label: 'Small' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'LARGE', label: 'Large' }]} /></Field>
          <Field label="Age in years" htmlFor="pa" required><Input id="pa" type="number" placeholder="3" value={form.ageYears} onChange={set('ageYears')} /></Field>
          <Field label="Temperament" htmlFor="pt" optionalLabel style={{ gridColumn: '1 / -1' }}><Input id="pt" placeholder="Calm, nervous with clippers…" value={form.temperament} onChange={set('temperament')} /></Field>
          <Field label="Notes for the groomer" htmlFor="pnote" optionalLabel hint="Allergies, matting, anything to avoid." style={{ gridColumn: '1 / -1' }}><Textarea id="pnote" rows={3} /></Field>
        </div>
      </Dialog>
    </div>
  );
}

Object.assign(window, { Pets });
