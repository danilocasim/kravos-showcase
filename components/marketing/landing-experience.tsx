import { Icon, type IconName } from "../core/icon";

const moments = [
  {
    eyebrow: "Before",
    title: "Notes that travel with your dog",
    body: "Save coat condition, allergies, temperament, and handling notes once so every visit starts with context.",
    icon: "notebook-pen" as IconName,
    tone: "bg-sand-150 text-spruce-900",
  },
  {
    eyebrow: "During",
    title: "A buffer after every appointment",
    body: "We reserve fifteen quiet minutes after service time for cleanup rather than rushing the next dog in.",
    icon: "clock" as IconName,
    tone: "bg-spruce-800 text-sand-50",
  },
  {
    eyebrow: "Between visits",
    title: "Practical grooming guidance",
    body: "Our public guide can explain coat care for dogs and cats, then help dog parents choose a salon service.",
    icon: "sparkles" as IconName,
    tone: "bg-apricot-100 text-spruce-950",
  },
] as const;

const groomers = [
  ["MC", "Maya Chen", "Senior groomer · all services"],
  ["SM", "Sofia Morales", "Small and medium dog specialist"],
  ["LP", "Liam Patel", "Bath, nail, and de-shedding care"],
] as const;

/** Visual visit sequence and the verified starter grooming team. */
export function LandingExperience() {
  return (
    <>
      <section id="approach" aria-labelledby="approach-title" className="scroll-mt-28 bg-page-alt px-6 py-16 sm:px-10 md:scroll-mt-20 lg:py-24">
        <div className="mx-auto max-w-(--container-wide)">
          <div className="max-w-2xl">
            <p className="[font:var(--type-overline)] tracking-(--tracking-caps) text-spruce-700 uppercase">Our approach</p>
            <h2 id="approach-title" className="mt-3 [font:var(--type-display)] text-3xl leading-tight tracking-tight text-heading sm:text-4xl lg:text-5xl">
              Three moments. One unhurried experience.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-[1.15fr_0.85fr] lg:mt-12">
            <article className={`flex flex-col justify-between gap-8 rounded-lg p-6 sm:p-9 md:min-h-80 ${moments[0].tone}`}>
              <div className="flex items-start justify-between gap-4">
                <span className="[font:var(--type-overline)] tracking-(--tracking-caps) uppercase opacity-70">{moments[0].eyebrow}</span>
                <Icon name={moments[0].icon} size={24} className="flex-none" />
              </div>
              <div className="max-w-xl">
                <h3 className="[font:var(--type-display)] text-2xl leading-tight tracking-tight text-current sm:text-3xl">{moments[0].title}</h3>
                <p className="mt-3 max-w-lg [font:var(--type-body)] leading-relaxed opacity-80 sm:mt-4">{moments[0].body}</p>
              </div>
            </article>

            <div className="grid gap-4">
              {moments.slice(1).map((moment) => (
                <article key={moment.title} className={`flex flex-col justify-between gap-6 rounded-lg p-6 sm:p-7 md:min-h-44 ${moment.tone}`}>
                  <div className="flex items-start justify-between gap-4">
                    <span className="[font:var(--type-overline)] tracking-(--tracking-caps) uppercase opacity-70">{moment.eyebrow}</span>
                    <Icon name={moment.icon} size={20} className="flex-none" />
                  </div>
                  <div>
                    <h3 className="[font:var(--type-h3)] tracking-tight text-current">{moment.title}</h3>
                    <p className="mt-2 [font:var(--type-small)] leading-relaxed opacity-80">{moment.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="groomers" aria-labelledby="groomers-title" className="scroll-mt-28 border-y border-subtle-border bg-card px-6 py-16 sm:px-10 md:scroll-mt-20 lg:py-20">
        <div className="mx-auto grid max-w-(--container-wide) gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
          <div>
            <p className="[font:var(--type-overline)] tracking-(--tracking-caps) text-spruce-700 uppercase">Groomers</p>
            <h2 id="groomers-title" className="mt-3 [font:var(--type-display)] text-3xl leading-tight tracking-tight text-heading sm:text-4xl">
              Familiar hands, matched to the service.
            </h2>
            <p className="mt-4 [font:var(--type-body)] leading-relaxed text-muted sm:mt-5">
              Live booking only shows groomers qualified for every service you select.
            </p>
          </div>

          <ul className="divide-y divide-subtle-border border-y border-subtle-border">
            {groomers.map(([initials, name, specialty]) => (
              <li key={name} className="flex items-center gap-4 py-5">
                <span className="grid size-11 flex-none place-items-center rounded-full bg-spruce-100 [font:var(--type-caption)] font-bold text-spruce-800">
                  {initials}
                </span>
                <div>
                  <h3 className="[font:var(--type-body-strong)] text-heading">{name}</h3>
                  <p className="mt-1 [font:var(--type-small)] text-muted">{specialty}</p>
                </div>
                <Icon name="badge-check" size={19} className="ml-auto text-spruce-700" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
