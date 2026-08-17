import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const authDependencies = { source: "request-session" };
  const actor = {
    id: "00000000-0000-4000-8000-000000005401",
    role: "CUSTOMER" as const,
  };
  const config = {
    url: "https://example.supabase.co",
    serviceRoleKey: "service-role-key",
    kravosBearer: "booking-bearer",
  };
  const supabase = { source: "service-role" };
  const useCases = { getCatalog: vi.fn() };
  const resolvePrincipal = vi.fn();
  const handlers = { catalog: vi.fn() };

  return {
    actor,
    authDependencies,
    config,
    supabase,
    useCases,
    resolvePrincipal,
    handlers,
    createSupabaseAuthDependencies: vi.fn(() => authDependencies),
    getOptionalActor: vi.fn(async () => actor),
    getSupabaseServiceRoleConfig: vi.fn(() => config),
    createSupabaseServiceRoleClient: vi.fn(() => supabase),
    createSupabaseKravosBookingUseCases: vi.fn(() => useCases),
    createKravosToolAuthResolver: vi.fn(() => resolvePrincipal),
    createKravosBookingApiHandlers: vi.fn(() => handlers),
  };
});

vi.mock("../../auth/server", () => ({
  createSupabaseAuthDependencies: mocks.createSupabaseAuthDependencies,
}));
vi.mock("../../auth/guards", () => ({ getOptionalActor: mocks.getOptionalActor }));
vi.mock("../../auth/kravos-tool-auth", () => ({
  createKravosToolAuthResolver: mocks.createKravosToolAuthResolver,
}));
vi.mock("../../supabase/service-role", () => ({
  getSupabaseServiceRoleConfig: mocks.getSupabaseServiceRoleConfig,
  createSupabaseServiceRoleClient: mocks.createSupabaseServiceRoleClient,
}));
vi.mock("../../booking/kravos-supabase", () => ({
  createSupabaseKravosBookingUseCases: mocks.createSupabaseKravosBookingUseCases,
}));
vi.mock("./kravos-handlers", () => ({
  createKravosBookingApiHandlers: mocks.createKravosBookingApiHandlers,
}));

import { createSupabaseKravosBookingApiHandlers } from "./kravos-server";

describe("createSupabaseKravosBookingApiHandlers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("composes request-session fallback, bearer auth, and service-role booking", async () => {
    await expect(createSupabaseKravosBookingApiHandlers()).resolves.toBe(mocks.handlers);

    expect(mocks.createSupabaseServiceRoleClient).toHaveBeenCalledWith(mocks.config);
    expect(mocks.createSupabaseKravosBookingUseCases).toHaveBeenCalledWith(
      mocks.supabase,
    );
    const authCalls = mocks.createKravosToolAuthResolver.mock.calls as unknown as
      ReadonlyArray<
        readonly [
          {
            readonly getOptionalActor: () => Promise<typeof mocks.actor>;
            readonly getBearerSecret: () => string;
            readonly isAllowedDemoRequest: (request: Request) => boolean;
          },
        ]
      >;
    const authInput = authCalls[0]![0];
    expect(authInput.getBearerSecret()).toBe("booking-bearer");
    await expect(authInput.getOptionalActor()).resolves.toBe(mocks.actor);
    const markedRequest = (path: string, marked = true) =>
      new Request(`https://pawandpolish.example${path}`, {
        headers: marked ? { "X-Paw-Polish-Concierge": "v1" } : {},
      });
    expect(
      authInput.isAllowedDemoRequest(
        markedRequest("/api/v1/integrations/kravos/booking/options"),
      ),
    ).toBe(true);
    expect(
      authInput.isAllowedDemoRequest(
        markedRequest("/api/v1/integrations/kravos/booking/confirm"),
      ),
    ).toBe(true);
    expect(
      authInput.isAllowedDemoRequest(
        markedRequest("/api/v1/integrations/kravos/booking/reschedule"),
      ),
    ).toBe(true);
    expect(
      authInput.isAllowedDemoRequest(
        markedRequest("/api/v1/integrations/kravos/catalog"),
      ),
    ).toBe(false);
    expect(
      authInput.isAllowedDemoRequest(
        markedRequest("/api/v1/integrations/kravos/booking/options", false),
      ),
    ).toBe(false);
    expect(mocks.getOptionalActor).toHaveBeenCalledWith(mocks.authDependencies);
    expect(mocks.createKravosBookingApiHandlers).toHaveBeenCalledWith({
      useCases: mocks.useCases,
      resolvePrincipal: mocks.resolvePrincipal,
    });
  });

});
