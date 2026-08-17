import { describe, expect, it } from "vitest";

import type { AdminAppointmentRecord } from "../../booking/admin-use-cases";
import { adjacentBusinessDate, buildAdminConsole, parseAdminConsoleQuery } from "./console";

const record = (status: AdminAppointmentRecord["status"], cents: number): AdminAppointmentRecord => ({
  id: `00000000-0000-4000-8000-00000000900${status === "CONFIRMED" ? "1" : status === "COMPLETED" ? "2" : "3"}`,
  customerId: "00000000-0000-4000-8000-000000009010",
  customerDisplayName: "Ada Customer",
  petId: "00000000-0000-4000-8000-000000009011",
  petName: "Biscuit",
  petBreed: "Cockapoo",
  petSize: "MEDIUM",
  groomerId: "20000000-0000-0000-0000-000000000001",
  groomerDisplayName: "Maya Chen",
  status,
  startsAt: new Date("2026-09-02T13:00:00.000Z"),
  serviceEndsAt: new Date("2026-09-02T14:00:00.000Z"),
  blockedUntil: new Date("2026-09-02T14:15:00.000Z"),
  subtotalCents: cents,
  services: [{ appointmentId: "00000000-0000-4000-8000-000000009001", serviceId: "10000000-0000-0000-0000-000000000001", serviceName: "Bath & Brush", serviceKind: "BASE", durationMinutes: 60, priceCents: cents }],
  completedAt: status === "COMPLETED" ? new Date("2026-09-02T14:00:00.000Z") : null,
  cancelledAt: status === "CANCELLED" ? new Date("2026-09-01T12:00:00.000Z") : null,
  statusChangedAt: new Date("2026-09-01T12:00:00.000Z"),
  statusChangedBy: "00000000-0000-4000-8000-000000009099",
});

describe("admin console presentation", () => {
  it("validates URL filters and defaults to the current business date", () => {
    expect(parseAdminConsoleQuery({
      date: "not-a-date",
      groomerId: "other-customer",
      cancelled: "hide",
    }, new Date("2026-08-15T02:00:00.000Z"))).toEqual({
      date: "2026-08-14",
      groomerId: null,
      showCancelled: false,
    });
  });

  it("navigates dates without using the server process timezone", () => {
    expect(adjacentBusinessDate("2026-01-01", -1)).toBe("2025-12-31");
    expect(adjacentBusinessDate("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("builds scannable rows and whole-day non-payment totals", () => {
    const consoleView = buildAdminConsole([
      record("CONFIRMED", 5500),
      record("COMPLETED", 4500),
      record("CANCELLED", 8500),
    ], "2026-09-02");

    expect(consoleView.heading).toBe("Wednesday 2 September");
    expect(consoleView.stats).toEqual({
      confirmed: 1,
      completed: 1,
      cancelled: 1,
      scheduledSubtotalLabel: "$100",
    });
    expect(consoleView.appointments[0]).toMatchObject({
      petName: "Biscuit",
      timeLabel: "9:00 AM",
      endTimeLabel: "10:00 AM",
      canTransition: true,
    });
  });
});
