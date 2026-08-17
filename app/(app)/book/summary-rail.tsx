import type { Groomer, Pet, ResolvedServiceSelection } from "../../../lib/booking/use-cases";
import { buildBookingSummary } from "../../../lib/ui/booking/summary";
import { Card } from "../../../components/core/card";
import { formatAppointmentInstant } from "../../../lib/ui/format/datetime";

export const SummaryRail = ({
  pet,
  selection,
  groomer,
  startsAt,
}: {
  readonly pet: Pet | null;
  readonly selection: ResolvedServiceSelection | null;
  readonly groomer: Groomer | null;
  readonly startsAt: string | null;
}) => {
  const totals = selection === null ? null : buildBookingSummary(selection);

  return (
    <>
    <Card as="aside" padding="md" className="h-fit lg:sticky lg:top-6">
      <h2 className="[font:var(--type-h3)] tracking-tight text-heading">Your visit</h2>
      <dl className="mt-4 grid gap-3 [font:var(--type-small)]">
        <div><dt className="text-subtle">Pet</dt><dd className="font-semibold text-heading">{pet?.name ?? "Not chosen"}</dd></div>
        <div><dt className="text-subtle">Services</dt><dd className="text-body">{selection?.services.map((service) => service.name).join(", ") ?? "Not chosen"}</dd></div>
        <div><dt className="text-subtle">Groomer</dt><dd className="text-body">{groomer?.displayName ?? "Any available"}</dd></div>
        {startsAt !== null ? <div><dt className="text-subtle">Time</dt><dd className="text-body">{formatAppointmentInstant(startsAt).dateLabel}, {formatAppointmentInstant(startsAt).timeLabel}</dd></div> : null}
      </dl>
      {totals !== null ? (
        <div className="mt-5 flex items-end justify-between border-t border-subtle-border pt-4">
          <div><p className="[font:var(--type-caption)] text-subtle">Duration</p><p className="font-semibold text-heading">{totals.durationLabel}</p></div>
          <div className="text-right"><p className="[font:var(--type-caption)] text-subtle">Subtotal</p><p className="[font:var(--type-h3)] text-heading">{totals.subtotalLabel}</p></div>
        </div>
      ) : null}
    </Card>
    {totals !== null ? (
      <div role="status" aria-label={`Current subtotal ${totals.subtotalLabel}`} className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-subtle-border bg-card px-4 py-3 shadow-overlay lg:hidden">
        <div><p className="[font:var(--type-caption)] text-subtle">Duration</p><p className="font-semibold text-heading">{totals.durationLabel}</p></div>
        <div className="text-right"><p className="[font:var(--type-caption)] text-subtle">Subtotal</p><p className="[font:var(--type-h3)] text-heading">{totals.subtotalLabel}</p></div>
      </div>
    ) : null}
    </>
  );
};
