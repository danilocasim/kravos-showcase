import { describe, expect, it, vi } from "vitest";

import { AuthenticationRequiredError } from "../../auth/guards";
import {
  AppointmentCutoffError,
  AppointmentUnavailableError,
  PetUnavailableError,
  SlotUnavailableError,
} from "../../booking/use-cases";
import type {
  Appointment,
  AvailabilitySearchResult,
  Groomer,
  Pet,
  Service,
} from "../../booking/use-cases";
import {
  createBookingApiHandlers,
  type BookingApiUseCases,
} from "./booking-handlers";

const petId = "00000000-0000-4000-8000-000000003001";
const secondPetId = "00000000-0000-4000-8000-000000003002";
const appointmentId = "00000000-0000-4000-8000-000000003003";
const groomerId = "00000000-0000-4000-8000-000000003004";
const serviceId = "00000000-0000-4000-8000-000000003005";

const service: Service = {
  id: serviceId,
  name: "Bath & Brush",
  description: "Bath, drying, and brush-out.",
  kind: "BASE",
  isStandaloneEligible: false,
  durationMinutes: 60,
  priceCents: 5500,
  isActive: true,
};

const groomer: Groomer = {
  id: groomerId,
  displayName: "Maya Chen",
  bio: "Senior groomer",
  isActive: true,
};

const pet: Pet = {
  id: petId,
  ownerId: "00000000-0000-4000-8000-000000003006",
  name: "Milo",
  breed: "Golden Retriever",
  size: "LARGE",
  ageYears: 4,
  temperament: null,
  coatCondition: null,
  allergies: null,
  notes: null,
};

const appointment: Appointment = {
  id: appointmentId,
  customerId: pet.ownerId,
  petId,
  groomerId,
  status: "CONFIRMED",
  startsAt: new Date("2028-09-04T13:00:00.000Z"),
  serviceEndsAt: new Date("2028-09-04T14:00:00.000Z"),
  blockedUntil: new Date("2028-09-04T14:15:00.000Z"),
  subtotalCents: 5500,
  appliedBufferMinutes: 15,
  cancelledAt: null,
};

const availability: AvailabilitySearchResult = {
  timeZone: "America/New_York",
  totalDurationMinutes: 60,
  subtotalCents: 5500,
  slots: [
    {
      groomerId,
      startsAt: appointment.startsAt,
      serviceEndsAt: appointment.serviceEndsAt,
      blockedUntil: appointment.blockedUntil,
    },
  ],
};

