import "server-only";

import { requireAuthenticatedActor } from "../../auth/guards";
import { createSupabaseAuthDependencies } from "../../auth/server";
import { createSupabaseServerClient } from "../../supabase/server";
import { createSupabaseBookingRepository } from "../../booking/supabase-repository";
import { createBookingUseCases } from "../../booking/use-cases";
import { createBookingApiHandlers } from "./booking-handlers";

/**
 * Builds HTTP handlers for the current request using only verified Supabase
 * sessions and the shared booking domain. No route ever accepts a customer ID.
 */
export const createSupabaseBookingApiHandlers = async () => {
  const [supabase] = await Promise.all([createSupabaseServerClient()]);
  const authDependencies = createSupabaseAuthDependencies();
  let actorPromise: ReturnType<typeof requireAuthenticatedActor> | null = null;
  const getVerifiedActor = () => {
    actorPromise ??= requireAuthenticatedActor(authDependencies);
    return actorPromise;
  };
  const bookingUseCases = createBookingUseCases({
    repository: createSupabaseBookingRepository(supabase),
    getCurrentActor: getVerifiedActor,
  });

  return createBookingApiHandlers({
    ...bookingUseCases,
    requireAuthenticatedActor: getVerifiedActor,
  });
};
