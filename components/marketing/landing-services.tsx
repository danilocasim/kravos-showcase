import { Icon, type IconName } from "../core/icon";
import { MarketingLink } from "./marketing-link";

const services = [
  {
    name: "Bath & Brush",
    description: "Bath, drying, brush-out, and a light tidy for a clean, comfortable reset.",
    duration: "60 min",
    price: "$55",
    icon: "droplets" as IconName,
  },
  {
    name: "Full Groom",
    description: "Bath, drying, haircut, brush-out, and nail trim in one complete visit.",
    duration: "90 min",
    price: "$85",
    icon: "scissors" as IconName,
  },
  {
    name: "Puppy Introduction",
    description: "A gentle first grooming visit for puppies up to twelve months old.",
    duration: "45 min",
    price: "$45",
    icon: "heart" as IconName,
  },
] as const;

/** Public catalogue summary; server data remains authoritative during booking. */
export function LandingServices() {
  return (
    <section id="services" aria-labelledby="services-title" className="scroll-mt-28 bg-page px-6 py-16 sm:px-10 md:scroll-mt-20 lg:py-24">
      <div className="mx-auto max-w-(--container-wide)">
        <div className="grid gap-6 border-b border-strong-border pb-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-8">
          <div>
            <p className="[font:var(--type-overline)] tracking-(--tracking-caps) text-spruce-700 uppercase">Services</p>
            <h2 id="services-title" className="mt-3 max-w-xl [font:var(--type-display)] text-3xl leading-tight tracking-tight text-heading sm:text-4xl lg:text-5xl">
              The right amount of care, clearly priced.
            </h2>
          </div>
          <p className="max-w-2xl [font:var(--type-body)] leading-relaxed text-muted lg:justify-self-end">
            Choose one base service, then add compatible coat care. Your final
            duration and subtotal are always calculated from the live catalogue
            before you confirm.
          </p>
        </div>

        <div className="divide-y divide-subtle-border">
          {services.map((service, index) => (
            <article
              key={service.name}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 py-6 sm:gap-x-6 sm:py-8"
            >
              <span className="grid size-11 place-items-center rounded-md border border-spruce-200 bg-primary-soft text-spruce-800 sm:size-12">
                <Icon name={service.icon} size={21} />
              </span>
              <div className="min-w-0">
                <p className="mb-0.5 font-mono text-xs text-subtle">0{index + 1}</p>
                <h3 className="[font:var(--type-h3)] tracking-tight text-heading">{service.name}</h3>
              </div>
              <div className="text-right">
                <p className="[font:var(--type-h3)] text-heading">{service.price}</p>
                <p className="mt-0.5 [font:var(--type-caption)] text-muted">{service.duration}</p>
              </div>
              <p className="col-span-3 max-w-xl [font:var(--type-small)] leading-relaxed text-muted sm:col-span-1 sm:col-start-2">
                {service.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-lg border border-apricot-200 bg-accent-soft p-6 sm:flex-row sm:items-center">
          <div>
            <p className="[font:var(--type-body-strong)] text-heading">Need a little more?</p>
            <p className="mt-1 [font:var(--type-small)] text-muted">
              Nail Trim is $15. De-shedding Treatment is $30 and pairs with Bath &amp; Brush or Full Groom.
            </p>
          </div>
          <MarketingLink href="/sign-up" className="h-(--control-h-md) flex-none px-4 text-sm">
            Book a visit
          </MarketingLink>
        </div>
      </div>
    </section>
  );
}
