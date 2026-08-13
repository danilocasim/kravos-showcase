import "client-only";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig } from "./public-config";

let browserClient: SupabaseClient | undefined;

/**
 * Returns the browser-only Supabase client backed exclusively by public values.
 *
 * This module cannot be imported by server code. It must never use a service-role
 * key or contain booking/business logic.
 */
export const getSupabaseBrowserClient = (): SupabaseClient => {
  if (browserClient === undefined) {
    const config = getSupabasePublicConfig();
    browserClient = createBrowserClient(config.url, config.publishableKey);
  }

  return browserClient;
};
