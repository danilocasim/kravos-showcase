import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const actor = {
    id: "00000000-0000-4000-8000-000000004201",
    role: "CUSTOMER" as const,
  };
  const authDependencies = {};
  const supabase = { client: "request-scoped" };
  const repository = { name: "booking-repository" };
  const bookingUseCases = { listActiveServices: vi.fn() };
  const handlers = { listServices: vi.fn() };

  return {
    actor,
    authDependencies,
    supabase,
    repository,
    bookingUseCases,
    handlers,
    createSupabaseAuthDependencies: vi.fn(() => authDependencies),
    requireAuthenticatedActor: vi.fn(async () => actor),
    createSupabaseServerClient: vi.fn(async () => supabase),
    createSupabaseBookingRepository: vi.fn(() => repository),
    createBookingUseCases: vi.fn(() => bookingUseCases),
    createBookingApiHandlers: vi.fn(() => handlers),
  };
});

vi.mock("../../auth/server", () => ({
  createSupabaseAuthDependencies: mocks.createSupabaseAuthDependencies,
}));
vi.mock("../../auth/guards", () => ({
  requireAuthenticatedActor: mocks.requireAuthenticatedActor,
}));
vi.mock("../../supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));
vi.mock("../../booking/supabase-repository", () => ({
  createSupabaseBookingRepository: mocks.createSupabaseBookingRepository,
}));
vi.mock("../../booking/use-cases", () => ({
  createBookingUseCases: mocks.createBookingUseCases,
}));
vi.mock("./booking-handlers", () => ({
  createBookingApiHandlers: mocks.createBookingApiHandlers,
}));

import { createSupabaseBookingApiHandlers } from "./server";

describe("createSupabaseBookingApiHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds the booking domain with one private, request-scoped verified actor", async () => {
    await createSupabaseBookingApiHandlers();

    const domainCalls = mocks.createBookingUseCases.mock.calls as unknown as ReadonlyArray<
      readonly [
        {
          readonly repository: typeof mocks.repository;
          readonly getCurrentActor: () => Promise<typeof mocks.actor>;
        },
      ]
    >;
    const handlerCalls = mocks.createBookingApiHandlers.mock.calls as unknown as ReadonlyArray<
      readonly [
        { readonly requireAuthenticatedActor: () => Promise<typeof mocks.actor> },
      ]
    >;
    const domainInput = domainCalls[0]?.[0];
    const handlerInput = handlerCalls[0]?.[0];

    expect(mocks.createSupabaseBookingRepository).toHaveBeenCalledWith(mocks.supabase);
    expect(domainInput?.repository).toBe(mocks.repository);
    expect(domainInput?.getCurrentActor).toBe(handlerInput?.requireAuthenticatedActor);

    await domainInput?.getCurrentActor?.();
    await handlerInput?.requireAuthenticatedActor?.();

    expect(mocks.requireAuthenticatedActor).toHaveBeenCalledTimes(1);
    expect(mocks.requireAuthenticatedActor).toHaveBeenCalledWith(mocks.authDependencies);
  });
});
