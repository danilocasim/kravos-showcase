Catalogue row for step 2. Icons are mapped per service name: Bath & Brush → droplets, Full Groom → scissors, Puppy Introduction Groom → heart, Nail Trim → paw-print, De-shedding Treatment → sparkles.

```jsx
<ServiceOption name="Full Groom" description="Bath, drying, haircut, brush-out, and nail trim." durationMinutes={90} priceCents={8500} selected onSelect={pick} />
<ServiceOption name="Nail Trim" kind="ADD_ON" durationMinutes={15} priceCents={1500} disabled disabledReason="Included in Full Groom" />
```
