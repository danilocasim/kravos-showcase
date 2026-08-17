Empty list / no-results block. Always name the next step; never leave a bare "No data".

```jsx
<EmptyState icon="dog" title="No pets yet" description="Add your dog's details once and reuse them at every booking."
  action={<Button iconLeft="plus">Add a pet</Button>} />
<EmptyState icon="calendar-x" title="No times in this range" description="Try a later week, or choose any available groomer." compact />
```
