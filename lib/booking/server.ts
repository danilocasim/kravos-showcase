import "server-only";

import { requireAuthenticatedActor } from "../auth/guards";
import { createSupabaseAuthDependencies } from "../auth/server";
import { createSupabaseServerClient } from "../supabase/server";
import { createSupabaseBookingRepository } from "./supabase-repository";
import { createBookingUseCases } from "./use-cases";

/**
 * Creates Task 5 booking use cases for the current verified Supabase request.
 *
 * Every pet operation derives its owner from `requireAuthenticatedActor`; a
 * Route Handler or Server Action cannot inject another customer ID.
 */
export const createSupabaseBookingUseCases = async () => {
  const supabase = await createSupabaseServerClient();
  const authDependencies = createSupabaseAuthDependencies();

  return createBookingUseCases({
    repository: createSupabaseBookingRepository(supabase),
    getCurrentActor: () => requireAuthenticatedActor(authDependencies),
  });
};
