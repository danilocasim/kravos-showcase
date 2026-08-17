import { describe, expect, it } from "vitest";
import { buildAddOnAvailability } from "./add-on-availability";

describe("buildAddOnAvailability", () => {
  it("derives selectability only from persisted compatibility pairs", () => {
    const result = buildAddOnAvailability(
      "base-full",
      [
        { id: "nails", name: "Nail Trim" },
        { id: "deshed", name: "De-shedding Treatment" },
      ],
      [{ baseServiceId: "base-full", addOnServiceId: "deshed" }],
    );

    expect(result).toEqual([
      { serviceId: "nails", selectable: false, reason: "Already included in Full Groom" },
      { serviceId: "deshed", selectable: true, reason: null },
    ]);
  });
});
