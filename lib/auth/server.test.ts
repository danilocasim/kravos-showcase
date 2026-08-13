import { describe, expect, it } from "vitest";

import type { ApplicationRole } from "./guards";
import { getApplicationProfile, getVerifiedSupabaseUserId } from "./server";

const customerId = "00000000-0000-4000-8000-000000000501";

const createClient = (overrides: {
  readonly profileData?: unknown;
  readonly profileError?: unknown;
  readonly profileThrows?: Error;
  readonly userId?: string | null;
  readonly userError?: unknown;
  readonly userThrows?: Error;
} = {}) => {
  const hasUserIdOverride = "userId" in overrides;
  const hasProfileDataOverride = "profileData" in overrides;

  return {
    getUser: async () => {
      if (overrides.userThrows !== undefined) {
        throw overrides.userThrows;
      }

      return {
        data: {
          user: hasUserIdOverride
            ? overrides.userId === null
              ? null
              : { id: overrides.userId }
            : { id: customerId },
        },
        error: overrides.userError ?? null,
      };
    },
    getProfile: async () => {
      if (overrides.profileThrows !== undefined) {
        throw overrides.profileThrows;
      }

      return {
        data: hasProfileDataOverride
          ? overrides.profileData
          : { id: customerId, role: "CUSTOMER" as ApplicationRole },
        error: overrides.profileError ?? null,
      };
    },
  };
};

describe("getVerifiedSupabaseUserId", () => {
  it("returns the user ID only after Supabase verifies a user", async () => {
    await expect(
      getVerifiedSupabaseUserId(createClient()),
    ).resolves.toBe(customerId);
  });

  it("returns null for a missing session", async () => {
    await expect(
      getVerifiedSupabaseUserId(createClient({ userId: null })),
    ).resolves.toBeNull();
  });

  it("returns null for an invalid Supabase credential", async () => {
    await expect(
      getVerifiedSupabaseUserId(createClient({ userError: new Error("invalid token") })),
    ).resolves.toBeNull();
  });

  it("fails closed when Supabase Auth throws", async () => {
    await expect(
      getVerifiedSupabaseUserId(createClient({ userThrows: new Error("network failure") })),
    ).resolves.toBeNull();
  });
});

describe("getApplicationProfile", () => {
  it("accepts a PostgreSQL-compatible profile UUID", async () => {
    const databaseUserId = "10000000-0000-0000-0000-000000000001";

    await expect(
      getApplicationProfile(
        createClient({
          profileData: { id: databaseUserId, role: "CUSTOMER" },
        }),
        databaseUserId,
      ),
    ).resolves.toEqual({ id: databaseUserId, role: "CUSTOMER" });
  });

  it("returns a database-backed customer role", async () => {
    await expect(
      getApplicationProfile(createClient(), customerId),
    ).resolves.toEqual({ id: customerId, role: "CUSTOMER" });
  });

  it("returns null when the profile is missing", async () => {
    await expect(
      getApplicationProfile(createClient({ profileData: null }), customerId),
    ).resolves.toBeNull();
  });

  it("returns null when Supabase rejects the profile lookup", async () => {
    await expect(
      getApplicationProfile(
        createClient({ profileError: new Error("database unavailable") }),
        customerId,
      ),
    ).resolves.toBeNull();
  });

  it("fails closed when the profile query throws", async () => {
    await expect(
      getApplicationProfile(
        createClient({ profileThrows: new Error("network failure") }),
        customerId,
      ),
    ).resolves.toBeNull();
  });

  it("returns null for an unrecognized database role", async () => {
    await expect(
      getApplicationProfile(
        createClient({ profileData: { id: customerId, role: "OWNER" } }),
        customerId,
      ),
    ).resolves.toBeNull();
  });

  it("returns null when a profile ID does not match the verified user", async () => {
    await expect(
      getApplicationProfile(
        createClient({
          profileData: {
            id: "00000000-0000-4000-8000-000000000599",
            role: "CUSTOMER",
          },
        }),
        customerId,
      ),
    ).resolves.toBeNull();
  });
});
