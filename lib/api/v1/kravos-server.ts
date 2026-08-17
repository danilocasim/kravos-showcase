import "server-only";

import { getOptionalActor } from "../../auth/guards";
import { createKravosToolAuthResolver } from "../../auth/kravos-tool-auth";
import { createSupabaseAuthDependencies } from "../../auth/server";
import { createSupabaseKravosBookingUseCases } from "../../booking/kravos-supabase";
import {
  createSupabaseServiceRoleClient,
  getSupabaseServiceRoleConfig,
} from "../../supabase/service-role";
import { createKravosBookingApiHandlers } from "./kravos-handlers";

const demoConciergeHeader = "x-paw-polish-concierge";
const demoConciergePaths = new Set([
  "/api/v1/integrations/kravos/booking/options",
  "/api/v1/integrations/kravos/booking/confirm",
  "/api/v1/integrations/kravos/booking/reschedule",
]);

/** Builds the server-to-server Kravos tool handlers for one Next.js request. */
export const createSupabaseKravosBookingApiHandlers = async () => {
  const config = getSupabaseServiceRoleConfig();
  const authDependencies = createSupabaseAuthDependencies();
  const supabase = createSupabaseServiceRoleClient(config);
  const useCases = createSupabaseKravosBookingUseCases(supabase);
  const resolvePrincipal = createKravosToolAuthResolver({
    getOptionalActor: () => getOptionalActor(authDependencies),
    getBearerSecret: () => config.kravosBearer,
    isAllowedDemoRequest: (request) =>
      request.headers.get(demoConciergeHeader) === "v1" &&
      demoConciergePaths.has(new URL(request.url).pathname),
  });

  return createKravosBookingApiHandlers({ useCases, resolvePrincipal });
};
