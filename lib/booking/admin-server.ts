import "server-only";

import { requireAdmin } from "../auth/guards";
import { createSupabaseAuthDependencies } from "../auth/server";
import { createSupabaseServerClient } from "../supabase/server";
import { createAdminBookingUseCases } from "./admin-use-cases";
import { createSupabaseAdminBookingRepository } from "./admin-supabase-repository";

/** Builds request-scoped admin operations bound to one verified ADMIN actor. */
export const createSupabaseAdminBookingUseCases = async () => {
  const supabase = await createSupabaseServerClient();
  const actor = requireAdmin(createSupabaseAuthDependencies());
  return createAdminBookingUseCases({
    repository: createSupabaseAdminBookingRepository(supabase),
    getCurrentActor: () => actor,
  });
};
