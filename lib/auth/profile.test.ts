import { describe, expect, it } from "vitest";

import { getCurrentProfile } from "./profile";
import type { SupabaseProfileClient } from "./profile";

const buildClient = (
  overrides: Partial<SupabaseProfileClient> = {},
): SupabaseProfileClient => ({
  getUser: async () => ({
    data: { user: { id: "00000000-0000-4000-8000-000000004501" } },
    error: null,
  }),
  getProfile: async () => ({
    data: {
      id: "00000000-0000-4000-8000-000000004501",
      role: "CUSTOMER",
      display_name: "Danilo",
    },
    error: null,
  }),
  ...overrides,
});

describe("getCurrentProfile", () => {
  it("returns the verified actor with the database display name", async () => {
    const profile = await getCurrentProfile(buildClient());

    expect(profile).toEqual({
      id: "00000000-0000-4000-8000-000000004501",
      role: "CUSTOMER",
      displayName: "Danilo",
    });
  });

  it("returns null when the profile row is missing", async () => {
    const profile = await getCurrentProfile(
      buildClient({ getProfile: async () => ({ data: null, error: null }) }),
    );

    expect(profile).toBeNull();
  });

  it("returns null when there is no verified session", async () => {
    const profile = await getCurrentProfile(
      buildClient({
        getUser: async () => ({ data: { user: null }, error: null }),
      }),
    );

    expect(profile).toBeNull();
  });

  it("returns null when the profile belongs to a different user", async () => {
    const profile = await getCurrentProfile(
      buildClient({
        getProfile: async () => ({
          data: {
            id: "00000000-0000-4000-8000-000000004502",
            role: "CUSTOMER",
            display_name: "Someone else",
          },
          error: null,
        }),
      }),
    );

    expect(profile).toBeNull();
  });

  it("fails closed when the profile query errors", async () => {
    const profile = await getCurrentProfile(
      buildClient({
        getProfile: async () => ({ data: null, error: { message: "denied" } }),
      }),
    );

    expect(profile).toBeNull();
  });

  it("fails closed when the Supabase client throws", async () => {
    const profile = await getCurrentProfile(
      buildClient({
        getUser: async () => {
          throw new Error("network down");
        },
      }),
    );

    expect(profile).toBeNull();
  });
});
