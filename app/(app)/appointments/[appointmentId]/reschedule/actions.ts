"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { toActionError } from "../../../../action-error";
import type { ActionResult } from "../../../../action-result";
import { createIdempotencyKey } from "../../../../../lib/booking/idempotency-key";
import { createSupabaseBookingUseCases } from "../../../../../lib/booking/server";

const inputSchema = z.object({
  appointmentId: z.guid(),
  intent: z.guid(),
  groomerId: z.guid(),
  startsAt: z.string().datetime({ offset: true }),
  selectedServiceIds: z.array(z.guid()).min(1).max(6),
});

export async function rescheduleAppointmentAction(
  appointmentId: string,
  intent: string,
  groomerId: string,
  selectedServiceIds: ReadonlyArray<string>,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = inputSchema.safeParse({
    appointmentId,
    intent,
    groomerId,
    selectedServiceIds,
    startsAt: formData.get("startsAt"),
  });
  if (!parsed.success) return { status: "error", code: "INVALID_APPOINTMENT_INPUT", message: "Choose a new time." };

  let succeeded = false;
  try {
    const useCases = await createSupabaseBookingUseCases();
    await useCases.rescheduleAppointment({
      appointmentId: parsed.data.appointmentId,
      groomerId: parsed.data.groomerId,
      selectedServiceIds: parsed.data.selectedServiceIds,
      startsAt: parsed.data.startsAt,
      idempotencyKey: createIdempotencyKey("reschedule", parsed.data.intent, parsed.data),
    });
    succeeded = true;
  } catch (error) {
    return toActionError(error);
  }

  if (succeeded) redirect("/appointments");
  return { status: "error", code: "INTERNAL_SERVER_ERROR", message: "Nothing changed. Try again." };
}
