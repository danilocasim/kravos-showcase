import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const configPath = resolve(process.cwd(), "supabase/config.toml");

describe("production Supabase auth configuration", () => {
  it("auto-confirms showcase signups without the rate-limited email provider", async () => {
    const config = await readFile(configPath, "utf8");

    expect(config).toContain(
      "[remotes.production.auth.email]\nenable_confirmations = false",
    );
  });
});
