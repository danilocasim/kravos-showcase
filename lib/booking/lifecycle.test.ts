import { describe, expect, it, vi } from "vitest";

import type { Appointment, BookingRepository } from "./use-cases";
import {
  AppointmentLifecycleValidationError,
  SlotUnavailableError,
  createBookingUseCases,
} from "./use-cases";

const customerId = "00000000-0000-4000-8000-000000001101";
const petId = "00000000-0000-4000-8000-000000001102";
const appointmentId = "00000000-0000-4000-8000-000000001103";
const groomerId = "00000000-0000-4000-8000-000000001104";
const serviceId = "00000000-0000-4000-8000-000000001105";

const appointment: Appointment = {
  id: appointmentId,
  customerId,
  petId,
  groomerId,
  status: "CONFIRMED",
  startsAt: new Date("2026-09-07T13:00:00.000Z"),
  serviceEndsAt: new Date("2026-09-07T14:00:00.000Z"),
  blockedUntil: new Date("2026-09-07T14:15:00.000Z"),
  subtotalCents: 5500,
  appliedBufferMinutes: 15,
  cancelledAt: null,
};

const createRepository = (overrides: Partial<BookingRepository> = {}) => {
  const createConfirmedAppointment = vi.fn(async () => appointment);
  const rescheduleConfirmedAppointment = vi.fn(async () => appointment);
  const cancelConfirmedAppointment = vi.fn(async () => ({
    ...appointment,
    status: "CANCELLED" as const,
    cancelledAt: new Date("2026-09-01T12:00:00.000Z"),
  }));

  const repository: BookingRepository = {
    listServices: async () => [],
    listServiceCompatibility: async () => [],
    listGroomers: async () => [],
    listGroomerServiceQualifications: async () => [],
    listGroomerWorkingHours: async () => [],
    listGroomerTimeOff: async () => [],
    listConfirmedAppointmentBlocks: async () => [],
    listPetsByOwner: async () => [],
    getPetByOwner: async () => null,
    createPet: async () => {
      throw new Error("not needed");
    },
    updatePetByOwner: async () => null,
    deletePetByOwner: async () => false,
    createConfirmedAppointment,
    rescheduleConfirmedAppointment,
    cancelConfirmedAppointment,
    listAppointmentsByCustomer: async () => [],
    ...overrides,
  };

  return {
    repository,
    createConfirmedAppointment,
    rescheduleConfirmedAppointment,
    cancelConfirmedAppointment,
  };
};

const createUseCases = (overrides: Partial<BookingRepository> = {}) => {
  const fixture = createRepository(overrides);
  const getCurrentActor = vi.fn(async () => ({
    id: customerId,
    role: "CUSTOMER" as const,
  }));

  return {
    ...fixture,
    getCurrentActor,
    useCases: createBookingUseCases({
      repository: fixture.repository,
      getCurrentActor,
    }),
  };
};

const createInput = {
  petId,
  groomerId,
  selectedServiceIds: [serviceId],
  startsAt: "2026-09-07T13:00:00.000Z",
  idempotencyKey: "00000000-0000-4000-8000-000000001101",
};

