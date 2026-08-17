import { describe, expect, it } from "vitest";
import { groupSlotsIntoDays } from "./slot-days";

describe("groupSlotsIntoDays", () => {
  it("collapses slots that share a start instant across groomers into one time", () => {
    const days = groupSlotsIntoDays([
      { groomerId: "groomer-z", startsAt: "2026-09-02T14:15:00.000Z", serviceEndsAt: "2026-09-02T15:15:00.000Z", blockedUntil: "2026-09-02T15:30:00.000Z" },
      { groomerId: "groomer-a", startsAt: "2026-09-02T14:15:00.000Z", serviceEndsAt: "2026-09-02T15:15:00.000Z", blockedUntil: "2026-09-02T15:30:00.000Z" },
    ]);

    expect(days).toHaveLength(1);
    expect(days[0]?.slots).toEqual([
      expect.objectContaining({
        groomerId: "groomer-a",
        startsAt: "2026-09-02T14:15:00.000Z",
        timeLabel: "10:15 AM",
      }),
    ]);
  });
});
