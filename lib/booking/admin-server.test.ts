import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const actor = { id: "00000000-0000-4000-8000-000000009099", role: "ADMIN" as const };
  const repository = {
    listAppointmentsInRange: vi.fn(async () => []),
    completeConfirmedAppointment: vi.fn(),
  };
  return {
    actor,
    repository,
    createSupabaseServerClient: vi.fn(async () => ({ client: "request" })),
    createSupabaseAuthDependencies: vi.fn(() => ({ auth: "dependencies" })),
    requireAdmin: vi.fn(async () => actor),
    createSupabaseAdminBookingRepository: vi.fn(() => repository),
  };
});

vi.mock("../supabase/server", () => ({ createSupabaseServerClient: mocks.createSupabaseServerClient }));
vi.mock("../auth/server", () => ({ createSupabaseAuthDependencies: mocks.createSupabaseAuthDependencies }));
vi.mock("../auth/guards", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../auth/guards")>()),
  requireAdmin: mocks.requireAdmin,
}));
vi.mock("./admin-supabase-repository", () => ({ createSupabaseAdminBookingRepository: mocks.createSupabaseAdminBookingRepository }));

import { createSupabaseAdminBookingUseCases } from "./admin-server";

describe("createSupabaseAdminBookingUseCases", () => {
  beforeEach(() => vi.clearAllMocks());

  it("binds all operations to one verified database-backed admin actor", async () => {
    const useCases = await createSupabaseAdminBookingUseCases();
    await Promise.all([
      useCases.listDay({ date: "2026-09-02" }),
      useCases.listDay({ date: "2026-09-03" }),
    ]);

    expect(mocks.requireAdmin).toHaveBeenCalledTimes(1);
    expect(mocks.createSupabaseAdminBookingRepository).toHaveBeenCalledWith({ client: "request" });
  });
});
