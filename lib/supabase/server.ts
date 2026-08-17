import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getSupabasePublicConfig } from "./public-config";

/**
 * Creates a request-scoped Supabase client for Route Handlers and Server Actions.
 *
 * Next.js protects this server-only module from client bundles. It uses the
 * publishable key plus the authenticated request cookies; a service-role key is
 * deliberately neither read nor supported here.
 *
 * @returns A request-scoped Supabase client.
 */
export const createSupabaseServerClient = async (): Promise<SupabaseClient> => {
  const cookieStore = await cookies();
  const config = getSupabasePublicConfig();

  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Next.js rejects cookie writes during a Server Component render, so a
          // refreshed session cannot be persisted from a page. This is safe to
          // ignore: proxy.ts refreshes the session on every matched request and
          // is the writer that actually persists the rotated cookies.
        }
      },
    },
  });
};
