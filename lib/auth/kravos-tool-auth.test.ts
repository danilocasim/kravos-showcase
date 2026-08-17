import { describe, expect, it, vi } from "vitest";

import { AuthenticationRequiredError } from "./guards";
import { createKravosToolAuthResolver } from "./kravos-tool-auth";

const customer = {
  id: "00000000-0000-4000-8000-000000005001",
  role: "CUSTOMER" as const,
};

const request = (authorization?: string): Request =>
  new Request("https://pawandpolish.example/api/v1/integrations/kravos/catalog", {
    method: "POST",
    headers: authorization === undefined ? {} : { Authorization: authorization },
  });

describe("Kravos custom-tool authentication", () => {
  it("uses the verified Supabase customer session before considering a bearer", async () => {
    const getOptionalActor = vi.fn(async () => customer);
    const getBearerSecret = vi.fn(() => "booking-secret");
    const resolve = createKravosToolAuthResolver({ getOptionalActor, getBearerSecret });

    await expect(resolve(request("Bearer wrong-secret"))).resolves.toEqual({
      kind: "CUSTOMER_SESSION",
      actor: customer,
    });
    expect(getBearerSecret).not.toHaveBeenCalled();
  });

  it("accepts the configured bearer when no verified session exists", async () => {
    const resolve = createKravosToolAuthResolver({
      getOptionalActor: async () => null,
      getBearerSecret: () => "booking-secret",
    });

    await expect(resolve(request("Bearer booking-secret"))).resolves.toEqual({
      kind: "KRAVOS_TOOL",
    });
  });

  it("accepts an explicitly allowed demo concierge request without a bearer", async () => {
    const resolve = createKravosToolAuthResolver({
      getOptionalActor: async () => null,
      getBearerSecret: () => "booking-secret",
      isAllowedDemoRequest: (candidate) =>
        candidate.headers.get("x-paw-polish-concierge") === "v1",
    });
    const marked = new Request(
      "https://pawandpolish.example/api/v1/integrations/kravos/booking/options",
      { method: "POST", headers: { "X-Paw-Polish-Concierge": "v1" } },
    );

    await expect(resolve(marked)).resolves.toEqual({ kind: "KRAVOS_TOOL" });
  });

  it.each([undefined, "Basic booking-secret", "Bearer", "Bearer wrong-secret"])(
    "rejects an absent or invalid bearer (%s)",
    async (authorization) => {
      const resolve = createKravosToolAuthResolver({
        getOptionalActor: async () => null,
        getBearerSecret: () => "booking-secret",
      });

      await expect(resolve(request(authorization))).rejects.toBeInstanceOf(
        AuthenticationRequiredError,
      );
    },
  );
});
