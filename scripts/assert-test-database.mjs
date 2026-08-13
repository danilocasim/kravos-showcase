import { assertSafeTestDatabase } from "../tests/test-database-safety.mjs";

const connectionString = process.env.TEST_DATABASE_URL;
if (connectionString === undefined || connectionString === "") {
  throw new Error("Set TEST_DATABASE_URL to a disposable Supabase-compatible test database.");
}

await assertSafeTestDatabase(connectionString);
