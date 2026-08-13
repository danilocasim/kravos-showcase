import { createSupabaseBookingApiHandlers } from "../../../../../lib/api/v1/server";

interface RouteContext {
  readonly params: Promise<{ readonly petId: string }>;
}

export const PATCH = async (
  request: Request,
  context: RouteContext,
): Promise<Response> =>
  (await createSupabaseBookingApiHandlers()).updatePet(request, await context.params);

export const DELETE = async (
  request: Request,
  context: RouteContext,
): Promise<Response> =>
  (await createSupabaseBookingApiHandlers()).deletePet(request, await context.params);
