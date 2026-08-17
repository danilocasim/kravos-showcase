import { describe, expect, it } from "vitest";
import { canChangeAppointment } from "./change-window";

describe("canChangeAppointment", () => {
  it("blocks a change exactly twenty-four hours before the start", () => {
    expect(
      canChangeAppointment("2026-09-02T14:00:00.000Z", "2026-09-01T14:00:00.000Z"),
    ).toBe(false);
    expect(
      canChangeAppointment("2026-09-02T14:00:00.001Z", "2026-09-01T14:00:00.000Z"),
    ).toBe(true);
  });
});
