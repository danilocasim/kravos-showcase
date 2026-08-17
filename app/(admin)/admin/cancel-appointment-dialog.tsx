"use client";

import { useActionState, useState } from "react";

import { cancelAdminAppointmentAction } from "./actions";
import { initialActionResult, type ActionResult } from "../../action-result";
import { presentErrorCode } from "../../../lib/ui/error-messages";
import { Alert } from "../../../components/core/alert";
import { Button } from "../../../components/core/button";
import { Dialog } from "../../../components/feedback/dialog";
import { SubmitButton } from "../../../components/forms/submit-button";

export const CancelAdminAppointmentDialog = ({
  appointmentId,
  description,
  label,
}: {
  readonly appointmentId: string;
  readonly description: string;
  readonly label: string;
}) => {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState(() => crypto.randomUUID());
  const boundAction = cancelAdminAppointmentAction.bind(null, appointmentId, intent);
  const [result, action] = useActionState(
    async (previous: ActionResult, formData: FormData) => {
      const next = await boundAction(previous, formData);
      if (next.status === "success") {
        setOpen(false);
        setIntent(crypto.randomUUID());
      }
      return next;
    },
    initialActionResult,
  );
  const error = result.status === "error" ? presentErrorCode(result.code) : null;

  return (
    <>
      <Button variant="ghost" size="sm" iconLeft="circle-x" onClick={() => setOpen(true)} aria-label={label} title={label} className="w-full text-danger-700 sm:w-auto">
        Cancel
      </Button>
      <form action={action}>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          tone="danger"
          title="Cancel this appointment?"
          description={description}
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>Keep it</Button>
              <SubmitButton variant="danger" pendingLabel="Cancelling…">Cancel appointment</SubmitButton>
            </>
          }
        >
          {error === null ? (
            <Alert tone="warning" title="The customer is not notified automatically">
              Call them if the visit is within 24 hours. This override is recorded against the appointment.
            </Alert>
          ) : (
            <Alert tone="danger" title={error.title} code={error.code}>{error.body}</Alert>
          )}
        </Dialog>
      </form>
    </>
  );
};
