"use client";

import { useActionState } from "react";

import { rescheduleAppointmentAction } from "./actions";
import { initialActionResult } from "../../../../action-result";
import type { AvailabilityDay } from "../../../../../lib/ui/booking/slot-days";
import { presentErrorCode } from "../../../../../lib/ui/error-messages";
import { Alert } from "../../../../../components/core/alert";
import { SubmitButton } from "../../../../../components/forms/submit-button";

export const RescheduleForm = ({ appointmentId, intent, groomerId, selectedServiceIds, days }: { readonly appointmentId: string; readonly intent: string; readonly groomerId: string; readonly selectedServiceIds: ReadonlyArray<string>; readonly days: ReadonlyArray<AvailabilityDay> }) => {
  const [result, action] = useActionState(rescheduleAppointmentAction.bind(null, appointmentId, intent, groomerId, selectedServiceIds), initialActionResult);
  const presentation = result.status === "error" ? presentErrorCode(result.code) : null;
  return (
    <form action={action} className="grid gap-5">
      {presentation !== null ? <Alert tone="danger" title={presentation.title} code={presentation.code}>{presentation.body}</Alert> : null}
      {days.map((day) => <fieldset key={day.date}><legend className="mb-2 font-semibold text-heading">{day.label}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{day.slots.map((slot) => <label key={slot.startsAt} className="cursor-pointer rounded-md border border-slot-free-border bg-card p-3 text-center has-[:checked]:border-action has-[:checked]:bg-primary-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus"><input type="radio" className="sr-only" name="startsAt" value={slot.startsAt} required /><span className="font-semibold">{slot.timeLabel}</span></label>)}</div></fieldset>)}
      <SubmitButton disabled={days.length === 0} pendingLabel="Rescheduling…">Save new time</SubmitButton>
    </form>
  );
};
