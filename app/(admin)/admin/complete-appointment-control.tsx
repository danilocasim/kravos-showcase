"use client";

import { useActionState } from "react";

import { completeAdminAppointmentAction } from "./actions";
import { initialActionResult } from "../../action-result";
import { presentErrorCode } from "../../../lib/ui/error-messages";
import { SubmitButton } from "../../../components/forms/submit-button";

export const CompleteAppointmentControl = ({
  appointmentId,
  label,
}: {
  readonly appointmentId: string;
  readonly label: string;
}) => {
  const [result, action] = useActionState(
    completeAdminAppointmentAction.bind(null, appointmentId),
    initialActionResult,
  );
  const error = result.status === "error" ? presentErrorCode(result.code) : null;
  return (
    <div className="grid gap-1">
      <form action={action}>
        <SubmitButton variant="secondary" size="sm" iconLeft="badge-check" pendingLabel="Completing…" aria-label={label} title={label} className="w-full sm:w-auto">
          Complete
        </SubmitButton>
      </form>
      {error !== null ? <p role="alert" className="max-w-52 [font:var(--type-caption)] text-danger-700">{error.title}. {error.body}</p> : null}
    </div>
  );
};
