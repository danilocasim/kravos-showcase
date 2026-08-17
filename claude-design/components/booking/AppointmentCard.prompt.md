Appointment row. Times are business-local; the displayed end time is the customer-facing end, not `blocked_until`. Inside the 24-hour cutoff, drop the actions and show `lockedNote`.

```jsx
<AppointmentCard dateLabel="Wed 2 Sep" timeLabel="10:15 AM" endTimeLabel="11:45 AM" petName="Biscuit"
  groomerName="Maya Chen" services={['Full Groom']} subtotalCents={8500} status="CONFIRMED"
  reference="APT-8F3C21"
  actions={<><Button size="sm" variant="secondary" iconLeft="refresh-cw">Reschedule</Button><Button size="sm" variant="ghost">Cancel</Button></>} />
```
