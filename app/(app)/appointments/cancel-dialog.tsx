"use client";

import { useActionState, useState } from "react";

import { cancelAppointmentAction } from "./actions";
import { initialActionResult, type ActionResult } from "../../action-result";
import { presentErrorCode } from "../../../lib/ui/error-messages";
import { Alert } from "../../../components/core/alert";
import { Button } from "../../../components/core/button";
import { Dialog } from "../../../components/feedback/dialog";
import { SubmitButton } from "../../../components/forms/submit-button";

export const CancelDialog = ({ appointmentId, description }: { readonly appointmentId: string; readonly description: string }) => {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState(() => crypto.randomUUID());
  const action = cancelAppointmentAction.bind(null, appointmentId, intent);
  const [result, formAction] = useActionState(
    async (previous: ActionResult, formData: FormData) => {
      const next = await action(previous, formData);
      if (next.status === "success") {
        setOpen(false);
        setIntent(crypto.randomUUID());
      }
      return next;
    },
    initialActionResult,
  );
  const presentation = result.status === "error" ? presentErrorCode(result.code) : null;

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>Cancel</Button>
      <form id={`cancel-${appointmentId}`} action={formAction}>
      <Dialog open={open} onClose={() => setOpen(false)} tone="danger" title="Cancel this appointment?" description={description} footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Keep it</Button><SubmitButton variant="danger" pendingLabel="Cancelling…">Cancel appointment</SubmitButton></>}>
        <div>
          {presentation === null ? <Alert tone="warning" title="This cannot be undone">You can always book a new visit — the same time may not still be free.</Alert> : <Alert tone="danger" title={presentation.title} code={presentation.code}>{presentation.body}</Alert>}
        </div>
      </Dialog>
      </form>
    </>
  );
};
