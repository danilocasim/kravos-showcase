"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";

import { createPetAction, updatePetAction } from "./actions";
import { initialActionResult, type ActionResult } from "../../action-result";
import type { Pet } from "../../../lib/booking/use-cases";
import { presentErrorCode } from "../../../lib/ui/error-messages";
import { Alert } from "../../../components/core/alert";
import { Button } from "../../../components/core/button";
import { IconButton } from "../../../components/core/icon-button";
import { Dialog } from "../../../components/feedback/dialog";
import { Field } from "../../../components/forms/field";
import { Input } from "../../../components/forms/input";
import { Select } from "../../../components/forms/select";
import { SubmitButton } from "../../../components/forms/submit-button";
import { Textarea } from "../../../components/forms/textarea";

export interface PetFormDialogProps {
  readonly mode: "create" | "edit";
  readonly pet?: Pet;
}

export const PetFormDialog = ({ mode, pet }: PetFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const action = mode === "edit" && pet !== undefined
    ? updatePetAction.bind(null, pet.id)
    : createPetAction;
  const [state, formAction] = useActionState(
    async (previous: ActionResult, formData: FormData) => {
      const next = await action(previous, formData);
      if (next.status === "success") setOpen(false);
      return next;
    },
    initialActionResult,
  );

  useEffect(() => {
    if (state.status === "error") {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    }
  }, [state]);

  const presentation = state.status === "error" ? presentErrorCode(state.code) : null;

  return (
    <>
      {mode === "create" ? (
        <Button iconLeft="plus" onClick={() => setOpen(true)}>Add a pet</Button>
      ) : (
        <IconButton icon="pencil" label={`Edit ${pet?.name ?? "pet"}`} onClick={() => setOpen(true)} />
      )}
      <form ref={formRef} id={formId} action={formAction} noValidate>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={mode === "create" ? "Add a pet" : `Edit ${pet?.name ?? "pet"}`}
        description="Dogs only for now. You can edit any of this later."
        width="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <SubmitButton pendingLabel="Saving…">
              {mode === "create" ? "Save pet" : "Save changes"}
            </SubmitButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {presentation !== null ? (
            <Alert tone="danger" title={presentation.title} code={presentation.code} className="sm:col-span-2">
              {presentation.body}
            </Alert>
          ) : null}
          <Field label="Name" htmlFor={`${formId}-name`} required error={state.status === "error" ? state.fieldErrors?.name : undefined}>
            <Input name="name" defaultValue={pet?.name ?? ""} placeholder="Biscuit" />
          </Field>
          <Field label="Breed" htmlFor={`${formId}-breed`} required error={state.status === "error" ? state.fieldErrors?.breed : undefined}>
            <Input name="breed" defaultValue={pet?.breed ?? ""} placeholder="Cockapoo" />
          </Field>
          <Field label="Size" htmlFor={`${formId}-size`} required error={state.status === "error" ? state.fieldErrors?.size : undefined}>
            <Select
              name="size"
              defaultValue={pet?.size ?? ""}
              placeholder="Select a size"
              options={[
                { value: "SMALL", label: "Small" },
                { value: "MEDIUM", label: "Medium" },
                { value: "LARGE", label: "Large" },
              ]}
            />
          </Field>
          <Field label="Age in years" htmlFor={`${formId}-ageYears`} required error={state.status === "error" ? state.fieldErrors?.ageYears : undefined}>
            <Input name="ageYears" type="number" min={0} max={30} step={1} defaultValue={pet?.ageYears ?? ""} placeholder="3" />
          </Field>
          <Field label="Temperament" htmlFor={`${formId}-temperament`} optionalLabel error={state.status === "error" ? state.fieldErrors?.temperament : undefined} className="sm:col-span-2">
            <Input name="temperament" defaultValue={pet?.temperament ?? ""} placeholder="Calm, nervous with clippers…" />
          </Field>
          <Field label="Coat condition" htmlFor={`${formId}-coatCondition`} optionalLabel error={state.status === "error" ? state.fieldErrors?.coatCondition : undefined} className="sm:col-span-2">
            <Input name="coatCondition" defaultValue={pet?.coatCondition ?? ""} placeholder="Matting, shedding, dry coat…" />
          </Field>
          <Field label="Allergies" htmlFor={`${formId}-allergies`} optionalLabel error={state.status === "error" ? state.fieldErrors?.allergies : undefined} className="sm:col-span-2">
            <Input name="allergies" defaultValue={pet?.allergies ?? ""} placeholder="Products or ingredients to avoid" />
          </Field>
          <Field label="Notes for the groomer" htmlFor={`${formId}-notes`} optionalLabel error={state.status === "error" ? state.fieldErrors?.notes : undefined} className="sm:col-span-2">
            <Textarea name="notes" rows={3} defaultValue={pet?.notes ?? ""} />
          </Field>
        </div>
      </Dialog>
      </form>
    </>
  );
};
