import { createSupabaseBookingApiHandlers } from "../../../../../../lib/api/v1/server";

interface RouteContext {
  readonly params: Promise<{ readonly appointmentId: string }>;
}

export const POST = async (
  request: Request,
  context: RouteContext,
): Promise<Response> =>
  (await createSupabaseBookingApiHandlers()).rescheduleAppointment(
    request,
    await context.params,
  );
