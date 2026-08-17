const { AppHeader, SideNav, Card, Badge, StatusPill, Button, IconButton, Select, Switch, Tabs, Icon, Dialog, Alert, EmptyState, Tooltip, Logotype } = window.PawAmpPolishDesignSystem_25f2e9;

function StatTile({ label, value, icon, tone }) {
  return (
    <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      <span style={{ flex: 'none', width: 36, height: 36, borderRadius: 'var(--radius-md)', background: tone === 'accent' ? 'var(--apricot-100)' : 'var(--surface-primary-soft)', color: tone === 'accent' ? 'var(--apricot-700)' : 'var(--spruce-700)', display: 'grid', placeItems: 'center' }}>
        <Icon name={icon} size={18} />
      </span>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--text-heading)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </Card>
  );
}

function AppointmentRow({ appt, onComplete, onCancel }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '92px minmax(220px, 1.5fr) minmax(160px, 1fr) 120px 118px 80px', gap: 'var(--space-4)', alignItems: 'center', padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-subtle)', opacity: appt.status === 'CANCELLED' ? 0.6 : 1 }}>
      <div>
        <div style={{ font: 'var(--type-body-strong)', color: 'var(--text-heading)' }}>{appt.time}</div>
        <div style={{ font: 'var(--type-caption)', color: 'var(--text-subtle)' }}>to {appt.end}</div>
      </div>
      <div>
        <div style={{ font: 'var(--type-body-strong)', color: 'var(--text-heading)' }}>{appt.pet}</div>
        <div style={{ font: 'var(--type-small)', color: 'var(--text-muted)' }}>{appt.petMeta} · {appt.services.join(' + ')}</div>
      </div>
      <div style={{ font: 'var(--type-small)', color: 'var(--text-body)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Icon name="user-round" size={14} color="var(--text-subtle)" />{appt.customer}</div>
        <div style={{ font: 'var(--type-mono)', fontSize: 'var(--text-2xs)', color: 'var(--text-subtle)', marginTop: '2px' }}>{appt.id}</div>
      </div>
      <div style={{ font: 'var(--type-small)', color: 'var(--text-body)' }}>{appt.groomer}</div>
      <div><StatusPill status={appt.status} /></div>
      <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
        {appt.status === 'CONFIRMED' ? (
          <>
            <Tooltip label="Mark completed"><IconButton icon="badge-check" label={'Mark ' + appt.id + ' completed'} variant="outline" onClick={() => onComplete(appt.id)} /></Tooltip>
            <Tooltip label="Cancel"><IconButton icon="circle-x" label={'Cancel ' + appt.id} variant="danger" onClick={() => onCancel(appt)} /></Tooltip>
          </>
        ) : (
          <span style={{ font: 'var(--type-caption)', color: 'var(--text-subtle)' }}>No actions</span>
        )}
      </div>
    </div>
  );
}

