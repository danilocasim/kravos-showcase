Standard action button — use for every clickable action except icon-only controls (use IconButton) and inline text links (use variant="link").

```jsx
<Button variant="primary" size="lg" iconRight="arrow-right" onClick={next}>Continue to services</Button>
<Button variant="secondary" iconLeft="chevron-left">Back</Button>
<Button variant="accent" size="lg" fullWidth>Confirm appointment</Button>
```

- `primary` (spruce) for the main forward action; `accent` (apricot) only for the final booking confirmation.
- `danger` for destructive confirmations inside a Dialog, never as the default on a list row.
- `loading` shows a spinner and blocks clicks — use it while a mutation with an Idempotency-Key is in flight.
