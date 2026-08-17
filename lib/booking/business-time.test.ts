import { describe, expect, it } from "vitest";

import {
  businessTimeZone,
  cleanupBufferMinutes,
  maximumAvailabilitySearchDays,
  slotIntervalMinutes,
} from "./business-time";

describe("business time constants", () => {
  it("exposes the approved business timezone, cleanup buffer, and slot interval", () => {
    expect(businessTimeZone).toBe("America/New_York");
    expect(cleanupBufferMinutes).toBe(15);
    expect(slotIntervalMinutes).toBe(15);
    expect(maximumAvailabilitySearchDays).toBe(31);
  });

  it("declares no imports so client formatters can share it with the server domain", async () => {
    const { readFile } = await import("node:fs/promises");
    const source = await readFile(
      new URL("./business-time.ts", import.meta.url),
      "utf8",
    );

    expect(source).not.toMatch(/^\s*import\b/m);
  });
});
