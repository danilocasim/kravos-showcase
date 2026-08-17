import { getLocalSupabaseConfig } from "../local-supabase";

/**
 * Supabase connection values as seen by a Playwright worker.
 *
 * `playwright.config.ts` resolves the local stack once and publishes the values
 * on `process.env`; the config module is re-evaluated in every worker, so they
 * are already present here. Shelling out again is only a fallback for a fixture
 * imported outside a Playwright run.
 */

export interface E2eSupabaseClientConfig {
  readonly apiUrl: string;
  readonly publishableKey: string;
  readonly serviceRoleKey: string;
}

/**
 * Reads the local stack's URL and keys for a test fixture.
 *
 * @returns The API URL, publishable key, and service-role key.
 */
export const getLocalSupabaseClientConfig = (): E2eSupabaseClientConfig => {
  const apiUrl = process.env.E2E_SUPABASE_URL;
  const publishableKey = process.env.E2E_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;

  if (
    apiUrl !== undefined &&
    publishableKey !== undefined &&
    serviceRoleKey !== undefined
  ) {
    return { apiUrl, publishableKey, serviceRoleKey };
  }

  const config = getLocalSupabaseConfig();

  return {
    apiUrl: config.apiUrl,
    publishableKey: config.publishableKey,
    serviceRoleKey: config.serviceRoleKey,
  };
};
