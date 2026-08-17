import { describe, expect, it, vi } from "vitest";

import { AuthorizationRequiredError } from "../auth/guards";
import { createAdminBookingUseCases, type AdminAppointmentRecord } from "./admin-use-cases";

const appointment: AdminAppointmentRecord = {
  id: "00000000-0000-4000-8000-000000009001",
  customerId: "00000000-0000-4000-8000-000000009002",
  customerDisplayName: "Ada Customer",
  petId: "00000000-0000-4000-8000-000000009003",
  petName: "Biscuit",
  petBreed: "Cockapoo",
  petSize: "MEDIUM",
  groomerId: "20000000-0000-0000-0000-000000000001",
  groomerDisplayName: "Maya Chen",
  status: "CONFIRMED",
  startsAt: new Date("2026-11-01T14:00:00.000Z"),
  serviceEndsAt: new Date("2026-11-01T15:00:00.000Z"),
  blockedUntil: new Date("2026-11-01T15:15:00.000Z"),
  subtotalCents: 5500,
  services: [{
    appointmentId: "00000000-0000-4000-8000-000000009001",
    serviceId: "10000000-0000-0000-0000-000000000001",
    serviceName: "Bath & Brush",
    serviceKind: "BASE",
    durationMinutes: 60,
    priceCents: 5500,
  }],
  completedAt: null,
  cancelledAt: null,
  statusChangedAt: new Date("2026-10-01T12:00:00.000Z"),
  statusChangedBy: "00000000-0000-4000-8000-000000009002",
};

const repository = () => ({
  listAppointmentsInRange: vi.fn(async () => [appointment]),
  cancelConfirmedAppointment: vi.fn(async () => ({
    id: appointment.id,
    status: "CANCELLED" as const,
  })),
  completeConfirmedAppointment: vi.fn(async () => ({
    id: appointment.id,
    status: "COMPLETED" as const,
    completedAt: new Date("2026-11-01T16:00:00.000Z"),
    statusChangedAt: new Date("2026-11-01T16:00:00.000Z"),
    statusChangedBy: "00000000-0000-4000-8000-000000009099",
  })),
});

describe("admin booking use cases", () => {
  it("rejects a customer before reading the admin schedule", async () => {
    const repo = repository();
    const useCases = createAdminBookingUseCases({
      repository: repo,
      getCurrentActor: async () => ({ id: appointment.customerId, role: "CUSTOMER" }),
    });

    await expect(useCases.listDay({ date: "2026-11-01" })).rejects.toBeInstanceOf(AuthorizationRequiredError);
    expect(repo.listAppointmentsInRange).not.toHaveBeenCalled();
  });

  it("uses the business-local day boundary and optional groomer filter", async () => {
    const repo = repository();
    const useCases = createAdminBookingUseCases({
      repository: repo,
      getCurrentActor: async () => ({ id: "00000000-0000-4000-8000-000000009099", role: "ADMIN" }),
    });

    await expect(useCases.listDay({
      date: "2026-11-01",
      groomerId: "20000000-0000-0000-0000-000000000001",
    })).resolves.toEqual([appointment]);
    expect(repo.listAppointmentsInRange).toHaveBeenCalledWith({
      startsAt: new Date("2026-11-01T04:00:00.000Z"),
      endsAt: new Date("2026-11-02T05:00:00.000Z"),
      groomerId: "20000000-0000-0000-0000-000000000001",
    });
  });

  it("rejects a customer before an admin status mutation reaches persistence", async () => {
    const repo = repository();
    const useCases = createAdminBookingUseCases({
      repository: repo,
      getCurrentActor: async () => ({ id: appointment.customerId, role: "CUSTOMER" }),
    });

    await expect(useCases.completeAppointment(appointment.id)).rejects.toBeInstanceOf(AuthorizationRequiredError);
    expect(repo.completeConfirmedAppointment).not.toHaveBeenCalled();
    expect(repo.cancelConfirmedAppointment).not.toHaveBeenCalled();
  });

  it("allows only an admin to complete a confirmed appointment", async () => {
    const repo = repository();
    const useCases = createAdminBookingUseCases({
      repository: repo,
      getCurrentActor: async () => ({ id: "00000000-0000-4000-8000-000000009099", role: "ADMIN" }),
    });

    await expect(useCases.completeAppointment(appointment.id)).resolves.toMatchObject({ status: "COMPLETED" });
    expect(repo.completeConfirmedAppointment).toHaveBeenCalledWith(appointment.id);
  });
  it("requires admin authority for cancellation and delegates an opaque idempotency key", async () => {
    const repo = repository();
    const useCases = createAdminBookingUseCases({
      repository: repo,
      getCurrentActor: async () => ({ id: "00000000-0000-4000-8000-000000009099", role: "ADMIN" }),
    });

    await expect(useCases.cancelAppointment({
      appointmentId: appointment.id,
      idempotencyKey: "admin-cancel-intent",
    })).resolves.toMatchObject({ status: "CANCELLED" });
    expect(repo.cancelConfirmedAppointment).toHaveBeenCalledWith({
      appointmentId: appointment.id,
      idempotencyKey: "admin-cancel-intent",
    });
  });

});
