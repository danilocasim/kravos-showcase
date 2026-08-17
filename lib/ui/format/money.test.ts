import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("omits zero cents but preserves nonzero cents", () => {
    expect(formatMoney(5500)).toBe("$55");
    expect(formatMoney(5550)).toBe("$55.50");
  });
});