describe("atomic appointment lifecycle use cases", () => {
  it("requires verified server identity and delegates only IDs plus requested start to atomic create", async () => {
    const { useCases, getCurrentActor, createConfirmedAppointment } =
      createUseCases();

    await expect(useCases.createAppointment(createInput)).resolves.toEqual(
      appointment,
    );

    expect(getCurrentActor).toHaveBeenCalledTimes(1);
    expect(createConfirmedAppointment).toHaveBeenCalledWith(createInput);
  });

  it("delegates reschedule and cancellation to the same atomic database boundary", async () => {
    const {
      useCases,
      rescheduleConfirmedAppointment,
      cancelConfirmedAppointment,
    } = createUseCases();
    const rescheduleInput = {
      appointmentId,
      groomerId,
      selectedServiceIds: [serviceId],
      startsAt: "2026-09-08T13:00:00.000Z",
      idempotencyKey: "00000000-0000-4000-8000-000000001102",
    };

    await expect(useCases.rescheduleAppointment(rescheduleInput)).resolves.toEqual(
      appointment,
    );
    const cancelInput = {
      appointmentId,
      idempotencyKey: "00000000-0000-4000-8000-000000001103",
    };
    await expect(useCases.cancelAppointment(cancelInput)).resolves.toMatchObject({
      id: appointmentId,
      status: "CANCELLED",
    });

    expect(rescheduleConfirmedAppointment).toHaveBeenCalledWith(rescheduleInput);
    expect(cancelConfirmedAppointment).toHaveBeenCalledWith(cancelInput);
  });

  it("requires and delegates an idempotency key for every appointment mutation", async () => {
    const {
      useCases,
      createConfirmedAppointment,
      rescheduleConfirmedAppointment,
      cancelConfirmedAppointment,
    } = createUseCases();
    const idempotencyKey = "00000000-0000-4000-8000-000000001106";

    await expect(
      useCases.createAppointment({ ...createInput, idempotencyKey }),
    ).resolves.toEqual(appointment);
    await expect(
      useCases.rescheduleAppointment({
        appointmentId,
        groomerId,
        selectedServiceIds: [serviceId],
        startsAt: "2026-09-08T13:00:00.000Z",
        idempotencyKey,
      }),
    ).resolves.toEqual(appointment);
    await expect(
      useCases.cancelAppointment({ appointmentId, idempotencyKey }),
    ).resolves.toMatchObject({ id: appointmentId, status: "CANCELLED" });

    expect(createConfirmedAppointment).toHaveBeenCalledWith({
      ...createInput,
      idempotencyKey,
    });
    expect(rescheduleConfirmedAppointment).toHaveBeenCalledWith({
      appointmentId,
      groomerId,
      selectedServiceIds: [serviceId],
      startsAt: "2026-09-08T13:00:00.000Z",
      idempotencyKey,
    });
    expect(cancelConfirmedAppointment).toHaveBeenCalledWith({
      appointmentId,
      idempotencyKey,
    });
  });

  it("accepts an opaque idempotency key suitable for the HTTP header contract", async () => {
    const { useCases, createConfirmedAppointment } = createUseCases();
    const idempotencyKey = "booking-create-retry-2026-09-07-1";

    await expect(
      useCases.createAppointment({ ...createInput, idempotencyKey }),
    ).resolves.toEqual(appointment);
    expect(createConfirmedAppointment).toHaveBeenCalledWith({
      ...createInput,
      idempotencyKey,
    });
  });

  it("rejects missing or malformed idempotency keys before reaching the transaction", async () => {
    const { useCases, createConfirmedAppointment } = createUseCases();

    const inputWithoutKey = {
      petId,
      groomerId,
      selectedServiceIds: [serviceId],
      startsAt: "2026-09-07T13:00:00.000Z",
    };
    await expect(useCases.createAppointment(inputWithoutKey)).rejects.toBeInstanceOf(
      AppointmentLifecycleValidationError,
    );
    await expect(
      useCases.createAppointment({ ...createInput, idempotencyKey: "   " }),
    ).rejects.toBeInstanceOf(AppointmentLifecycleValidationError);
    await expect(
      useCases.createAppointment({ ...createInput, idempotencyKey: "x".repeat(256) }),
    ).rejects.toBeInstanceOf(AppointmentLifecycleValidationError);
    expect(createConfirmedAppointment).not.toHaveBeenCalled();
  });

  it("rejects caller-supplied calculated values before reaching the transaction", async () => {
    const { useCases, createConfirmedAppointment } = createUseCases();

    await expect(
      useCases.createAppointment({ ...createInput, subtotalCents: 1 }),
    ).rejects.toBeInstanceOf(AppointmentLifecycleValidationError);
    expect(createConfirmedAppointment).not.toHaveBeenCalled();
  });

  it("preserves a stale-slot conflict as a predictable 409", async () => {
    const { useCases } = createUseCases({
      createConfirmedAppointment: async () => {
        throw new SlotUnavailableError();
      },
    });

    await expect(useCases.createAppointment(createInput)).rejects.toMatchObject({
      code: "SLOT_UNAVAILABLE",
      status: 409,
    });
  });
});
