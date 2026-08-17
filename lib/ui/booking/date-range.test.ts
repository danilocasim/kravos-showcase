import { describe, expect, it } from "vitest";
import { nextBookableWeek } from "./date-range";

describe("nextBookableWeek", () => {
  it("returns Monday through Saturday at least two weeks ahead", () => {
    expect(nextBookableWeek(new Date("2026-08-14T16:00:00.000Z"))).toEqual({
      startsOn: "2026-08-31",
      endsOn: "2026-09-05",
    });
  });
});
