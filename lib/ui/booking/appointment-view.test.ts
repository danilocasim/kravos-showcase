import { describe, expect, it } from "vitest";
import { buildAppointmentViews } from "./appointment-view";

describe("buildAppointmentViews", () => {
  it("joins owned records to snapshots and locks confirmed visits at the cutoff", () => {
    const views = buildAppointmentViews({
      now: "2026-09-01T14:00:00.000Z",
      appointments: [{ id: "a1", petId: "p1", groomerId: "g1", status: "CONFIRMED", startsAt: "2026-09-02T14:00:00.000Z", serviceEndsAt: "2026-09-02T15:00:00.000Z", subtotalCents: 5500 }],
      services: [{ appointmentId: "a1", serviceName: "Bath & Brush" }],
      pets: [{ id: "p1", name: "Biscuit" }],
      groomers: [{ id: "g1", displayName: "Maya Chen" }],
    });

    expect(views[0]).toMatchObject({ petName: "Biscuit", groomerName: "Maya Chen", serviceNames: ["Bath & Brush"], changeable: false });
  });
});
