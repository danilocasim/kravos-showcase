Inline, non-blocking message. The booking flow's error states are Alerts, not Toasts, because they need a visible recovery route.

```jsx
<Alert tone="danger" title="That time was just booked" code="SLOT_UNAVAILABLE"
  action={<Button size="sm" variant="secondary" iconLeft="refresh-cw">See new times</Button>}>
  We kept your pet and services. Pick another time to finish booking.
</Alert>
<Alert tone="info" title="Free changes until 24 hours before">…</Alert>
```
