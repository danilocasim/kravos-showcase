"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { confirmAppointmentAction } from "../actions";
import { initialActionResult } from "../../../action-result";
import { wizardQuery, type WizardState } from "../../../../lib/ui/booking/wizard-state";
import { Alert } from "../../../../components/core/alert";
import { SubmitButton } from "../../../../components/forms/submit-button";
import { presentErrorCode } from "../../../../lib/ui/error-messages";

export const ReviewStep = ({ state, selectedServiceIds, freshIntent }: { readonly state: WizardState; readonly selectedServiceIds: ReadonlyArray<string>; readonly freshIntent: string }) => {
  const [agreed, setAgreed] = useState(false);
  const [result, action] = useActionState(confirmAppointmentAction, initialActionResult);
  const presentation = result.status === "error" ? presentErrorCode(result.code) : null;
  return (
    <section aria-labelledby="review-step-title">
      <h1 id="review-step-title" className="[font:var(--type-h2)] tracking-tight text-heading">Review and confirm</h1>
      <p className="mt-1 mb-5 text-muted">Nothing is booked until you confirm below.</p>
      {presentation !== null ? <Alert tone="danger" title={presentation.title} code={presentation.code} className="mb-4">{presentation.body}{result.status === "error" && ["IDEMPOTENCY_KEY_EXPIRED", "IDEMPOTENCY_KEY_REUSED"].includes(result.code) ? <Link href={`/book?${wizardQuery(state, { intent: freshIntent, step: "review" })}`} className="mt-3 block font-semibold text-link underline">Try again with a fresh booking request</Link> : null}</Alert> : null}
      <form action={action} className="grid gap-4">
        <input type="hidden" name="intent" value={state.intent ?? ""} /><input type="hidden" name="petId" value={state.petId ?? ""} /><input type="hidden" name="groomerId" value={state.groomerId ?? ""} /><input type="hidden" name="startsAt" value={state.startsAt ?? ""} /><input type="hidden" name="startsOn" value={state.startsOn ?? ""} /><input type="hidden" name="endsOn" value={state.endsOn ?? ""} />
        {selectedServiceIds.map((id) => <input key={id} type="hidden" name="selectedServiceId" value={id} />)}
        <label className="flex gap-3 rounded-lg border border-subtle-border bg-card p-4"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1 size-5 accent-spruce-700" /><span><strong className="block text-heading">I confirm these appointment details</strong><span className="text-sm text-muted">I understand changes are available online until 24 hours before.</span></span></label>
        <SubmitButton variant="accent" size="lg" disabled={!agreed} pendingLabel="Confirming…">Confirm booking</SubmitButton>
      </form>
    </section>
  );
};
