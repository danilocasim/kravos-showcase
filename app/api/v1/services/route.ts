import { createSupabaseBookingApiHandlers } from "../../../../lib/api/v1/server";

export const GET = async (request: Request): Promise<Response> =>
  (await createSupabaseBookingApiHandlers()).listServices(request);
