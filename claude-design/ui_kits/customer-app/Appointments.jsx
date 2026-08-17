const { Button, Card, Tabs, AppointmentCard, EmptyState, Dialog, Alert, Icon } = window.PawAmpPolishDesignSystem_25f2e9;

function Appointments({ appointments, onCancel, onBook }) {
  const [tab, setTab] = React.useState('upcoming');
  const [cancelling, setCancelling] = React.useState(null);
  const upcoming = appointments.filter((a) => a.status === 'CONFIRMED');
  const past = appointments.filter((a) => a.status !== 'CONFIRMED');
  const list = tab === 'upcoming' ? upcoming : past;
  return (
    <div style={{ maxWidth: 'var(--container-app)', margin: '0 auto', padding: 'var(--space-8) var(--space-6)', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        <div>
          <h1 style={{ font: 'var(--type-h1)', letterSpacing: 'var(--tracking-tight)' }}>My appointments</h1>
          <p style={{ font: 'var(--type-body)', color: 'var(--text-muted)', margin: '4px 0 0' }}>All times are Eastern, the way the salon runs them.</p>
        </div>
        <Button iconLeft="plus" onClick={onBook}>Book a visit</Button>
      </div>
      <Tabs value={tab} onChange={setTab} style={{ marginBottom: 'var(--space-5)' }}
        tabs={[{ value: 'upcoming', label: 'Upcoming', count: upcoming.length }, { value: 'past', label: 'Past & cancelled', count: past.length }]} />
      {list.length ? (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {list.map((a) => (
            <AppointmentCard key={a.id} {...a} reference={a.id}
              lockedNote={a.status === 'CONFIRMED' && !a.changeable ? 'Inside the 24-hour window — call the salon on (718) 555-0148 to change this visit.' : undefined}
              actions={a.status === 'CONFIRMED' && a.changeable ? (
                <>
                  <Button size="sm" variant="secondary" iconLeft="refresh-cw">Reschedule</Button>
                  <Button size="sm" variant="ghost" onClick={() => setCancelling(a)}>Cancel</Button>
                </>
              ) : a.status === 'COMPLETED' ? (
                <Button size="sm" variant="secondary" iconLeft="refresh-cw" onClick={onBook}>Book this again</Button>
              ) : null} />
          ))}
        </div>
      ) : (
        <EmptyState icon="calendar-days" title="Nothing booked yet" description="Pick a service and a time that suits you — it takes about a minute." action={<Button iconLeft="plus" onClick={onBook}>Book a visit</Button>} />
      )}
      <Dialog
        open={!!cancelling} tone="danger" title="Cancel this appointment?"
        description={cancelling ? cancelling.groomerName + ' · ' + cancelling.dateLabel + ', ' + cancelling.timeLabel + '. The slot is released straight away.' : ''}
        onClose={() => setCancelling(null)}
        footer={<>
          <Button variant="secondary" onClick={() => setCancelling(null)}>Keep it</Button>
          <Button variant="danger" onClick={() => { onCancel(cancelling.id); setCancelling(null); }}>Cancel appointment</Button>
        </>}
      >
        <Alert tone="warning" title="This can't be undone">You can always book a new visit — the same time may not still be free.</Alert>
      </Dialog>
    </div>
  );
}

Object.assign(window, { Appointments });
