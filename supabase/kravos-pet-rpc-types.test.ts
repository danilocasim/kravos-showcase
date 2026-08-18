import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260818093000_kravos_pet_rpc_http_types.sql",
);

describe("Kravos pet-create RPC", () => {
  it("accepts JSON-native size and age parameters before casting internally", async () => {
    const migration = await readFile(migrationPath, "utf8");

    expect(migration).toContain("requested_size text");
    expect(migration).toContain("requested_age_years integer");
    expect(migration).toContain("requested_size::public.pet_size");
    expect(migration).toContain("requested_age_years::smallint");
  });
});