const request = (
  path: string,
  method: string,
  body?: unknown,
  headers: HeadersInit = {},
): Request =>
  new Request(`https://pawandpolish.example${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

const readBody = async (response: Response): Promise<unknown> => response.json();

const createUseCases = (overrides: Partial<BookingApiUseCases> = {}) => {
  const requireAuthenticatedActor = vi.fn(async () => ({
    id: pet.ownerId,
    role: "CUSTOMER" as const,
  }));
  const useCases: BookingApiUseCases = {
    requireAuthenticatedActor,
    listActiveServices: vi.fn(async () => [service]),
    listActiveGroomers: vi.fn(async () => [groomer]),
    listMyPets: vi.fn(async () => [pet]),
    createMyPet: vi.fn(async () => pet),
    updateMyPet: vi.fn(async () => pet),
    deleteMyPet: vi.fn(async () => true),
    searchAvailability: vi.fn(async () => availability),
    listMyAppointments: vi.fn(async () => [appointment]),
    createAppointment: vi.fn(async () => appointment),
    rescheduleAppointment: vi.fn(async () => appointment),
    cancelAppointment: vi.fn(async () => ({
      ...appointment,
      status: "CANCELLED" as const,
      cancelledAt: new Date("2028-09-01T13:00:00.000Z"),
    })),
    ...overrides,
  };

  return {
    useCases,
    requireAuthenticatedActor,
    handlers: createBookingApiHandlers(useCases),
  };
};

describe("Task 9 booking API handlers", () => {
  it("requires verified authentication before invoking catalogue use cases", async () => {
    const rejectedAuthentication = vi.fn(async () => {
      throw new AuthenticationRequiredError();
    });
    const { handlers, useCases } = createUseCases({
      requireAuthenticatedActor: rejectedAuthentication,
    });

    const response = await handlers.listServices(request("/api/v1/services", "GET"));

    expect(response.status).toBe(401);
    await expect(readBody(response)).resolves.toEqual({
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required.",
        details: [],
      },
    });
    expect(rejectedAuthentication).toHaveBeenCalledOnce();
    expect(useCases.listActiveServices).not.toHaveBeenCalled();
  });

  it("serves the authenticated catalogue and groomer collection with stable data envelopes", async () => {
    const { handlers } = createUseCases();

    const servicesResponse = await handlers.listServices(request("/api/v1/services", "GET"));
    const groomersResponse = await handlers.listGroomers(request("/api/v1/groomers", "GET"));

    expect(servicesResponse.status).toBe(200);
    await expect(readBody(servicesResponse)).resolves.toEqual({
      data: {
        services: [
          {
            id: serviceId,
            name: "Bath & Brush",
            description: "Bath, drying, and brush-out.",
            kind: "BASE",
            isStandaloneEligible: false,
            durationMinutes: 60,
            priceCents: 5500,
          },
        ],
      },
    });
    await expect(readBody(groomersResponse)).resolves.toEqual({
      data: {
        groomers: [
          {
            id: groomerId,
            displayName: "Maya Chen",
            bio: "Senior groomer",
          },
        ],
      },
    });
  });

  it("serves the owner-scoped pet collection and delegates every pet operation through use cases", async () => {
    const { handlers, useCases } = createUseCases();
    const createInput = {
      name: "Baxter",
      breed: "Beagle",
      size: "MEDIUM",
      ageYears: 2,
      notes: "Nervous around dryers.",
    };

    const listResponse = await handlers.listPets(request("/api/v1/pets", "GET"));
    const createResponse = await handlers.createPet(request("/api/v1/pets", "POST", createInput));
    const updateResponse = await handlers.updatePet(
      request(`/api/v1/pets/${petId}`, "PATCH", { ageYears: 3 }),
      { petId },
    );
    const deleteResponse = await handlers.deletePet(
      request(`/api/v1/pets/${petId}`, "DELETE"),
      { petId },
    );

    expect(listResponse.status).toBe(200);
    await expect(readBody(listResponse)).resolves.toEqual({
      data: {
        pets: [
          {
            id: petId,
            name: "Milo",
            breed: "Golden Retriever",
            size: "LARGE",
            ageYears: 4,
            temperament: null,
            coatCondition: null,
            allergies: null,
            notes: null,
          },
        ],
      },
    });
    expect(createResponse.status).toBe(201);
    expect(updateResponse.status).toBe(200);
    await expect(readBody(deleteResponse)).resolves.toEqual({ data: { deleted: true } });
    expect(useCases.createMyPet).toHaveBeenCalledWith(createInput);
    expect(useCases.updateMyPet).toHaveBeenCalledWith(petId, { ageYears: 3 });
    expect(useCases.deleteMyPet).toHaveBeenCalledWith(petId);
  });

  it("accepts PostgreSQL-compatible deterministic catalogue UUIDs at the HTTP boundary", async () => {
    const seedGroomerId = "20000000-0000-0000-0000-000000000001";
    const seedServiceId = "10000000-0000-0000-0000-000000000001";
    const { handlers, useCases } = createUseCases();

    const response = await handlers.searchAvailability(
      request("/api/v1/availability/search", "POST", {
        petId,
        selectedServiceIds: [seedServiceId],
        groomerId: seedGroomerId,
        startsOn: "2028-09-04",
        endsOn: "2028-09-04",
      }),
    );

    expect(response.status).toBe(200);
    expect(useCases.searchAvailability).toHaveBeenCalledWith({
      petId,
      selectedServiceIds: [seedServiceId],
      groomerId: seedGroomerId,
      startsOn: "2028-09-04",
      endsOn: "2028-09-04",
    });
  });

  it("runs availability and each appointment lifecycle operation through the shared domain", async () => {
    const { handlers, useCases } = createUseCases();
    const availabilityInput = {
      petId,
      selectedServiceIds: [serviceId],
      groomerId,
      startsOn: "2028-09-04",
      endsOn: "2028-09-04",
    };
    const createInput = {
      petId,
      groomerId,
      selectedServiceIds: [serviceId],
      startsAt: "2028-09-04T13:00:00.000Z",
    };
    const idempotencyHeaders = { "Idempotency-Key": "create-appointment-1" };

    const availabilityResponse = await handlers.searchAvailability(
      request("/api/v1/availability/search", "POST", availabilityInput),
    );
    const appointmentsResponse = await handlers.listAppointments(
      request("/api/v1/appointments", "GET"),
    );
    const createResponse = await handlers.createAppointment(
      request("/api/v1/appointments", "POST", createInput, idempotencyHeaders),
    );
    const rescheduleResponse = await handlers.rescheduleAppointment(
      request(
        `/api/v1/appointments/${appointmentId}/reschedule`,
        "POST",
        {
          groomerId,
          selectedServiceIds: [serviceId],
          startsAt: "2028-09-04T15:00:00.000Z",
        },
        { "Idempotency-Key": "reschedule-appointment-1" },
      ),
      { appointmentId },
    );
    const cancelResponse = await handlers.cancelAppointment(
      request(
        `/api/v1/appointments/${appointmentId}/cancel`,
        "POST",
        undefined,
        { "Idempotency-Key": "cancel-appointment-1" },
      ),
      { appointmentId },
    );

    expect(availabilityResponse.status).toBe(200);
    expect(appointmentsResponse.status).toBe(200);
    expect(createResponse.status).toBe(201);
    expect(rescheduleResponse.status).toBe(200);
    expect(cancelResponse.status).toBe(200);
    await expect(readBody(appointmentsResponse)).resolves.toEqual({
      data: {
        appointments: [
          {
            id: appointmentId,
            petId,
            groomerId,
            status: "CONFIRMED",
            startsAt: "2028-09-04T13:00:00.000Z",
            serviceEndsAt: "2028-09-04T14:00:00.000Z",
            blockedUntil: "2028-09-04T14:15:00.000Z",
            subtotalCents: 5500,
            appliedBufferMinutes: 15,
            cancelledAt: null,
          },
        ],
      },
    });
    expect(useCases.searchAvailability).toHaveBeenCalledWith(availabilityInput);
    expect(useCases.createAppointment).toHaveBeenCalledWith({
      ...createInput,
      idempotencyKey: "create-appointment-1",
    });
    expect(useCases.rescheduleAppointment).toHaveBeenCalledWith({
      appointmentId,
      groomerId,
      selectedServiceIds: [serviceId],
      startsAt: "2028-09-04T15:00:00.000Z",
      idempotencyKey: "reschedule-appointment-1",
    });
    expect(useCases.cancelAppointment).toHaveBeenCalledWith({
      appointmentId,
      idempotencyKey: "cancel-appointment-1",
    });
  });

  it("returns the same PET_NOT_FOUND response for a selected inaccessible pet", async () => {
    const { handlers } = createUseCases({
      searchAvailability: async () => {
        throw new PetUnavailableError();
      },
    });

    const response = await handlers.searchAvailability(
      request("/api/v1/availability/search", "POST", {
        petId,
        selectedServiceIds: [serviceId],
        groomerId,
        startsOn: "2028-09-04",
        endsOn: "2028-09-04",
      }),
    );

    expect(response.status).toBe(404);
    await expect(readBody(response)).resolves.toEqual({
      error: {
        code: "PET_NOT_FOUND",
        message: "The selected pet was not found.",
        details: [],
      },
    });
  });

  it("does not expose an unclassified error merely because it has a status and code", async () => {
    const internalError = Object.assign(new Error("connection details: private"), {
      code: "POSTGREST_UNEXPECTED",
      status: 409,
    });
    const { handlers } = createUseCases({
      listActiveServices: async () => {
        throw internalError;
      },
    });

    const response = await handlers.listServices(request("/api/v1/services", "GET"));

    expect(response.status).toBe(500);
    await expect(readBody(response)).resolves.toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
        details: [],
      },
    });
  });

  it("maps domain authorization, missing, and idempotency failures without leaking internal fields", async () => {
    const { handlers } = createUseCases({
      rescheduleAppointment: async () => {
        throw new AppointmentUnavailableError();
      },
      cancelAppointment: async () => {
        throw new AppointmentCutoffError();
      },
    });

    const missingResponse = await handlers.rescheduleAppointment(
      request(
        `/api/v1/appointments/${appointmentId}/reschedule`,
        "POST",
        {
          groomerId,
          selectedServiceIds: [serviceId],
          startsAt: "2028-09-04T15:00:00.000Z",
        },
        { "Idempotency-Key": "missing-appointment-key" },
      ),
      { appointmentId },
    );
    const forbiddenResponse = await handlers.cancelAppointment(
      request(
        `/api/v1/appointments/${appointmentId}/cancel`,
        "POST",
        undefined,
        { "Idempotency-Key": "cutoff-key" },
      ),
      { appointmentId },
    );

    expect(missingResponse.status).toBe(404);
    await expect(readBody(missingResponse)).resolves.toEqual({
      error: {
        code: "APPOINTMENT_NOT_FOUND",
        message: "The requested appointment was not found.",
        details: [],
      },
    });
    expect(forbiddenResponse.status).toBe(403);
    await expect(readBody(forbiddenResponse)).resolves.toEqual({
      error: {
        code: "CANCELLATION_CUTOFF_PASSED",
        message: "This appointment can no longer be changed online.",
        details: [],
      },
    });
  });

  it("uses one public error envelope for boundary validation, authentication, missing records, and conflicts", async () => {
    const { handlers, useCases } = createUseCases({
      listActiveServices: async () => {
        throw new AuthenticationRequiredError();
      },
      createAppointment: vi.fn(async () => {
        throw new SlotUnavailableError();
      }),
      updateMyPet: async () => null,
    });

    const invalidResponse = await handlers.searchAvailability(
      request("/api/v1/availability/search", "POST", { petId: "not-a-uuid" }),
    );
    const unauthenticatedResponse = await handlers.listServices(
      request("/api/v1/services", "GET"),
    );
    const missingPetResponse = await handlers.updatePet(
      request(`/api/v1/pets/${secondPetId}`, "PATCH", { ageYears: 3 }),
      { petId: secondPetId },
    );
    const missingKeyResponse = await handlers.createAppointment(
      request("/api/v1/appointments", "POST", {
        petId,
        groomerId,
        selectedServiceIds: [serviceId],
        startsAt: "2028-09-04T13:00:00.000Z",
      }),
    );
    const conflictResponse = await handlers.createAppointment(
      request(
        "/api/v1/appointments",
        "POST",
        {
          petId,
          groomerId,
          selectedServiceIds: [serviceId],
          startsAt: "2028-09-04T13:00:00.000Z",
        },
        { "Idempotency-Key": "conflict-key" },
      ),
    );

    expect(invalidResponse.status).toBe(422);
    await expect(readBody(invalidResponse)).resolves.toMatchObject({
      error: { code: "VALIDATION_ERROR", details: expect.any(Array) },
    });
    expect(unauthenticatedResponse.status).toBe(401);
    await expect(readBody(unauthenticatedResponse)).resolves.toEqual({
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required.",
        details: [],
      },
    });
    expect(missingPetResponse.status).toBe(404);
    await expect(readBody(missingPetResponse)).resolves.toMatchObject({
      error: { code: "PET_NOT_FOUND", details: [] },
    });
    expect(missingKeyResponse.status).toBe(422);
    await expect(readBody(missingKeyResponse)).resolves.toMatchObject({
      error: { code: "VALIDATION_ERROR", details: expect.any(Array) },
    });
    expect(conflictResponse.status).toBe(409);
    await expect(readBody(conflictResponse)).resolves.toEqual({
      error: {
        code: "SLOT_UNAVAILABLE",
        message: "This appointment time is no longer available.",
        details: [],
      },
    });
    expect(useCases.createAppointment).toHaveBeenCalledTimes(1);
  });
});
