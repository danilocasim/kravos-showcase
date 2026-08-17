import Link from "next/link";

import type { Groomer, Service } from "../../../../lib/booking/use-cases";
import { Alert } from "../../../../components/core/alert";
import type { WizardState } from "../../../../lib/ui/booking/wizard-state";

export const GroomerStep = ({ groomers, qualified, selectedServices, state }: { readonly groomers: ReadonlyArray<Groomer>; readonly qualified: ReadonlyArray<Groomer>; readonly selectedServices: ReadonlyArray<Service>; readonly state: WizardState }) => {
  const qualifiedIds = new Set(qualified.map((groomer) => groomer.id));
  return (
    <section aria-labelledby="groomer-step-title">
      <h1 id="groomer-step-title" className="[font:var(--type-h2)] tracking-tight text-heading">Choose a groomer</h1>
      <p className="mt-1 mb-5 text-muted">Any available gets you the widest choice of times.</p>
      {qualified.length === 0 ? <Alert tone="warning" title="No groomer can perform that combination" className="mb-4">Choose a different service combination. <Link href={`/book?${new URLSearchParams({ intent: state.intent ?? "", step: "services", petId: state.petId ?? "" })}`} className="font-semibold text-link underline">Change services</Link></Alert> : null}
      <form method="get" className="grid gap-3">
        {Object.entries({ intent: state.intent ?? "", step: "time", petId: state.petId ?? "", baseServiceId: state.baseServiceId ?? "" }).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
        {state.addOnServiceIds.map((id) => <input key={id} type="hidden" name="addOnServiceId" value={id} />)}
        <label className="flex gap-3 rounded-lg border border-subtle-border bg-card p-4 has-[:checked]:border-action has-[:checked]:bg-primary-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus"><input type="radio" name="groomerId" value="any" disabled={qualified.length === 0} defaultChecked={state.groomerId === null || state.groomerId === "any"} /><span><strong className="block text-heading">Any available groomer</strong><span className="text-sm text-muted">Show every valid time.</span></span></label>
        {groomers.map((groomer) => {
          const enabled = qualifiedIds.has(groomer.id);
          return <label key={groomer.id} className="flex gap-3 rounded-lg border border-subtle-border bg-card p-4 has-[:checked]:border-action has-[:checked]:bg-primary-soft has-[:disabled]:opacity-60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus"><input type="radio" name="groomerId" value={groomer.id} disabled={!enabled} defaultChecked={state.groomerId === groomer.id} /><span><strong className="block text-heading">{groomer.displayName}</strong><span className="text-sm text-muted">{enabled ? groomer.bio : `Not qualified for ${selectedServices.map((service) => service.name).join(", ")}`}</span></span></label>;
        })}
        <button type="submit" disabled={qualified.length === 0} className="mt-2 h-(--control-h-md) rounded-md bg-action px-5 font-semibold text-on-primary">Find times</button>
      </form>
    </section>
  );
};
