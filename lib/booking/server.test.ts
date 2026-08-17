import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const actor = {
    id: "00000000-0000-4000-8000-000000000901",
    role: "CUSTOMER" as const,
  };
  const authDependencies = {
    getVerifiedUserId: async () => actor.id,
    getProfile: async () => actor,
  };
  const repository = {
    listPetsByOwner: vi.fn(async () => []),
  };

  return {
    actor,
    authDependencies,
    repository,
    createSupabaseServerClient: vi.fn(async () => ({ client: "request-scoped" })),
    createSupabaseAuthDependencies: vi.fn(() => authDependencies),
    requireAuthenticatedActor: vi.fn(async () => actor),
    createSupabaseBookingRepository: vi.fn(() => repository),
  };
});

vi.mock("../supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));
vi.mock("../auth/server", () => ({
  createSupabaseAuthDependencies: mocks.createSupabaseAuthDependencies,
}));
vi.mock("../auth/guards", () => ({
  requireAuthenticatedActor: mocks.requireAuthenticatedActor,
}));
vi.mock("./supabase-repository", () => ({
  createSupabaseBookingRepository: mocks.createSupabaseBookingRepository,
}));

import { createSupabaseBookingUseCases } from "./server";

describe("createSupabaseBookingUseCases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("memoizes the verified actor across concurrent use-case reads", async () => {
    const useCases = await createSupabaseBookingUseCases();

    await Promise.all([useCases.listMyPets(), useCases.listMyPets()]);

    expect(mocks.requireAuthenticatedActor).toHaveBeenCalledTimes(1);
  });

  it("binds pet ownership to the verified server actor", async () => {
    const useCases = await createSupabaseBookingUseCases();

    await useCases.listMyPets();

    expect(mocks.createSupabaseBookingRepository).toHaveBeenCalledWith({
      client: "request-scoped",
    });
    expect(mocks.requireAuthenticatedActor).toHaveBeenCalledWith(
      mocks.authDependencies,
    );
    expect(mocks.repository.listPetsByOwner).toHaveBeenCalledWith(mocks.actor.id);
  });
});
