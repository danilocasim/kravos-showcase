import { defineConfig, devices } from "@playwright/test";

import { getLocalSupabaseConfig } from "./e2e/local-supabase";

/* Keep browser tests isolated from a developer's regular `pnpm dev` server,
   which may be using a hosted Supabase project from `.env.local`. */
const e2ePort = 3100;
const baseUrl = `http://127.0.0.1:${e2ePort}`;

/* Resolved from the running local stack rather than from .env.local, which points
   at whichever project the developer works against. This module is evaluated in
   the runner and in every worker, so publishing the values on process.env makes
   them available to the fixtures without writing a key to disk. */
const supabase = getLocalSupabaseConfig();

process.env.E2E_SUPABASE_URL = supabase.apiUrl;
process.env.E2E_SUPABASE_PUBLISHABLE_KEY = supabase.publishableKey;
process.env.E2E_SUPABASE_SERVICE_ROLE_KEY = supabase.serviceRoleKey;

export default defineConfig({
  testDir: "./e2e",
  /* The local database is shared state: the suite creates appointments that
     consume real slots, so tests run one at a time. */
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: baseUrl,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: `pnpm exec next start --port ${e2ePort}`,
    url: baseUrl,
    reuseExistingServer: false,
    /* Turbopack compiles each route on first request, so a cold run's first
       navigation can exceed the 60 second default. */
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: supabase.apiUrl,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: supabase.publishableKey,
    },
  },
});
