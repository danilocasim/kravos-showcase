import { createSupabaseKravosBookingApiHandlers } from "../../../../../../../lib/api/v1/kravos-server";

/** Creates a pet for the verified customer resolved by the concierge. */
export const POST = async (request: Request): Promise<Response> =>
  (await createSupabaseKravosBookingApiHandlers()).createPet(request);
