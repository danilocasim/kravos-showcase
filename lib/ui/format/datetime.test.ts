import { describe, expect, it } from "vitest";
import { formatAppointmentInstant, formatBusinessOffset } from "./datetime";

describe("business datetime formatting", () => {
  it("attributes a late-evening instant to the business day, not the UTC day", () => {
    expect(formatAppointmentInstant("2026-09-03T01:00:00.000Z")).toMatchObject({
      weekday: "Wed",
      day: "2",
      month: "Sep",
      dateLabel: "Wed 2 Sep",
      timeLabel: "9:00 PM",
    });
  });

  it("keeps eastern daylight and standard offsets distinct across the change", () => {
    expect(formatBusinessOffset("2026-07-01T16:00:00.000Z")).toBe("-04:00");
    expect(formatBusinessOffset("2026-12-01T17:00:00.000Z")).toBe("-05:00");
  });
});
