"use client";

import { useActionState, useId, useState } from "react";

import { deletePetAction } from "./actions";
import { initialActionResult, type ActionResult } from "../../action-result";
import type { Pet } from "../../../lib/booking/use-cases";
import { presentErrorCode } from "../../../lib/ui/error-messages";
import { Alert } from "../../../components/core/alert";
import { Button } from "../../../components/core/button";
import { IconButton } from "../../../components/core/icon-button";
import { Dialog } from "../../../components/feedback/dialog";
import { SubmitButton } from "../../../components/forms/submit-button";

export const DeletePetDialog = ({ pet }: { readonly pet: Pet }) => {
  const [open, setOpen] = useState(false);
  const formId = useId();
  const deleteAction = deletePetAction.bind(null, pet.id);
  const [state, action] = useActionState(
    async (previous: ActionResult, formData: FormData) => {
      const next = await deleteAction(previous, formData);
      if (next.status === "success") setOpen(false);
      return next;
    },
    initialActionResult,
  );

  const presentation = state.status === "error" ? presentErrorCode(state.code) : null;

  return (
    <>
      <IconButton icon="trash-2" label={`Delete ${pet.name}`} variant="danger" onClick={() => setOpen(true)} />
      <form id={formId} action={action}>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        tone="danger"
        title={`Remove ${pet.name}?`}
        description="Pets with appointment history are kept so your visit records stay complete."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Keep pet</Button>
            <SubmitButton variant="danger" pendingLabel="Removing…">Remove pet</SubmitButton>
          </>
        }
      >
        <div>
          {presentation !== null ? (
            <Alert tone="danger" title={presentation.title} code={presentation.code}>
              {presentation.body}
            </Alert>
          ) : (
            <Alert tone="warning" title="This cannot be undone">
              You can add the pet again later, but saved notes will be gone.
            </Alert>
          )}
        </div>
      </Dialog>
      </form>
    </>
  );
};
