import { Icon } from "../core/icon";
import { MarketingLink } from "./marketing-link";

const trustPoints = ["Dogs only", "15-minute cleanup buffer", "Changes up to 24 hours"];

/** First-read marketing statement and a compact preview of the salon experience. */
export function LandingHero() {
  return (
    <section className="border-b border-subtle-border bg-page-alt">
      <div className="mx-auto grid max-w-(--container-wide) items-stretch lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="flex flex-col justify-center px-6 py-14 sm:px-10 sm:py-20 lg:min-h-[640px] lg:px-12 xl:px-16">
          <p className="mb-5 [font:var(--type-overline)] tracking-(--tracking-caps) text-spruce-700 uppercase">
            Court Street · Brooklyn
          </p>
          <h1 className="max-w-3xl [font:var(--type-display)] text-heading text-[2.75rem] leading-[1] tracking-tight sm:text-6xl lg:text-7xl">
            Calm grooming for Brooklyn dogs.
          </h1>
          <p className="mt-6 max-w-2xl [font:var(--type-body-lg)] leading-relaxed text-body sm:mt-7">
            Thoughtful bath, coat, nail, and puppy care with real appointment
            times and a quieter, clearly organized visit from start to finish.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <MarketingLink href="/sign-up" icon="arrow-right">
              Book a visit
            </MarketingLink>
            <MarketingLink href="#services" variant="secondary">
              Explore services
            </MarketingLink>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-subtle-border pt-5" aria-label="Booking facts">
            {trustPoints.map((point) => (
              <li key={point} className="inline-flex items-center gap-2 [font:var(--type-small)] text-muted">
                <Icon name="check" size={14} className="text-spruce-700" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center gap-8 border-t border-spruce-800 bg-spruce-950 px-6 py-12 text-sand-50 sm:px-10 sm:py-14 lg:border-t-0 lg:border-l lg:px-12 lg:py-20">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="[font:var(--type-overline)] tracking-(--tracking-caps) text-apricot-300 uppercase">
                A calmer visit
              </p>
              <h2 className="mt-2 max-w-sm [font:var(--type-h2)] tracking-tight text-sand-50">
                Care that follows their pace.
              </h2>
            </div>
            <Icon name="dog" size={30} className="mt-1 flex-none text-apricot-300" />
          </div>

          <ol className="border-t border-spruce-800">
            {[
              ["01", "Share coat and temperament notes"],
              ["02", "Choose a qualified groomer and real time"],
              ["03", "Review every detail before confirming"],
            ].map(([number, label]) => (
              <li key={number} className="flex items-baseline gap-4 border-b border-spruce-800 py-4">
                <span className="font-mono text-xs text-apricot-300">{number}</span>
                <span className="[font:var(--type-small)] text-spruce-100">{label}</span>
              </li>
            ))}
          </ol>

          <p className="inline-flex items-center gap-2 [font:var(--type-caption)] text-spruce-200">
            <Icon name="sparkles" size={14} className="flex-none text-apricot-300" />
            Ask the grooming guide for help before signing in.
          </p>
        </div>
      </div>
    </section>
  );
}
