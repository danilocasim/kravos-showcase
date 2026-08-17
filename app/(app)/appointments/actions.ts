"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { toActionError } from "../../action-error";
import type { ActionResult } from "../../action-result";
import { createIdempotencyKey } from "../../../lib/booking/idempotency-key";
import { createSupabaseBookingUseCases } from "../../../lib/booking/server";

const cancelSchema = z.object({ appointmentId: z.guid(), intent: z.guid() });

export async function cancelAppointmentAction(
  appointmentId: string,
  intent: string,
  _previous: ActionResult,
  _formData: FormData,
): Promise<ActionResult> {
  void _previous;
  void _formData;
  const parsed = cancelSchema.safeParse({ appointmentId, intent });
  if (!parsed.success) {
    return { status: "error", code: "INVALID_APPOINTMENT_INPUT", message: "Check the appointment and try again." };
  }

  try {
    const useCases = await createSupabaseBookingUseCases();
    await useCases.cancelAppointment({
      appointmentId: parsed.data.appointmentId,
      idempotencyKey: createIdempotencyKey("cancel", parsed.data.intent, {
        appointmentId: parsed.data.appointmentId,
      }),
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/appointments");
  return { status: "success" };
}
