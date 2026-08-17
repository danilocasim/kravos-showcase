Modal confirmation. Positioned absolutely inside the nearest positioned ancestor so screens/kits can host it. Title states the outcome, not the question.

```jsx
<Dialog open tone="danger" title="Cancel this appointment?"
  description="Maya Chen, Wed 2 Sep, 10:15 AM. This frees the slot immediately."
  footer={<><Button variant="secondary">Keep it</Button><Button variant="danger">Cancel appointment</Button></>} />
```
