Product header, 64px tall, white on the sand page. Customer nav is three links max.

```jsx
<AppHeader userName="Jordan Reyes" onSignOut={signOut}
  value="appointments"
  links={[{value:'appointments',label:'My appointments',icon:'calendar-days'},{value:'pets',label:'My pets',icon:'dog'}]}
  right={<Button iconLeft="plus">Book a visit</Button>} />
```
