import "server-only";

import { z } from "zod";

import type { AuthDependencies, AuthenticatedActor } from "./guards";
import { createSupabaseServerClient } from "../supabase/server";

const profileSchema = z.object({
  id: z.guid(),
  role: z.enum(["CUSTOMER", "ADMIN"]),
});

/** Minimal adapter contract used by auth lookup code and deterministic tests. */
export interface SupabaseAuthClient {
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
 * Asks Supabase Auth to verify the request's session rather than trusting a
 * decoded cookie or client-provided identity.
 *
 * @param client - A server-side adapter over Supabase Auth.
 * @returns A verified user ID, or null when the session/token is absent or invalid.
 */
export const getVerifiedSupabaseUserId = async (
  client: SupabaseAuthClient,
): Promise<string | null> => {
  try {
    const { data, error } = await client.getUser();

    if (error !== null || data.user === null) {
      return null;
    }

    return data.user.id;
  } catch {
    return null;
  }
};

/**
 * Reads and validates the application role stored in the database. JWT user
 * metadata and request-body roles are intentionally never consulted.
 *
 * @param client - A server-side adapter over the profiles query.
 * @param verifiedUserId - User ID returned by verified Supabase authentication.
 * @returns A validated application profile, or null when it is absent/invalid.
 */
export const getApplicationProfile = async (
  client: SupabaseAuthClient,
  verifiedUserId: string,
): Promise<AuthenticatedActor | null> => {
  try {
    const { data, error } = await client.getProfile(verifiedUserId);

    if (error !== null) {
      return null;
    }

    const parsedProfile = profileSchema.safeParse(data);

    if (!parsedProfile.success || parsedProfile.data.id !== verifiedUserId) {
      return null;
    }

    return parsedProfile.data;
  } catch {
    return null;
  }
};

/**
 * Builds one request-scoped adapter over the actual Supabase server client.
 *
 * @returns An adapter that verifies sessions remotely and reads database roles.
 */
const createRequestAuthClient = async (): Promise<SupabaseAuthClient> => {
  const supabase = await createSupabaseServerClient();

  return {
    getUser: async () => {
      const { data, error } = await supabase.auth.getUser();

      return {
        data: {
          user: data.user === null ? null : { id: data.user.id },
        },
        error,
      };
    },
    getProfile: async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", userId)
        .maybeSingle();

      return { data, error };
    },
  };
};

/**
 * Builds the production dependencies for auth guards from the current request.
 *
 * This is the only module that imports the request-scoped Supabase client. The
 * pure guard module remains independently testable and cannot accept caller IDs.
 *
 * @returns Dependencies for getOptionalActor, requireAuthenticatedActor, and requireAdmin.
 */
export const createSupabaseAuthDependencies = (): AuthDependencies => {
  const clientPromise = createRequestAuthClient();

  return {
    getVerifiedUserId: async () =>
      getVerifiedSupabaseUserId(await clientPromise),
    getProfile: async (userId: string) =>
      getApplicationProfile(await clientPromise, userId),
  };
};
