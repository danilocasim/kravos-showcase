import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paw & Polish public concierge knowledge",
  robots: { index: false, follow: false },
};

const services = [
  ["Bath & Brush", "$55", "60 minutes", "Bath, drying, brush-out, and light tidy."],
  ["Full Groom", "$85", "90 minutes", "Bath, drying, haircut, brush-out, and nail trim."],
  ["Puppy Introduction Groom", "$45", "45 minutes", "A gentle first grooming visit for puppies up to twelve months."],
  ["Nail Trim", "$15", "15 minutes", "A standalone express visit or an add-on to Bath & Brush."],
  ["De-shedding Treatment", "$30", "30 minutes", "An add-on to Bath & Brush or Full Groom."],
] as const;

const dogGuidance = [
  ["Smooth or short coat", "Routine brushing and an occasional bath may be enough between visits. Bath & Brush is the closest Paw & Polish service when a salon reset is wanted."],
  ["Dense or double coat", "Regular brushing helps lift loose coat. Consider Bath & Brush with De-shedding Treatment during heavier seasonal shedding."],
  ["Curly, wool, long, or haircut coat", "Frequent brushing helps prevent tangles. Full Groom is the closest service when a haircut is part of the goal."],
  ["Puppy up to twelve months", "Short, positive handling sessions help build familiarity. Puppy Introduction Groom is designed as a gentle first salon visit."],
  ["Nails only", "Nail Trim can be booked as a standalone express visit. It is already included in Full Groom."],
] as const;

const safetySignals = [
  "open sores, bleeding, pus, significant swelling, or a painful wound",
  "sudden or patchy hair loss, severe redness, persistent scratching, or skin that looks inflamed",
  "strong ear odor, discharge, head tilt, loss of balance, or marked ear pain",
  "eye cloudiness, a closed eye, unequal pupils, or persistent eye discharge",
  "difficulty breathing, collapse, repeated vomiting, or any other acute distress",
] as const;

