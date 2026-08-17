import { describe, expect, it } from "vitest";
import { buildBookingSummary } from "./summary";

describe("buildBookingSummary", () => {
  it("formats totals already derived by the server without recalculating them", () => {
    expect(buildBookingSummary({ subtotalCents: 8500, totalDurationMinutes: 90 })).toEqual({
      subtotalLabel: "$85",
      durationLabel: "1 hr 30 min",
    });
  });
});