function AdminConsole() {
  const [nav, setNav] = React.useState('today');
  const [appts, setAppts] = React.useState(ADMIN_APPTS);
  const [groomer, setGroomer] = React.useState('');
  const [showCancelled, setShowCancelled] = React.useState(true);
  const [cancelling, setCancelling] = React.useState(null);

  const visible = appts.filter((a) => (!groomer || a.groomer === groomer) && (showCancelled || a.status !== 'CANCELLED'));
  const confirmed = appts.filter((a) => a.status === 'CONFIRMED');
  const revenue = appts.filter((a) => a.status !== 'CANCELLED').reduce((n, a) => n + a.subtotalCents, 0);

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppHeader userName="Maya Chen" onSignOut={() => {}} right={<Badge tone="primary" icon="shield-check">Admin</Badge>} />
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-page-alt)' }}>
          <SideNav value={nav} onChange={setNav} items={[
            { value: 'today', label: 'Today', icon: 'calendar-check', count: confirmed.length },
            { value: 'calendar', label: 'Calendar', icon: 'calendar-days' },
            { value: 'groomers', label: 'Groomers', icon: 'users', count: 3 },
            { value: 'services', label: 'Services', icon: 'scissors', count: 5 }
          ]} />
        </div>
        <div style={{ flex: 1, padding: 'var(--space-7)', position: 'relative', minWidth: 0 }}>
          {nav === 'today' || nav === 'calendar' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                <div>
                  <h1 style={{ font: 'var(--type-h2)', letterSpacing: 'var(--tracking-snug)' }}>Wednesday 2 September</h1>
                  <p style={{ font: 'var(--type-small)', color: 'var(--text-muted)', margin: '4px 0 0' }}>Eastern time · 15-minute cleanup buffer applied after every visit</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Button size="sm" variant="secondary" iconLeft="chevron-left">Tue 1</Button>
                  <Button size="sm" variant="secondary" iconRight="chevron-right">Thu 3</Button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
                <StatTile label="Confirmed today" value={confirmed.length} icon="calendar-check" />
                <StatTile label="Completed" value={appts.filter((a) => a.status === 'COMPLETED').length} icon="badge-check" />
                <StatTile label="Cancelled" value={appts.filter((a) => a.status === 'CANCELLED').length} icon="circle-x" />
                <StatTile label="Booked services" value={'$' + (revenue / 100).toFixed(0)} icon="credit-card" tone="accent" />
              </div>
              <Card padding="none" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ font: 'var(--type-label)', color: 'var(--text-heading)' }}>Appointments</span>
                  <div style={{ width: 200 }}>
                    <Select size="sm" value={groomer} onChange={(e) => setGroomer(e.target.value)} placeholder="All groomers"
                      options={ADMIN_GROOMERS.map((g) => ({ value: g.name, label: g.name }))} />
                  </div>
                  <Switch checked={showCancelled} onChange={() => setShowCancelled(!showCancelled)} label="Show cancelled" />
                  <span style={{ marginLeft: 'auto', font: 'var(--type-caption)', color: 'var(--text-subtle)' }}>{visible.length} shown</span>
                </div>
                {visible.length ? visible.map((a) => (
                  <AppointmentRow key={a.id} appt={a}
                    onComplete={(id) => setAppts(appts.map((x) => (x.id === id ? { ...x, status: 'COMPLETED' } : x)))}
                    onCancel={setCancelling} />
                )) : (
                  <div style={{ padding: 'var(--space-6)' }}>
                    <EmptyState compact icon="calendar-x" title="Nothing matches these filters" description="Clear the groomer filter to see the full day." action={<Button size="sm" variant="secondary" onClick={() => { setGroomer(''); setShowCancelled(true); }}>Clear filters</Button>} />
                  </div>
                )}
              </Card>
              <Alert tone="info" title="Admin overrides are audited" style={{ marginTop: 'var(--space-5)' }}>
                Admins can cancel inside the customer's 24-hour cutoff. Every status change is recorded against the appointment.
              </Alert>
            </>
          ) : null}

          {nav === 'groomers' ? (
            <>
              <h1 style={{ font: 'var(--type-h2)', letterSpacing: 'var(--tracking-snug)', marginBottom: 'var(--space-5)' }}>Groomers</h1>
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {ADMIN_GROOMERS.map((g) => (
                  <Card key={g.name} padding="md" style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                    <span style={{ flex: 'none', width: 44, height: 44, borderRadius: 'var(--radius-pill)', background: 'var(--apricot-200)', color: 'var(--spruce-900)', display: 'grid', placeItems: 'center', font: 'var(--type-body-strong)' }}>
                      {g.name.split(' ').map((p) => p[0]).join('')}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: 'var(--type-h4)', color: 'var(--text-heading)' }}>{g.name}</div>
                      <div style={{ font: 'var(--type-small)', color: 'var(--text-muted)' }}>{g.services}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <Badge icon="clock">{g.hours}</Badge>
                      {g.note ? <Badge tone="warning" icon="ban">{g.note}</Badge> : null}
                    </div>
                    <IconButton icon="pencil" label={'Edit ' + g.name} variant="outline" />
                  </Card>
                ))}
              </div>
            </>
          ) : null}

          {nav === 'services' ? (
            <>
              <h1 style={{ font: 'var(--type-h2)', letterSpacing: 'var(--tracking-snug)', marginBottom: 'var(--space-5)' }}>Service catalogue</h1>
              <Card padding="none" style={{ overflow: 'hidden' }}>
                {[['Bath & Brush', 'BASE', '60 min', '$55'], ['Full Groom', 'BASE', '90 min', '$85'], ['Puppy Introduction Groom', 'BASE', '45 min', '$45'], ['Nail Trim', 'ADD_ON', '15 min', '$15'], ['De-shedding Treatment', 'ADD_ON', '30 min', '$30']].map(([name, kind, dur, price]) => (
                  <div key={name} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 90px 70px 40px', gap: 'var(--space-4)', alignItems: 'center', padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ font: 'var(--type-body-strong)', color: 'var(--text-heading)' }}>{name}</div>
                    <Badge tone={kind === 'BASE' ? 'primary' : 'accent'} size="sm">{kind === 'BASE' ? 'Base service' : 'Add-on'}</Badge>
                    <div style={{ font: 'var(--type-small)', color: 'var(--text-muted)' }}>{dur}</div>
                    <div style={{ font: 'var(--type-mono)', color: 'var(--text-body)' }}>{price}</div>
                    <IconButton icon="pencil" label={'Edit ' + name} />
                  </div>
                ))}
              </Card>
            </>
          ) : null}

          <Dialog open={!!cancelling} tone="danger" title="Cancel this appointment?" onClose={() => setCancelling(null)}
            description={cancelling ? cancelling.pet + ' · ' + cancelling.customer + ' · ' + cancelling.time + ' with ' + cancelling.groomer : ''}
            footer={<>
              <Button variant="secondary" onClick={() => setCancelling(null)}>Keep it</Button>
              <Button variant="danger" onClick={() => { setAppts(appts.map((x) => (x.id === cancelling.id ? { ...x, status: 'CANCELLED' } : x))); setCancelling(null); }}>Cancel appointment</Button>
            </>}>
            <Alert tone="warning" title="The customer is not notified automatically">Call them if the visit is within 24 hours.</Alert>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AdminConsole />);
