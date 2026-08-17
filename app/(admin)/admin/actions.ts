"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { toActionError } from "../../action-error";
import type { ActionResult } from "../../action-result";
import { AppointmentLifecycleValidationError } from "../../../lib/booking/use-cases";
import { createIdempotencyKey } from "../../../lib/booking/idempotency-key";
import { createSupabaseAdminBookingUseCases } from "../../../lib/booking/admin-server";

const idSchema = z.guid();
const cancelSchema = z.object({ appointmentId: z.guid(), intent: z.guid() });
const revalidateAppointments = (): void => {
  revalidatePath("/admin");
  revalidatePath("/appointments");
};

export async function completeAdminAppointmentAction(
  appointmentId: string,
  _previous: ActionResult,
  _formData: FormData,
): Promise<ActionResult> {
  void _previous;
  void _formData;
  const id = idSchema.safeParse(appointmentId);
  if (!id.success) return toActionError(new AppointmentLifecycleValidationError());
  try {
    const useCases = await createSupabaseAdminBookingUseCases();
    await useCases.completeAppointment(id.data);
    revalidateAppointments();
    return { status: "success" };
  } catch (error) {
    return toActionError(error);
  }
}

export async function cancelAdminAppointmentAction(
  appointmentId: string,
  intent: string,
  _previous: ActionResult,
  _formData: FormData,
): Promise<ActionResult> {
  void _previous;
  void _formData;
  const parsed = cancelSchema.safeParse({ appointmentId, intent });
  if (!parsed.success) return toActionError(new AppointmentLifecycleValidationError());
  try {
    const useCases = await createSupabaseAdminBookingUseCases();
    await useCases.cancelAppointment({
      appointmentId: parsed.data.appointmentId,
      idempotencyKey: createIdempotencyKey("cancel", parsed.data.intent, parsed.data),
    });
    revalidateAppointments();
    return { status: "success" };
  } catch (error) {
    return toActionError(error);
  }
}
