The booking flow's selection primitive. One base service is `control="radio"`; add-ons are `control="checkbox"`. Incompatible options stay visible and disabled with a reason — never hidden.

```jsx
<ChoiceCard control="radio" icon="scissors" title="Full Groom" meta="$85"
  description="Bath, drying, haircut, brush-out, and nail trim · 90 min" selected onSelect={pick} />
<ChoiceCard control="checkbox" icon="paw-print" title="Nail Trim" meta="$15"
  disabled disabledReason="Already included in Full Groom" />
```
