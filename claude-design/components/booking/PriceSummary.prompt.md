Money and duration block on the services step and the review step. Show the subtotal only — v1 has no tax or payment.

```jsx
<PriceSummary subtotalCents={8500} totalMinutes={90}
  lines={[{name:'Full Groom',priceCents:8500,durationMinutes:90}]}
  footnote="You pay at the salon. Free changes until 24 hours before." />
```
