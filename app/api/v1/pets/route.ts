import { createSupabaseBookingApiHandlers } from "../../../../lib/api/v1/server";

export const GET = async (request: Request): Promise<Response> =>
  (await createSupabaseBookingApiHandlers()).listPets(request);

export const POST = async (request: Request): Promise<Response> =>
  (await createSupabaseBookingApiHandlers()).createPet(request);
