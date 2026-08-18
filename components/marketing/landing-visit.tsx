import Link from "next/link";

import { Icon } from "../core/icon";
import { Logotype } from "../core/logotype";
import { MarketingLink } from "./marketing-link";

const faqs = [
  ["Do you groom cats?", "Paw & Polish appointments are for dogs only in this release. Our public guide can still share general cat coat-care education, but it will never imply that cat appointments are available."],
  ["Can I change an appointment?", "Customers can reschedule or cancel until 24 hours before the confirmed start. Sign in to manage an existing visit."],
  ["How do I choose a service?", "Bath & Brush suits routine cleaning and brush-out care. Full Groom adds a haircut and nail trim. Puppy Introduction is a shorter first visit for puppies up to twelve months."],
] as const;

/** Visit details, FAQs, and final booking call to action. */
export function LandingVisit() {
  return (
    <>
      <section id="visit" aria-labelledby="visit-title" className="scroll-mt-28 bg-page px-6 py-16 sm:px-10 md:scroll-mt-20 lg:py-24">
        <div className="mx-auto grid max-w-(--container-wide) gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="[font:var(--type-overline)] tracking-(--tracking-caps) text-spruce-700 uppercase">Plan a visit</p>
            <h2 id="visit-title" className="mt-3 max-w-xl [font:var(--type-display)] text-3xl leading-tight tracking-tight text-heading sm:text-4xl lg:text-5xl">
              Court Street care, six days a week.
            </h2>
            <div className="mt-8 grid gap-6 border-t border-subtle-border pt-6 sm:grid-cols-2">
              <div>
                <p className="inline-flex items-center gap-2 [font:var(--type-body-strong)] text-heading">
                  <Icon name="map-pin" size={17} /> Location
                </p>
                <p className="mt-2 [font:var(--type-small)] leading-relaxed text-muted">Court Street<br />Brooklyn, New York</p>
              </div>
              <div>
                <p className="inline-flex items-center gap-2 [font:var(--type-body-strong)] text-heading">
                  <Icon name="clock" size={17} /> Hours
                </p>
                <p className="mt-2 [font:var(--type-small)] leading-relaxed text-muted">Mon–Fri, 9–6<br />Saturday, 9–4 · Sunday closed</p>
              </div>
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <MarketingLink href="/sign-up" icon="calendar-check">Book a visit</MarketingLink>
              <MarketingLink href="/sign-in" variant="secondary">Manage a booking</MarketingLink>
            </div>
          </div>

          <div>
            <h2 className="[font:var(--type-h2)] tracking-tight text-heading">Good to know</h2>
            <div className="mt-5 divide-y divide-subtle-border border-y border-subtle-border">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [font:var(--type-body-strong)] text-heading focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus">
                    {question}
                    <Icon name="plus" size={18} className="flex-none transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 max-w-xl pr-8 [font:var(--type-small)] leading-relaxed text-muted">{answer}</p>
                </details>
              ))}
            </div>
            <p className="mt-5 [font:var(--type-caption)] leading-relaxed text-subtle">
              Have a general grooming question? Open the Paw &amp; Polish guide in the lower-right corner. Account and appointment details stay in the signed-in concierge.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-spruce-800 bg-spruce-950 px-6 py-10 text-spruce-200 sm:px-10">
        <div className="mx-auto flex max-w-(--container-wide) flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Logotype tone="inverse" size="md" />
            <p className="mt-4 max-w-md [font:var(--type-small)] leading-relaxed">A calmer way to plan dog grooming in Brooklyn.</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 [font:var(--type-caption)]">
            <Link href="#services" className="hover:text-sand-50">Services</Link>
            <Link href="#groomers" className="hover:text-sand-50">Groomers</Link>
            <Link href="/sign-in" prefetch={false} className="hover:text-sand-50">Customer sign in</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
