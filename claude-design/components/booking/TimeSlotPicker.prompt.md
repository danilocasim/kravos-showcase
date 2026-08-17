Step 4 availability. Every slot comes from `POST /api/v1/availability/search`; any-available slots show the groomer the server picked.

```jsx
<TimeSlotPicker selected={slot} onSelect={setSlot} note="All times are Eastern and include a 15-minute cleanup buffer."
  days={[{date:'2026-09-02',label:'Wed 2 Sep',slots:[{time:'9:00 AM',groomer:'Maya'},{time:'10:15 AM',groomer:'Sofia'}]}]} />
```
