import type { Service, ServiceCompatibility } from "../../../../lib/booking/use-cases";
import type { WizardState } from "../../../../lib/ui/booking/wizard-state";
import { buildAddOnAvailability } from "../../../../lib/ui/booking/add-on-availability";

export const ServicesStep = ({ services, compatibility, state }: { readonly services: ReadonlyArray<Service>; readonly compatibility: ReadonlyArray<ServiceCompatibility>; readonly state: WizardState }) => {
  const bases = services.filter((service) => service.kind === "BASE");
  const addOns = services.filter((service) => service.kind === "ADD_ON");
  const selectedBase = state.baseServiceId;
  const availability = selectedBase === null ? [] : buildAddOnAvailability(selectedBase, addOns, compatibility);

  return (
    <section aria-labelledby="services-step-title">
      <h1 id="services-step-title" className="[font:var(--type-h2)] tracking-tight text-heading">Choose services</h1>
      <p className="mt-1 mb-5 text-muted">Prices and durations come from today’s salon catalogue.</p>
      <form method="get" className="grid gap-5">
        <input type="hidden" name="intent" value={state.intent ?? ""} /><input type="hidden" name="step" value={selectedBase === null ? "services" : "groomer"} /><input type="hidden" name="petId" value={state.petId ?? ""} />
        <fieldset className="grid gap-3"><legend className="mb-2 [font:var(--type-h4)] text-heading">Main service</legend>
          {[...bases, ...addOns.filter((service) => service.isStandaloneEligible)].map((service) => (
            <label key={service.id} className="flex cursor-pointer gap-3 rounded-lg border border-subtle-border bg-card p-4 has-[:checked]:border-action has-[:checked]:bg-primary-soft">
              <input type="radio" name="baseServiceId" value={service.id} defaultChecked={selectedBase === service.id} required className="mt-1 accent-spruce-700" />
              <span className="flex-1"><span className="block font-semibold text-heading">{service.name}</span><span className="block [font:var(--type-small)] text-muted">{service.description}</span></span>
            </label>
          ))}
        </fieldset>
        {selectedBase !== null && addOns.every((service) => service.id !== selectedBase) ? (
          <fieldset className="grid gap-3"><legend className="mb-2 [font:var(--type-h4)] text-heading">Add-ons</legend>
            {addOns.map((service) => {
              const item = availability.find((entry) => entry.serviceId === service.id);
              return <label key={service.id} className="flex gap-3 rounded-lg border border-subtle-border bg-card p-4 has-[:checked]:border-action has-[:checked]:bg-primary-soft has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                <input type="checkbox" name="addOnServiceId" value={service.id} disabled={item?.selectable === false} defaultChecked={state.addOnServiceIds.includes(service.id)} className="mt-1 accent-spruce-700" />
                <span><span className="block font-semibold text-heading">{service.name}</span><span className="block [font:var(--type-small)] text-muted">{item?.reason ?? service.description}</span></span>
              </label>;
            })}
          </fieldset>
        ) : null}
        <button type="submit" className="h-(--control-h-md) rounded-md bg-action px-5 font-semibold text-on-primary">
          {selectedBase === null ? "Choose add-ons" : "Continue to groomer"}
        </button>
      </form>
    </section>
  );
};
