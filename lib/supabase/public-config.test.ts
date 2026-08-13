import { describe, expect, it } from "vitest";

import { getSupabasePublicConfig } from "./public-config";

describe("getSupabasePublicConfig", () => {
  it("returns the public Supabase URL and publishable key", () => {
    const config = getSupabasePublicConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://paw-polish.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
    });

    expect(config).toEqual({
      url: "https://paw-polish.supabase.co",
      publishableKey: "publishable-key",
    });
  });

  it("rejects missing public Supabase configuration without exposing values", () => {
    expect(() => getSupabasePublicConfig({})).toThrow(
      "Missing or invalid public Supabase configuration.",
    );
  });
});
