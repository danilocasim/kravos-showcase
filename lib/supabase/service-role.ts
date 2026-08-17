import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

const serviceRoleConfigSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1),
  KRAVOS_BOOKING_TOOL_BEARER: z.string().trim().min(1),
});

type ServiceRoleEnvironment = Readonly<Record<string, string | undefined>>;

export interface SupabaseServiceRoleConfig {
  readonly url: string;
  readonly serviceRoleKey: string;
  readonly kravosBearer: string;
}

/** Validates secret server configuration without including values in errors. */
export const getSupabaseServiceRoleConfig = (
  environment: ServiceRoleEnvironment = process.env,
): SupabaseServiceRoleConfig => {
  const parsed = serviceRoleConfigSchema.safeParse(environment);
  if (!parsed.success) {
    throw new Error("Missing or invalid Kravos booking integration configuration.");
  }

  return {
    url: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
    kravosBearer: parsed.data.KRAVOS_BOOKING_TOOL_BEARER,
  };
};

/** Creates a server-only client that never persists a service-role session. */
export const createSupabaseServiceRoleClient = (
  config: SupabaseServiceRoleConfig = getSupabaseServiceRoleConfig(),
): SupabaseClient =>
  createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
