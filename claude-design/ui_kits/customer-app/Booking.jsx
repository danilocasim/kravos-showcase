const { Button, Card, Alert, Badge, Icon, StepIndicator, PetCard, ServiceOption, GroomerOption, TimeSlotPicker, PriceSummary, EmptyState, Checkbox } = window.PawAmpPolishDesignSystem_25f2e9;

const PP_STEPS = ['Pet', 'Services', 'Groomer', 'Date & time', 'Review'];

function StepHeader({ title, hint }) {
  return (
    <div style={{ marginBottom: 'var(--space-5)' }}>
      <h2 style={{ font: 'var(--type-h2)', letterSpacing: 'var(--tracking-snug)' }}>{title}</h2>
      {hint ? <p style={{ font: 'var(--type-body)', color: 'var(--text-muted)', margin: '4px 0 0' }}>{hint}</p> : null}
    </div>
  );
}

function Booking({ pets, booking, setBooking, onConfirm, slotError, onClearSlotError }) {
  const step = booking.step;
  const base = PP_SERVICES.find((s) => s.id === booking.baseId);
  const addOns = PP_SERVICES.filter((s) => booking.addOnIds.includes(s.id));
  const selected = [base, ...addOns].filter(Boolean);
  const subtotalCents = selected.reduce((n, s) => n + s.priceCents, 0);
  const totalMinutes = selected.reduce((n, s) => n + s.durationMinutes, 0);
  const allowedAddOns = base ? (PP_COMPATIBILITY[base.id] || []) : [];
  const qualified = (g) => selected.every((s) => g.services.includes(s.id));
  const pet = pets.find((p) => p.id === booking.petId);
  const groomer = PP_GROOMERS.find((g) => g.id === booking.groomerId);
  const go = (n) => setBooking({ ...booking, step: n });

  const canContinue = [!!booking.petId, !!base, !!(booking.groomerId || booking.anyAvailable), !!booking.slot, booking.agreed][step];

  return (
    <div style={{ maxWidth: 'var(--container-app)', margin: '0 auto', padding: 'var(--space-7) var(--space-6) var(--space-10)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-7)' }}>
        <StepIndicator steps={PP_STEPS} current={step} onStepClick={go} />
        <span style={{ font: 'var(--type-caption)', color: 'var(--text-subtle)' }}>Step {step + 1} of 5</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-7)', alignItems: 'start' }}>
        <div>
          {step === 0 ? (
            <div>
              <StepHeader title="Who's coming in?" hint="Choose the dog for this visit." />
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {pets.map((p) => (
                  <PetCard key={p.id} {...p} selectable selected={booking.petId === p.id} onSelect={() => setBooking({ ...booking, petId: p.id })} />
                ))}
                <Button variant="secondary" iconLeft="plus" style={{ justifySelf: 'start' }}>Add another pet</Button>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <StepHeader title="Pick a service" hint="One main service, plus any add-ons that go with it." />
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {PP_SERVICES.filter((s) => s.kind === 'BASE').map((s) => (
                  <ServiceOption key={s.id} {...s} selected={booking.baseId === s.id}
                    onSelect={() => setBooking({ ...booking, baseId: s.id, addOnIds: booking.addOnIds.filter((id) => (PP_COMPATIBILITY[s.id] || []).includes(id)), groomerId: null, anyAvailable: true, slot: null })} />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 'var(--space-6) 0 var(--space-3)' }}>
                <span style={{ font: 'var(--type-label)', color: 'var(--text-heading)' }}>Add-ons</span>
                <Badge size="sm">Optional</Badge>
              </div>
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {PP_SERVICES.filter((s) => s.kind === 'ADD_ON').map((s) => {
                  const ok = allowedAddOns.includes(s.id);
                  return (
                    <ServiceOption key={s.id} {...s} selected={booking.addOnIds.includes(s.id)} disabled={!ok}
                      disabledReason={!base ? 'Choose a main service first' : s.id === 's4' ? 'Already included in ' + base.name : 'Not available with ' + base.name}
                      onSelect={() => setBooking({ ...booking, slot: null, addOnIds: booking.addOnIds.includes(s.id) ? booking.addOnIds.filter((id) => id !== s.id) : [...booking.addOnIds, s.id] })} />
                  );
                })}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', font: 'var(--type-caption)', color: 'var(--text-subtle)', marginTop: 'var(--space-4)' }}>
                <Icon name="info" size={13} />Just need nails? Nail Trim can be booked on its own as an express visit.
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <StepHeader title="Choose a groomer" hint="Any available groomer usually gives you the most times to choose from." />
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                <GroomerOption anyAvailable selected={booking.anyAvailable} onSelect={() => setBooking({ ...booking, anyAvailable: true, groomerId: null, slot: null })} />
                {PP_GROOMERS.map((g) => {
                  const ok = qualified(g);
                  const missing = selected.find((s) => !g.services.includes(s.id));
                  return (
                    <GroomerOption key={g.id} name={g.name} bio={g.bio} hours={g.hours}
                      selected={booking.groomerId === g.id} disabled={!ok}
                      disabledReason={missing ? 'Not qualified for ' + missing.name : undefined}
                      onSelect={() => setBooking({ ...booking, groomerId: g.id, anyAvailable: false, slot: null })} />
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <StepHeader title="Pick a time" hint={'Eastern time. Showing times for ' + (booking.anyAvailable ? 'any available groomer' : groomer.name) + '.'} />
              {slotError ? (
                <Alert tone="danger" title="That time was just booked" code="SLOT_UNAVAILABLE" style={{ marginBottom: 'var(--space-5)' }}
                  action={<Button size="sm" variant="secondary" iconLeft="refresh-cw" onClick={onClearSlotError}>Refresh times</Button>}>
                  We kept your pet and services. Pick another time to finish booking.
                </Alert>
              ) : null}
              <TimeSlotPicker days={PP_DAYS} selected={booking.slot} onSelect={(slot) => setBooking({ ...booking, slot })}
                note="Every time includes the 15-minute cleanup buffer after your dog's service." />
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <StepHeader title="Review & confirm" hint="Check everything, then confirm to hold the slot." />
              <Card padding="lg" style={{ display: 'grid', gap: 'var(--space-4)' }}>
                {[['dog', 'Pet', pet ? pet.name + ' · ' + pet.breed + ' · ' + (pet.ageYears || 0) + ' yrs' : ''],
                  ['scissors', 'Services', selected.map((s) => s.name).join(' + ')],
                  ['user-round', 'Groomer', booking.anyAvailable ? (booking.slot && booking.slot.groomer ? booking.slot.groomer + ' (assigned for you)' : 'Any available groomer') : groomer.name],
                  ['calendar-days', 'When', booking.slot ? booking.slot.date === '2026-09-02' ? 'Wed 2 Sep 2026, ' + booking.slot.time : 'Thu 3 Sep 2026, ' + booking.slot.time : ''],
                  ['clock', 'Time with your groomer', totalMinutes + ' min, then a 15-min cleanup buffer']].map(([icon, label, value]) => (
                  <div key={label} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                    <span style={{ flex: 'none', width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', color: 'var(--text-muted)', display: 'grid', placeItems: 'center' }}><Icon name={icon} size={16} /></span>
                    <div>
                      <div style={{ font: 'var(--type-caption)', color: 'var(--text-subtle)' }}>{label}</div>
                      <div style={{ font: 'var(--type-body-strong)', color: 'var(--text-heading)' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </Card>
              <Alert tone="info" title="Free changes until 24 hours before" style={{ marginTop: 'var(--space-4)' }}>
                After that, call the salon and we'll sort it out. You pay at the salon — nothing is charged now.
              </Alert>
              <Checkbox style={{ marginTop: 'var(--space-4)' }} checked={booking.agreed} onChange={() => setBooking({ ...booking, agreed: !booking.agreed })}
                label="I've checked the pet, services, groomer, date and time above." />
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-7)' }}>
            {step > 0 ? <Button variant="secondary" iconLeft="chevron-left" onClick={() => go(step - 1)}>Back</Button> : null}
            {step < 4 ? (
              <Button size="lg" iconRight="arrow-right" disabled={!canContinue} onClick={() => go(step + 1)}>Continue</Button>
            ) : (
              <Button size="lg" variant="accent" iconRight="check" disabled={!canContinue} onClick={onConfirm}>Confirm appointment</Button>
            )}
          </div>
        </div>

        <div style={{ position: 'sticky', top: 'var(--space-6)', display: 'grid', gap: 'var(--space-4)' }}>
          <Card padding="md" style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <div style={{ font: 'var(--type-label)', color: 'var(--text-heading)' }}>Your visit</div>
            {[[pet ? pet.name : 'Choose a pet', 'dog'],
              [selected.length ? selected.map((s) => s.name).join(' + ') : 'Choose a service', 'scissors'],
              [booking.anyAvailable ? 'Any available groomer' : groomer.name, 'user-round'],
              [booking.slot ? (booking.slot.date === '2026-09-02' ? 'Wed 2 Sep' : 'Thu 3 Sep') + ', ' + booking.slot.time : 'Choose a time', 'calendar-days']].map(([text, icon], i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', font: 'var(--type-small)', color: text.startsWith('Choose') ? 'var(--text-subtle)' : 'var(--text-body)' }}>
                <Icon name={icon} size={14} color={text.startsWith('Choose') ? 'var(--text-subtle)' : 'var(--spruce-600)'} />{text}
              </div>
            ))}
          </Card>
          {selected.length ? (
            <PriceSummary subtotalCents={subtotalCents} totalMinutes={totalMinutes}
              lines={selected.map((s) => ({ name: s.name, priceCents: s.priceCents, durationMinutes: s.durationMinutes }))}
              footnote="You pay at the salon. Prices and durations come straight from our catalogue." />
          ) : (
            <Card tone="sunken" padding="md" style={{ font: 'var(--type-small)', color: 'var(--text-muted)' }}>Pick a service to see the subtotal and how long the visit takes.</Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Confirmation({ booking, pets, onDone }) {
  const pet = pets.find((p) => p.id === booking.petId);
  const base = PP_SERVICES.find((s) => s.id === booking.baseId);
  const addOns = PP_SERVICES.filter((s) => booking.addOnIds.includes(s.id));
  const selected = [base, ...addOns].filter(Boolean);
  return (
    <div style={{ maxWidth: 'var(--container-form)', margin: '0 auto', padding: 'var(--space-10) var(--space-6)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--space-3)' }}>
        <span style={{ width: 56, height: 56, borderRadius: 'var(--radius-pill)', background: 'var(--success-50)', color: 'var(--success-700)', display: 'grid', placeItems: 'center' }}><Icon name="circle-check" size={30} /></span>
        <h1 style={{ font: 'var(--type-h1)', letterSpacing: 'var(--tracking-tight)' }}>You're booked</h1>
        <p style={{ font: 'var(--type-body)', color: 'var(--text-muted)', maxWidth: 420 }}>
          We've saved {pet ? pet.name + "'s" : 'your'} spot. Bring them in a few minutes early so they can settle.
        </p>
      </div>
      <Card padding="lg" style={{ marginTop: 'var(--space-7)', display: 'grid', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div>
            <div style={{ font: 'var(--type-caption)', color: 'var(--text-subtle)' }}>Booking reference</div>
            <div style={{ font: 'var(--type-mono)', fontSize: 'var(--text-base)', color: 'var(--text-heading)' }}>APT-8F3C21</div>
          </div>
          <Badge tone="success" icon="circle-check">Confirmed</Badge>
        </div>
        <div style={{ height: 1, background: 'var(--border-subtle)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          {[['Pet', pet ? pet.name + ' · ' + pet.breed : ''], ['Services', selected.map((s) => s.name).join(' + ')],
            ['Groomer', booking.slot && booking.slot.groomer ? booking.slot.groomer : 'Assigned groomer'],
            ['When', booking.slot ? (booking.slot.date === '2026-09-02' ? 'Wed 2 Sep 2026' : 'Thu 3 Sep 2026') + ', ' + booking.slot.time : '']].map(([k, v]) => (
            <div key={k}><div style={{ font: 'var(--type-caption)', color: 'var(--text-subtle)' }}>{k}</div><div style={{ font: 'var(--type-body-strong)', color: 'var(--text-heading)' }}>{v}</div></div>
          ))}
        </div>
      </Card>
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-6)' }}>
        <Button size="lg" iconLeft="calendar-days" onClick={onDone}>Go to my appointments</Button>
        <Button size="lg" variant="secondary" iconLeft="house">Back home</Button>
      </div>
    </div>
  );
}

Object.assign(window, { Booking, Confirmation, PP_STEPS });
