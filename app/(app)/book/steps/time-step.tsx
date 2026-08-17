import { selectTimeAction } from "../actions";
import type { WizardState } from "../../../../lib/ui/booking/wizard-state";
import { wizardQuery } from "../../../../lib/ui/booking/wizard-state";
import type { AvailabilityDay } from "../../../../lib/ui/booking/slot-days";
import { Alert } from "../../../../components/core/alert";

export const TimeStep = ({ state, days, errorCode }: { readonly state: WizardState; readonly days: ReadonlyArray<AvailabilityDay>; readonly errorCode?: string }) => (
  <section aria-labelledby="time-step-title">
    <h1 id="time-step-title" className="[font:var(--type-h2)] tracking-tight text-heading">Choose a date and time</h1>
    <p className="mt-1 mb-5 text-muted">All times are Eastern and include the cleanup buffer.</p>
    {errorCode === "SLOT_UNAVAILABLE" ? <Alert tone="danger" title="That time was just booked" code="SLOT_UNAVAILABLE" className="mb-4">We kept your pet and services. Pick another time to finish booking.</Alert> : null}
    {errorCode === "INVALID_AVAILABILITY_SEARCH" ? <Alert tone="warning" title="Check the date range" code="INVALID_AVAILABILITY_SEARCH" className="mb-4">Choose a valid start and end date within the booking window.</Alert> : null}
    <form method="get" className="mb-5 grid gap-3 rounded-lg border border-subtle-border bg-card p-4 sm:grid-cols-[1fr_1fr_auto]">
      {Object.entries({ intent: state.intent ?? "", step: "time", petId: state.petId ?? "", baseServiceId: state.baseServiceId ?? "", groomerId: state.groomerId ?? "any" }).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
      {state.addOnServiceIds.map((id) => <input key={id} type="hidden" name="addOnServiceId" value={id} />)}
      <label className="grid gap-1 text-sm font-semibold">From<input type="date" name="startsOn" defaultValue={state.startsOn ?? ""} className="h-11 rounded-md border border-default-border px-3" /></label>
      <label className="grid gap-1 text-sm font-semibold">Through<input type="date" name="endsOn" defaultValue={state.endsOn ?? ""} className="h-11 rounded-md border border-default-border px-3" /></label>
      <button type="submit" className="self-end h-11 rounded-md border border-default-border bg-card px-4 font-semibold">Refresh times</button>
    </form>
    {errorCode === "INVALID_AVAILABILITY_SEARCH" ? null : days.length === 0 ? <Alert tone="info" title="No times in this range">Try another date range or choose any available groomer.</Alert> : (
      <form action={selectTimeAction} className="grid gap-5">
        <input type="hidden" name="baseQuery" value={wizardQuery(state)} />
        {days.map((day) => <fieldset key={day.date}><legend className="mb-2 font-semibold text-heading">{day.label}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{day.slots.map((slot) => <label key={`${slot.startsAt}-${slot.groomerId}`} className="cursor-pointer rounded-md border border-slot-free-border bg-card p-3 text-center has-[:checked]:border-action has-[:checked]:bg-primary-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus"><input className="sr-only" type="radio" name="slot" required value={JSON.stringify({ startsAt: slot.startsAt, groomerId: slot.groomerId })} /><span className="font-semibold">{slot.timeLabel}</span></label>)}</div></fieldset>)}
        <button type="submit" className="h-(--control-h-md) rounded-md bg-action px-5 font-semibold text-on-primary">Review booking</button>
      </form>
    )}
  </section>
);
