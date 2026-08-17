const { AppHeader, Button, Toast } = window.PawAmpPolishDesignSystem_25f2e9;

function CustomerApp() {
  const [signedIn, setSignedIn] = React.useState(true);
  const [view, setView] = React.useState('appointments');
  const [pets, setPets] = React.useState(PP_PETS);
  const [appointments, setAppointments] = React.useState(PP_APPOINTMENTS);
  const [toast, setToast] = React.useState(null);
  const [slotError, setSlotError] = React.useState(false);
  const [booking, setBooking] = React.useState({ step: 0, petId: 'p1', baseId: null, addOnIds: [], groomerId: null, anyAvailable: true, slot: null, agreed: false });

  const notify = (t) => { setToast(t); window.setTimeout(() => setToast(null), 5000); };

  if (!signedIn) return <SignIn onSignIn={() => setSignedIn(true)} />;

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppHeader
        userName="Jordan Reyes" onSignOut={() => setSignedIn(false)}
        value={view === 'booking' || view === 'confirmed' ? 'appointments' : view}
        onNavigate={setView}
        links={[{ value: 'appointments', label: 'My appointments', icon: 'calendar-days' }, { value: 'pets', label: 'My pets', icon: 'dog' }]}
        right={view === 'booking' ? null : <Button size="sm" iconLeft="plus" onClick={() => { setBooking({ step: 0, petId: 'p1', baseId: null, addOnIds: [], groomerId: null, anyAvailable: true, slot: null, agreed: false }); setView('booking'); }}>Book a visit</Button>}
      />
      <div style={{ flex: 1 }}>
        {view === 'appointments' ? (
          <Appointments appointments={appointments} onBook={() => setView('booking')}
            onCancel={(id) => { setAppointments(appointments.map((a) => (a.id === id ? { ...a, status: 'CANCELLED', changeable: false } : a))); notify({ title: 'Appointment cancelled', description: 'The slot is free for someone else now.' }); }} />
        ) : null}
        {view === 'pets' ? (
          <Pets pets={pets}
            onAdd={(p) => { setPets([...pets, { ...p, id: 'p' + (pets.length + 1) }]); notify({ title: 'Pet saved', description: (p.name || 'Your dog') + ' is ready for booking.' }); }}
            onDelete={(id) => { setPets(pets.filter((p) => p.id !== id)); notify({ title: 'Pet removed' }); }} />
        ) : null}
        {view === 'booking' ? (
          <Booking pets={pets} booking={booking} setBooking={setBooking} slotError={slotError} onClearSlotError={() => setSlotError(false)}
            onConfirm={() => {
              const base = PP_SERVICES.find((s) => s.id === booking.baseId);
              const addOns = PP_SERVICES.filter((s) => booking.addOnIds.includes(s.id));
              const names = [base, ...addOns].filter(Boolean).map((s) => s.name);
              const subtotal = [base, ...addOns].filter(Boolean).reduce((n, s) => n + s.priceCents, 0);
              const pet = pets.find((p) => p.id === booking.petId);
              setAppointments([{
                id: 'APT-8F3C21', dateLabel: booking.slot.date === '2026-09-02' ? 'Wed 2 Sep' : 'Thu 3 Sep', timeLabel: booking.slot.time,
                endTimeLabel: null, petName: pet ? pet.name : '', groomerName: booking.slot.groomer ? booking.slot.groomer : 'Assigned groomer',
                services: names, subtotalCents: subtotal, status: 'CONFIRMED', changeable: true
              }, ...appointments.filter((a) => a.id !== 'APT-8F3C21')]);
              setView('confirmed');
            }} />
        ) : null}
        {view === 'confirmed' ? <Confirmation booking={booking} pets={pets} onDone={() => setView('appointments')} /> : null}
      </div>
      {toast ? (
        <div style={{ position: 'fixed', right: 'var(--space-6)', bottom: 'var(--space-6)', zIndex: 50 }}>
          <Toast title={toast.title} description={toast.description} onDismiss={() => setToast(null)} />
        </div>
      ) : null}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CustomerApp />);
