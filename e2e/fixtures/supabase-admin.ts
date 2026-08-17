import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getLocalSupabaseClientConfig } from "./client-config";

/**
 * A service-role Supabase client for test setup only.
 *
 * This module lives outside `app/` and `lib/` and is imported only by end-to-end
 * fixtures, so the secret it uses can never reach a browser bundle. Application
 * code has no service-role path at all: `lib/supabase/server.ts` reads the
 * publishable key and nothing else.
 */

let cachedClient: SupabaseClient | null = null;

/**
 * Returns the shared service-role client, creating it on first use.
 *
 * @returns A Supabase client that bypasses row-level security.
 */
export const getSupabaseAdminClient = (): SupabaseClient => {
  if (cachedClient === null) {
    const { apiUrl, serviceRoleKey } = getLocalSupabaseClientConfig();

    cachedClient = createClient(apiUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return cachedClient;
};
