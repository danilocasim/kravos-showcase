import { beforeEach, describe, expect, it, vi } from "vitest";

interface CookieToSet {
  readonly name: string;
  readonly value: string;
  readonly options?: unknown;
}

interface CookieAdapter {
  readonly getAll: () => unknown;
  readonly setAll: (cookiesToSet: ReadonlyArray<CookieToSet>) => void;
}

const mocks = vi.hoisted(() => ({
  cookieStore: {
    getAll: (): ReadonlyArray<unknown> => [],
    set: (() => {}) as (
      name: string,
      value: string,
      options?: unknown,
    ) => void,
  },
  captured: { adapter: null as CookieAdapter | null },
}));

vi.mock("next/headers", () => ({
  cookies: async () => mocks.cookieStore,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _publishableKey: string,
    options: { readonly cookies: CookieAdapter },
  ) => {
    mocks.captured.adapter = options.cookies;
    return {};
  },
}));

import { createSupabaseServerClient } from "./server";

/**
 * Builds the client and returns the cookie adapter handed to `@supabase/ssr`.
 *
 * @returns The adapter whose `setAll` the Supabase session refresh calls.
 */
const buildCookieAdapter = async (): Promise<CookieAdapter> => {
  await createSupabaseServerClient();

  const adapter = mocks.captured.adapter;

  if (adapter === null) {
    throw new Error("The Supabase client was created without a cookie adapter.");
  }

  return adapter;
};

describe("createSupabaseServerClient", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://paw-polish.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
    mocks.captured.adapter = null;
    mocks.cookieStore.set = () => {};
  });

  it("ignores cookie writes that Next.js rejects during a Server Component render", async () => {
    mocks.cookieStore.set = () => {
      throw new Error(
        "Cookies can only be modified in a Server Action or Route Handler",
      );
    };

    const adapter = await buildCookieAdapter();

    expect(() =>
      adapter.setAll([{ name: "sb-auth-token", value: "refreshed" }]),
    ).not.toThrow();
  });

  it("writes refreshed session cookies when the request allows it", async () => {
    const written: Array<CookieToSet> = [];

    mocks.cookieStore.set = (name, value, options) => {
      written.push({ name, value, options });
    };

    const adapter = await buildCookieAdapter();

    adapter.setAll([{ name: "sb-auth-token", value: "refreshed", options: {} }]);

    expect(written).toEqual([
      { name: "sb-auth-token", value: "refreshed", options: {} },
    ]);
  });
});
