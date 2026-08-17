"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";

import { toActionError } from "../../action-error";
import type { ActionResult } from "../../action-result";
import { createIdempotencyKey } from "../../../lib/booking/idempotency-key";
import { createSupabaseBookingUseCases } from "../../../lib/booking/server";
import { presentErrorCode } from "../../../lib/ui/error-messages";
import {
  parseWizardQuery,
  parseWizardState,
  wizardQuery,
} from "../../../lib/ui/booking/wizard-state";

const slotSchema = z.object({
  startsAt: z.string().datetime({ offset: true }),
  groomerId: z.guid(),
});
const bookingSchema = z.object({
  intent: z.guid(),
  petId: z.guid(),
  groomerId: z.guid(),
  startsAt: z.string().datetime({ offset: true }),
  selectedServiceIds: z.array(z.guid()).min(1).max(6),
  startsOn: z.string().date(),
  endsOn: z.string().date(),
});

export async function startBookingAction(): Promise<void> {
  redirect(`/book?intent=${randomUUID()}&step=pet`);
}

export async function selectTimeAction(formData: FormData): Promise<void> {
  const baseQuery = String(formData.get("baseQuery") ?? "");
  const rawSlot = String(formData.get("slot") ?? "");
  let slot: unknown;
  try {
    slot = JSON.parse(rawSlot);
  } catch {
    slot = null;
  }
  const parsed = slotSchema.safeParse(slot);
  if (!parsed.success) {
    redirect(`/book?${baseQuery}&error=VALIDATION_ERROR`);
  }

  const state = parseWizardQuery(baseQuery);
  redirect(
    `/book?${wizardQuery(state, {
      step: "review",
      groomerId: parsed.data.groomerId,
      startsAt: parsed.data.startsAt,
    })}`,
  );
}

const errorResult = (code: string): ActionResult => {
  const presentation = presentErrorCode(code);
  return {
    status: "error",
    code,
    message: `${presentation.title}. ${presentation.body}`,
  };
};

export async function confirmAppointmentAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = bookingSchema.safeParse({
    intent: formData.get("intent"),
    petId: formData.get("petId"),
    groomerId: formData.get("groomerId"),
    startsAt: formData.get("startsAt"),
    selectedServiceIds: formData.getAll("selectedServiceId"),
    startsOn: formData.get("startsOn"),
    endsOn: formData.get("endsOn"),
  });
  if (!parsed.success) return errorResult("INVALID_APPOINTMENT_INPUT");

  const input = {
    petId: parsed.data.petId,
    groomerId: parsed.data.groomerId,
    startsAt: parsed.data.startsAt,
    selectedServiceIds: parsed.data.selectedServiceIds,
    idempotencyKey: createIdempotencyKey("create", parsed.data.intent, parsed.data),
  };
  let appointmentId: string | null = null;
  let recoveryUrl: string | null = null;

  try {
    const useCases = await createSupabaseBookingUseCases();
    const appointment = await useCases.createAppointment(input);
    appointmentId = appointment.id;
  } catch (error) {
    const code =
      error instanceof Error &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : null;
    if (code === "SLOT_UNAVAILABLE") {
      const rawState = parseWizardState({
        intent: parsed.data.intent,
        step: "time",
        petId: parsed.data.petId,
        groomerId: parsed.data.groomerId,
        startsOn: parsed.data.startsOn,
        endsOn: parsed.data.endsOn,
      });
      recoveryUrl = `/book?${wizardQuery(rawState, {
        step: "time",
        baseServiceId: parsed.data.selectedServiceIds[0] ?? null,
        addOnServiceIds: parsed.data.selectedServiceIds.slice(1),
        startsAt: null,
      })}&error=SLOT_UNAVAILABLE`;
    } else {
      return toActionError(error);
    }
  }

  if (recoveryUrl !== null) redirect(recoveryUrl);
  if (appointmentId !== null) redirect(`/book/confirmed/${appointmentId}`);
  return errorResult("INTERNAL_SERVER_ERROR");
}
