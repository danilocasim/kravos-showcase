"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { toActionError } from "../../action-error";
import type { ActionResult } from "../../action-result";
import { createSupabaseBookingUseCases } from "../../../lib/booking/server";
import { PetUnavailableError } from "../../../lib/booking/use-cases";
import { parsePetForm } from "../../../lib/ui/pet-form";

const petIdSchema = z.guid();

const validationError = (
  fieldErrors: Readonly<Record<string, string>>,
): ActionResult => ({
  status: "error",
  code: "INVALID_PET_INPUT",
  message: "Check the highlighted pet details.",
  fieldErrors,
});

export async function createPetAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parsePetForm(formData);
  if (!parsed.ok) return validationError(parsed.fieldErrors);

  try {
    const useCases = await createSupabaseBookingUseCases();
    await useCases.createMyPet(parsed.value);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/pets");
  return { status: "success" };
}

export async function updatePetAction(
  petId: string,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = petIdSchema.safeParse(petId);
  const parsed = parsePetForm(formData);
  if (!id.success) return toActionError(new PetUnavailableError());
  if (!parsed.ok) return validationError(parsed.fieldErrors);

  try {
    const useCases = await createSupabaseBookingUseCases();
    const pet = await useCases.updateMyPet(id.data, parsed.value);
    if (pet === null) return toActionError(new PetUnavailableError());
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/pets");
  return { status: "success" };
}

export async function deletePetAction(
  petId: string,
  _previous: ActionResult,
  _formData: FormData,
): Promise<ActionResult> {
  void _previous;
  void _formData;
  const id = petIdSchema.safeParse(petId);
  if (!id.success) return toActionError(new PetUnavailableError());

  try {
    const useCases = await createSupabaseBookingUseCases();
    const deleted = await useCases.deleteMyPet(id.data);
    if (!deleted) return toActionError(new PetUnavailableError());
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/pets");
  return { status: "success" };
}
