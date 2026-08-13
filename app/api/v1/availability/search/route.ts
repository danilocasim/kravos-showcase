import { createSupabaseBookingApiHandlers } from "../../../../../lib/api/v1/server";

export const POST = async (request: Request): Promise<Response> =>
  (await createSupabaseBookingApiHandlers()).searchAvailability(request);
