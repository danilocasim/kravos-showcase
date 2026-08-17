import { createSupabaseKravosBookingApiHandlers } from "../../../../../../../lib/api/v1/kravos-server";

export const POST = async (request: Request): Promise<Response> =>
  (await createSupabaseKravosBookingApiHandlers()).resolveCustomer(request);
