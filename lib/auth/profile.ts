import "server-only";

import { cache } from "react";
import { z } from "zod";

import type { ApplicationRole } from "./guards";
import { createSupabaseServerClient } from "../supabase/server";

const profileRowSchema = z.object({
  id: z.guid(),
  role: z.enum(["CUSTOMER", "ADMIN"]),
  display_name: z.string().trim().min(1).max(100),
});

/** The signed-in customer as the application shell needs to render them. */
export interface CurrentProfile {
  readonly id: string;
  readonly role: ApplicationRole;
  readonly displayName: string;
}

/** Minimal adapter contract used by the profile lookup and deterministic tests. */
export interface SupabaseProfileClient {
  getUser: () => Promise<{
    readonly data: { readonly user: { readonly id: string } | null };
    readonly error: unknown | null;
  }>;
  getProfile: (userId: string) => Promise<{
    readonly data: unknown;
    readonly error: unknown | null;
  }>;
}

/**
 * Reads the signed-in customer's display name alongside their verified identity.
 *
 * `AuthenticatedActor` deliberately carries only the fields authorization needs,
 * so the presentational name is fetched here instead. Identity still comes from
 * a remotely verified session, and the role still comes from the database row.
 *
 * @param client - A server-side adapter over Supabase Auth and the profiles table.
 * @returns The current profile, or null when the session or row is absent or invalid.
 */
export const getCurrentProfile = async (
  client: SupabaseProfileClient,
): Promise<CurrentProfile | null> => {
  try {
    const { data: userData, error: userError } = await client.getUser();

    if (userError !== null || userData.user === null) {
      return null;
    }

    const verifiedUserId = userData.user.id;
    const { data, error } = await client.getProfile(verifiedUserId);

    if (error !== null) {
      return null;
    }

    const parsedProfile = profileRowSchema.safeParse(data);

    if (!parsedProfile.success || parsedProfile.data.id !== verifiedUserId) {
      return null;
    }

    return {
      id: parsedProfile.data.id,
      role: parsedProfile.data.role,
      displayName: parsedProfile.data.display_name,
    };
  } catch {
    return null;
  }
};

/**
 * Reads the current profile using the request-scoped Supabase client.
 *
 * @returns The current profile, or null when nobody is signed in.
 */
export const getRequestProfile = cache(async (): Promise<CurrentProfile | null> => {
  const supabase = await createSupabaseServerClient();

  return getCurrentProfile({
    getUser: async () => {
      const { data, error } = await supabase.auth.getUser();

      return {
        data: { user: data.user === null ? null : { id: data.user.id } },
        error,
      };
    },
    getProfile: async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, display_name")
        .eq("id", userId)
        .maybeSingle();

      return { data, error };
    },
  });
});