/** Crawlable source of truth for the unauthenticated grooming guide. */
export default function PublicConciergeKnowledge() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 [font:var(--type-body)] text-body">
      <header className="border-b border-strong-border pb-8">
        <p className="[font:var(--type-overline)] tracking-(--tracking-caps) text-spruce-700 uppercase">Agent knowledge source</p>
        <h1 className="mt-3 [font:var(--type-display)] text-4xl tracking-tight text-heading">Paw &amp; Polish public grooming guide</h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted">
          Current business facts and conservative grooming education for public,
          unauthenticated questions. This material is not veterinary advice.
        </p>
      </header>

      <section className="py-10" aria-labelledby="business-facts">
        <h2 id="business-facts" className="[font:var(--type-h2)] tracking-tight text-heading">Business and booking facts</h2>
        <ul className="mt-5 list-disc space-y-2 pl-6 leading-relaxed">
          <li>Paw &amp; Polish is a single-location grooming salon on Court Street in Brooklyn, New York.</li>
          <li><strong>Supported appointments: Dogs only in v1.</strong></li>
          <li>Cat guidance is educational only; Paw &amp; Polish does not currently offer cat appointments.</li>
          <li>Customer-facing times use America/New_York.</li>
          <li>Standard hours are Monday–Friday 9:00 AM–6:00 PM, Saturday 9:00 AM–4:00 PM, and Sunday closed.</li>
          <li>An authenticated customer account is required to search live availability, book, reschedule, or cancel.</li>
          <li>Customers may cancel or reschedule until 24 hours before the confirmed start. Staff should be contacted for a visit inside that cutoff.</li>
          <li>Every appointment reserves a 15-minute cleanup buffer after customer-facing service time.</li>
          <li>There are no payments, refunds, notifications, recurring bookings, memberships, waitlists, reviews, or walk-ins in v1.</li>
        </ul>
      </section>

      <section className="border-t border-subtle-border py-10" aria-labelledby="catalogue">
        <h2 id="catalogue" className="[font:var(--type-h2)] tracking-tight text-heading">Current dog-service catalogue</h2>
        <p className="mt-3 leading-relaxed text-muted">Prices and durations are fixed in v1 and do not vary by breed, coat, or size.</p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-strong-border">
                <th className="py-3 pr-4">Service</th><th className="py-3 pr-4">Price</th><th className="py-3 pr-4">Duration</th><th className="py-3">Includes</th>
              </tr>
            </thead>
            <tbody>
              {services.map(([name, price, duration, description]) => (
                <tr key={name} className="border-b border-subtle-border align-top">
                  <th className="py-4 pr-4 text-heading">{name}</th><td className="py-4 pr-4">{price}</td><td className="py-4 pr-4">{duration}</td><td className="py-4 text-muted">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="mt-8 [font:var(--type-h3)] text-heading">Compatibility rules</h3>
        <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
          <li>Select exactly one base service, except Nail Trim may be selected by itself.</li>
          <li>Bath &amp; Brush may pair with Nail Trim and/or De-shedding Treatment.</li>
          <li>Full Groom may pair with De-shedding Treatment. Nail Trim is not added because it is already included.</li>
          <li>Puppy Introduction Groom has no add-ons in the approved catalogue.</li>
          <li>Live availability and the server-calculated subtotal are authoritative.</li>
        </ul>
      </section>

      <section className="border-t border-subtle-border py-10" aria-labelledby="recommendations">
        <h2 id="recommendations" className="[font:var(--type-h2)] tracking-tight text-heading">How to suggest a dog service</h2>
        <p className="mt-3 leading-relaxed text-muted">
          Ask about age, coat type, shedding, haircut goals, matting, and comfort with handling. Suggest rather than prescribe, and explain why.
        </p>
        <dl className="mt-6 divide-y divide-subtle-border border-y border-subtle-border">
          {dogGuidance.map(([situation, guidance]) => (
            <div key={situation} className="grid gap-2 py-5 sm:grid-cols-[220px_1fr]">
              <dt className="font-semibold text-heading">{situation}</dt><dd className="leading-relaxed text-muted">{guidance}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 leading-relaxed text-muted">
          Heavy matting can be painful and may hide skin problems. Do not tell a visitor to cut a tight mat with scissors near the skin. Recommend a professional groomer, and recommend veterinary review when skin, pain, or injury concerns are present.
        </p>
      </section>

      <section className="border-t border-subtle-border py-10" aria-labelledby="home-dog-care">
        <h2 id="home-dog-care" className="[font:var(--type-h2)] tracking-tight text-heading">Conservative dog grooming education</h2>
        <ul className="mt-5 list-disc space-y-3 pl-6 leading-relaxed">
          <li>Grooming frequency depends on coat type, breed, lifestyle, and the individual dog. Avoid one universal schedule.</li>
          <li>Regular gentle brushing can remove loose coat, reduce tangles, and make it easier to notice changes in skin or coat.</li>
          <li>Use products formulated for dogs. Human shampoo and species-inappropriate products may irritate skin.</li>
          <li>Use lukewarm water, avoid spraying eyes, ears, and nose, rinse thoroughly, and dry the coat fully.</li>
          <li>Never insert swabs or tools into an ear canal. Visible redness, odor, discharge, pain, or head tilting warrants veterinary attention.</li>
          <li>Nails that click or snag may need attention, but trimming technique and the quick vary. A groomer or veterinarian can help when the owner or dog is not comfortable.</li>
          <li>Stop if the dog shows escalating fear, pain, growling, snapping, or struggling. Do not recommend restraint or forcing the session.</li>
        </ul>
      </section>

      <section className="border-t border-subtle-border py-10" aria-labelledby="cat-care">
        <h2 id="cat-care" className="[font:var(--type-h2)] tracking-tight text-heading">General cat grooming education</h2>
        <p className="mt-3 leading-relaxed text-muted"><strong>Cat guidance is educational only.</strong> It must not be presented as a Paw &amp; Polish bookable service.</p>
        <ul className="mt-5 list-disc space-y-3 pl-6 leading-relaxed">
          <li>Many cats maintain much of their own coat, but regular gentle brushing helps remove loose hair and find tangles.</li>
          <li>Short-haired cats may benefit from weekly brushing. Long-haired cats often need attention every few days. Adjust to the individual coat and tolerance.</li>
          <li>Routine baths are usually unnecessary unless a cat is dirty, sticky, or exposed to something that needs safe removal.</li>
          <li>Use cat-formulated products only. Ingredients safe for one species may not be safe for another.</li>
          <li>Keep sessions short and calm. If a cat fights grooming and injury is possible, stop and contact a cat-experienced groomer or veterinarian.</li>
          <li>Do not cut mats close to feline skin with scissors. Cat skin is thin and can be injured easily.</li>
          <li>Excessive licking, bald patches, marked dandruff, redness, wounds, parasites, or sudden coat changes should be assessed by a veterinarian.</li>
        </ul>
      </section>

      <section className="border-t border-subtle-border py-10" aria-labelledby="safety-boundary">
        <h2 id="safety-boundary" className="[font:var(--type-h2)] tracking-tight text-heading">Safety and medical boundary</h2>
        <p className="mt-3 leading-relaxed text-muted">
          The public guide may provide general grooming education. It must not diagnose, recommend medication, interpret symptoms, promise that grooming will treat a condition, or replace a veterinarian.
        </p>
        <p className="mt-5 font-semibold text-heading">Advise veterinary care instead of grooming instructions when a visitor reports:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
          {safetySignals.map((signal) => <li key={signal}>{signal}</li>)}
        </ul>
        <p className="mt-5 leading-relaxed text-muted">
          For immediate distress or a suspected emergency, tell the visitor to contact a veterinarian or emergency veterinary service now. Do not attempt remote triage.
        </p>
      </section>

      <section className="border-t border-subtle-border py-10" aria-labelledby="team">
        <h2 id="team" className="[font:var(--type-h2)] tracking-tight text-heading">Grooming team</h2>
        <ul className="mt-5 space-y-3 leading-relaxed">
          <li><strong>Maya Chen:</strong> senior groomer qualified for all current services.</li>
          <li><strong>Sofia Morales:</strong> specializes in small and medium dogs; qualified for Bath &amp; Brush, Full Groom, Puppy Introduction Groom, and Nail Trim.</li>
          <li><strong>Liam Patel:</strong> focused on Bath &amp; Brush, Nail Trim, and De-shedding Treatment.</li>
        </ul>
      </section>

      <section className="border-t border-subtle-border pt-10" aria-labelledby="references">
        <h2 id="references" className="[font:var(--type-h2)] tracking-tight text-heading">External educational references</h2>
        <p className="mt-3 leading-relaxed text-muted">Business facts above are Paw &amp; Polish source-of-truth content. General education was conservatively summarized with reference to:</p>
        <ul className="mt-4 list-disc space-y-2 pl-6">
          <li><a className="text-link underline" href="https://www.aspca.org/pet-care/dog-care/dog-grooming-tips">ASPCA dog grooming tips</a></li>
          <li><a className="text-link underline" href="https://www.aspca.org/pet-care/cat-care/cat-grooming-tips">ASPCA cat grooming tips</a></li>
          <li><a className="text-link underline" href="https://www.akc.org/expert-advice/health/how-to-groom-a-dog/">American Kennel Club: how to groom a dog at home</a></li>
        </ul>
      </section>
    </main>
  );
}
