import { describe, expect, it } from "vitest";

import { getSupabaseServiceRoleConfig } from "./service-role";

describe("Supabase service-role configuration", () => {
  it("returns the server-only URL, service key, and Kravos bearer", () => {
    expect(
      getSupabaseServiceRoleConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
        KRAVOS_BOOKING_TOOL_BEARER: "booking-tool-secret",
      }),
    ).toEqual({
      url: "https://example.supabase.co",
      serviceRoleKey: "service-role-secret",
      kravosBearer: "booking-tool-secret",
    });
  });

  it("fails without exposing invalid environment values", () => {
    expect(() =>
      getSupabaseServiceRoleConfig({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
        KRAVOS_BOOKING_TOOL_BEARER: "booking-tool-secret",
      }),
    ).toThrow("Missing or invalid Kravos booking integration configuration.");
  });
});
