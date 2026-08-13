import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabasePublicConfig } from "@/lib/supabase/public-config";

/**
 * Refreshes Supabase Auth cookies before requests reach Server Components,
 * Route Handlers, or Server Actions. Fine-grained role checks remain in the
 * server auth guards; this proxy deliberately performs no authorization.
 */
export const proxy = async (request: NextRequest): Promise<NextResponse> => {
  let response = NextResponse.next({ request });
  const config = getSupabasePublicConfig();

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getClaims();

  return response;
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
