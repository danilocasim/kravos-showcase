import { describe, expect, it } from "vitest";

import { safeInternalNextPath } from "./next-path";

describe("safeInternalNextPath", () => {
  it("keeps a normal internal application path", () => {
    expect(safeInternalNextPath("/appointments?tab=past")).toBe("/appointments?tab=past");
  });

  it.each([
    "https://attacker.example",
    "//attacker.example",
    "/\\attacker.example",
    "/%5c%5cattacker.example",
    "/%2f%2fattacker.example",
  ])("rejects redirect target %s", (target) => {
    expect(safeInternalNextPath(target)).toBe("/appointments");
  });
});
