import { Client } from "pg";

import { getLocalSupabaseConfig } from "../local-supabase";

/**
 * Direct Postgres access for test setup.
 *
 * The RLS migration grants table privileges to `authenticated` only, so the
 * service-role key cannot read or write these tables through PostgREST. That is
 * a deliberate property of the schema and is left alone: the application has no
 * service-role path at all. Fixtures therefore talk to Postgres directly, the
 * same way `scripts/test-schema.sh` and the concurrency test already do.
 *
 * Supabase Auth is a separate service, so creating users still goes through the
 * admin client in `supabase-admin.ts`.
 */

/**
 * Runs a query against the local development database.
 *
 * @param sql - The statement to run.
 * @param values - Positional parameters.
 * @returns The returned rows.
 */
export const query = async <TRow = Record<string, unknown>>(
  sql: string,
  values: ReadonlyArray<unknown> = [],
): Promise<ReadonlyArray<TRow>> => {
  const client = new Client({ connectionString: getLocalSupabaseConfig().databaseUrl });

  await client.connect();

  try {
    const result = await client.query(sql, [...values]);

    return result.rows as ReadonlyArray<TRow>;
  } finally {
    await client.end();
  }
};
