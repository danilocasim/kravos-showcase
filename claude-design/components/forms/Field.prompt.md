Wrap every input, select, and textarea. Errors are inline and sentence-case, never a red border alone.

```jsx
<Field label="Pet name" htmlFor="pet-name" required error="Enter your dog's name.">
  <Input id="pet-name" invalid />
</Field>
<Field label="Allergies" htmlFor="allergies" optionalLabel hint="Anything the groomer should avoid.">
  <Textarea id="allergies" rows={3} />
</Field>
```
