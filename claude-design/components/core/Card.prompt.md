Base surface for every grouped block: pet lists, review summaries, appointment rows, form panels.

```jsx
<Card padding="lg"><h3>Review &amp; confirm</h3></Card>
<Card interactive selected onClick={pick}>…</Card>
```

Cards never nest more than one level; use `tone="sunken"` for an inner detail block instead of a second bordered card.
