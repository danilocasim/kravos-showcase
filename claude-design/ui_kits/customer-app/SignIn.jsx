const { Button, Input, Field, Logotype, Icon, Alert } = window.PawAmpPolishDesignSystem_25f2e9;

function SignIn({ onSignIn }) {
  const [email, setEmail] = React.useState('jordan@example.com');
  const [password, setPassword] = React.useState('••••••••••');
  return (
    <div style={{ minHeight: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 var(--space-11)', background: 'var(--surface-card)' }}>
        <Logotype size="md" style={{ marginBottom: 'var(--space-8)' }} />
        <h1 style={{ font: 'var(--type-h1)', letterSpacing: 'var(--tracking-tight)', marginBottom: 'var(--space-2)' }}>Welcome back</h1>
        <p style={{ font: 'var(--type-body)', color: 'var(--text-muted)', marginBottom: 'var(--space-7)' }}>Sign in to book a visit, manage your pets, and change appointments.</p>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 380 }} onSubmit={(e) => { e.preventDefault(); onSignIn(); }}>
          <Field label="Email" htmlFor="email"><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Password" htmlFor="pw"><Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          <Button size="lg" type="submit" fullWidth iconRight="arrow-right">Sign in</Button>
          <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--type-small)' }}>
            <a href="#">Create an account</a><a href="#">Forgot password?</a>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', font: 'var(--type-caption)', color: 'var(--text-subtle)', marginTop: 'var(--space-2)' }}>
            <Icon name="shield-check" size={14} />An account keeps your pets' details and appointment history in one place.
          </div>
        </form>
      </div>
      <div style={{ background: 'var(--spruce-900)', color: 'var(--sand-50)', padding: 'var(--space-11)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-6)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-3xl)', letterSpacing: 'var(--tracking-tight)', lineHeight: 1.15 }}>
          Brooklyn's calmest grooming appointments.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[['calendar-check', 'Real availability', 'Every time you see is a slot we can actually hold — buffers included.'],
            ['dog', 'One profile per dog', 'Breed, coat, temperament and allergies travel with every booking.'],
            ['refresh-cw', 'Free changes', 'Reschedule or cancel yourself up to 24 hours before.']].map(([icon, title, body]) => (
            <div key={title} style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <span style={{ flex: 'none', width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--spruce-800)', color: 'var(--apricot-300)', display: 'grid', placeItems: 'center' }}><Icon name={icon} size={17} /></span>
              <div>
                <div style={{ font: 'var(--type-body-strong)' }}>{title}</div>
                <div style={{ font: 'var(--type-small)', color: 'var(--spruce-200)' }}>{body}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', font: 'var(--type-caption)', color: 'var(--spruce-300)' }}>
          <Icon name="map-pin" size={13} />Court Street, Brooklyn · Mon–Fri 9–6, Sat 9–4
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SignIn });
