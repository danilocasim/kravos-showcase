import { describe, expect, it } from "vitest";

import {
  getOptionalActor,
  requireAdmin,
  requireAuthenticatedActor,
} from "./guards";

const customerId = "00000000-0000-0000-0000-000000000401";
const adminId = "00000000-0000-0000-0000-000000000402";

const createDependencies = (overrides: {
  readonly profile?: { readonly id: string; readonly role: "CUSTOMER" | "ADMIN" } | null;
  readonly verifiedUserId?: string | null;
} = {}) => ({
  getVerifiedUserId: async () =>
    "verifiedUserId" in overrides ? overrides.verifiedUserId ?? null : customerId,
  getProfile: async () =>
    "profile" in overrides
      ? overrides.profile ?? null
      : { id: customerId, role: "CUSTOMER" as const },
});

describe("getOptionalActor", () => {
  it("returns null when there is no verified Supabase user", async () => {
    await expect(
      getOptionalActor(createDependencies({ verifiedUserId: null })),
    ).resolves.toBeNull();
  });

  it("returns null when a verified user has no application profile", async () => {
    await expect(
      getOptionalActor(createDependencies({ profile: null })),
    ).resolves.toBeNull();
  });

  it("returns the verified user identity and database role", async () => {
    await expect(
      getOptionalActor(
        createDependencies({
          verifiedUserId: adminId,
          profile: { id: adminId, role: "ADMIN" },
        }),
      ),
    ).resolves.toEqual({ id: adminId, role: "ADMIN" });
  });

  it("does not derive identity from caller-controlled input", async () => {
    await expect(
      getOptionalActor(
        createDependencies({
          verifiedUserId: customerId,
          profile: { id: customerId, role: "CUSTOMER" },
        }),
      ),
    ).resolves.not.toEqual({ id: adminId, role: "ADMIN" });
  });
});

describe("requireAuthenticatedActor", () => {
  it("throws a 401 error when no verified Supabase user exists", async () => {
    await expect(
      requireAuthenticatedActor(createDependencies({ verifiedUserId: null })),
    ).rejects.toMatchObject({
      status: 401,
      code: "AUTHENTICATION_REQUIRED",
    });
  });

  it("throws a 401 error when the verified user has no profile", async () => {
    await expect(
      requireAuthenticatedActor(createDependencies({ profile: null })),
    ).rejects.toMatchObject({
      status: 401,
      code: "AUTHENTICATION_REQUIRED",
    });
  });
});

describe("requireAdmin", () => {
  it("throws a 403 error for an authenticated customer", async () => {
    await expect(
      requireAdmin(
        createDependencies({
          verifiedUserId: customerId,
          profile: { id: customerId, role: "CUSTOMER" },
        }),
      ),
    ).rejects.toMatchObject({
      status: 403,
      code: "ADMIN_REQUIRED",
    });
  });

  it("returns an authenticated admin", async () => {
    await expect(
      requireAdmin(
        createDependencies({
          verifiedUserId: adminId,
          profile: { id: adminId, role: "ADMIN" },
        }),
      ),
    ).resolves.toEqual({ id: adminId, role: "ADMIN" });
  });
});
