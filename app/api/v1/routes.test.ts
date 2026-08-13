import { beforeEach, describe, expect, it, vi } from "vitest";

const apiHandlers = vi.hoisted(() => ({
  listServices: vi.fn(async () => new Response(null, { status: 200 })),
  listGroomers: vi.fn(async () => new Response(null, { status: 200 })),
  listPets: vi.fn(async () => new Response(null, { status: 200 })),
  createPet: vi.fn(async () => new Response(null, { status: 201 })),
  updatePet: vi.fn(async () => new Response(null, { status: 200 })),
  deletePet: vi.fn(async () => new Response(null, { status: 200 })),
  searchAvailability: vi.fn(async () => new Response(null, { status: 200 })),
  listAppointments: vi.fn(async () => new Response(null, { status: 200 })),
  createAppointment: vi.fn(async () => new Response(null, { status: 201 })),
  rescheduleAppointment: vi.fn(async () => new Response(null, { status: 200 })),
  cancelAppointment: vi.fn(async () => new Response(null, { status: 200 })),
}));

const createSupabaseBookingApiHandlers = vi.hoisted(() =>
  vi.fn(async () => apiHandlers),
);

vi.mock("../../../lib/api/v1/server", () => ({
  createSupabaseBookingApiHandlers,
}));

import { GET as getGroomers } from "./groomers/route";
import { POST as searchAvailability } from "./availability/search/route";
import {
  GET as getAppointments,
  POST as createAppointment,
} from "./appointments/route";
import { POST as cancelAppointment } from "./appointments/[appointmentId]/cancel/route";
import { POST as rescheduleAppointment } from "./appointments/[appointmentId]/reschedule/route";
import { DELETE as deletePet, PATCH as updatePet } from "./pets/[petId]/route";
import { GET as getPets, POST as createPet } from "./pets/route";
import { GET as getServices } from "./services/route";
import {
  AppointmentCutoffError,
  AppointmentUnavailableError,
  SlotUnavailableError,
} from "../../../lib/booking/use-cases";

const request = (
  path: string,
  method: string,
  body?: unknown,
  headers: HeadersInit = {},
) =>
  new Request(`https://pawandpolish.example${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

const petId = "00000000-0000-4000-8000-000000004001";
const appointmentId = "00000000-0000-4000-8000-000000004002";
const groomerId = "00000000-0000-4000-8000-000000004003";
const serviceId = "00000000-0000-4000-8000-000000004004";
const appointmentPayload = {
  petId,
  groomerId,
  selectedServiceIds: [serviceId],
  startsAt: "2028-09-04T13:00:00.000Z",
};

beforeEach(() => {
  createSupabaseBookingApiHandlers.mockClear();
  for (const handler of Object.values(apiHandlers)) {
    handler.mockClear();
  }
});

describe("/api/v1 Route Handlers", () => {
  it("adapts every public API path to the shared authenticated handler factory", async () => {
    const servicesRequest = request("/api/v1/services", "GET");
    const groomersRequest = request("/api/v1/groomers", "GET");
    const petsRequest = request("/api/v1/pets", "GET");
    const createPetRequest = request("/api/v1/pets", "POST");
    const updatePetRequest = request(`/api/v1/pets/${petId}`, "PATCH");
    const deletePetRequest = request(`/api/v1/pets/${petId}`, "DELETE");
    const availabilityRequest = request("/api/v1/availability/search", "POST");
    const appointmentsRequest = request("/api/v1/appointments", "GET");
    const createAppointmentRequest = request("/api/v1/appointments", "POST");
    const rescheduleRequest = request(
      `/api/v1/appointments/${appointmentId}/reschedule`,
      "POST",
    );
    const cancelRequest = request(
      `/api/v1/appointments/${appointmentId}/cancel`,
      "POST",
    );

    await expect(getServices(servicesRequest)).resolves.toHaveProperty("status", 200);
    await expect(getGroomers(groomersRequest)).resolves.toHaveProperty("status", 200);
    await expect(getPets(petsRequest)).resolves.toHaveProperty("status", 200);
    await expect(createPet(createPetRequest)).resolves.toHaveProperty("status", 201);
    await expect(
      updatePet(updatePetRequest, { params: Promise.resolve({ petId }) }),
    ).resolves.toHaveProperty("status", 200);
    await expect(
      deletePet(deletePetRequest, { params: Promise.resolve({ petId }) }),
    ).resolves.toHaveProperty("status", 200);
    await expect(searchAvailability(availabilityRequest)).resolves.toHaveProperty(
      "status",
      200,
    );
    await expect(getAppointments(appointmentsRequest)).resolves.toHaveProperty(
      "status",
      200,
    );
    await expect(createAppointment(createAppointmentRequest)).resolves.toHaveProperty(
      "status",
      201,
    );
    await expect(
      rescheduleAppointment(rescheduleRequest, {
        params: Promise.resolve({ appointmentId }),
      }),
    ).resolves.toHaveProperty("status", 200);
    await expect(
      cancelAppointment(cancelRequest, {
        params: Promise.resolve({ appointmentId }),
      }),
    ).resolves.toHaveProperty("status", 200);

    expect(createSupabaseBookingApiHandlers).toHaveBeenCalledTimes(11);
    expect(apiHandlers.listServices).toHaveBeenCalledWith(servicesRequest);
    expect(apiHandlers.listGroomers).toHaveBeenCalledWith(groomersRequest);
    expect(apiHandlers.listPets).toHaveBeenCalledWith(petsRequest);
    expect(apiHandlers.createPet).toHaveBeenCalledWith(createPetRequest);
    expect(apiHandlers.updatePet).toHaveBeenCalledWith(updatePetRequest, { petId });
    expect(apiHandlers.deletePet).toHaveBeenCalledWith(deletePetRequest, { petId });
    expect(apiHandlers.searchAvailability).toHaveBeenCalledWith(availabilityRequest);
    expect(apiHandlers.listAppointments).toHaveBeenCalledWith(appointmentsRequest);
    expect(apiHandlers.createAppointment).toHaveBeenCalledWith(createAppointmentRequest);
    expect(apiHandlers.rescheduleAppointment).toHaveBeenCalledWith(rescheduleRequest, {
      appointmentId,
    });
    expect(apiHandlers.cancelAppointment).toHaveBeenCalledWith(cancelRequest, {
      appointmentId,
    });
  });

  it("returns stable HTTP errors for unauthenticated, invalid, unavailable, missing, and forbidden operations", async () => {
    apiHandlers.listServices.mockResolvedValueOnce(
      Response.json(
        {
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "Authentication is required.",
            details: [],
          },
        },
        { status: 401 },
      ),
    );
    apiHandlers.searchAvailability.mockResolvedValueOnce(
      Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Request validation failed.",
            details: [
              {
                code: "invalid_format",
                message: "Invalid UUID",
                path: "petId",
              },
            ],
          },
        },
        { status: 422 },
      ),
    );
    apiHandlers.createAppointment.mockResolvedValueOnce(
      Response.json(
        {
          error: {
            code: new SlotUnavailableError().code,
            message: new SlotUnavailableError().message,
            details: [],
          },
        },
        { status: 409 },
      ),
    );
    apiHandlers.rescheduleAppointment.mockResolvedValueOnce(
      Response.json(
        {
          error: {
            code: new AppointmentUnavailableError().code,
            message: new AppointmentUnavailableError().message,
            details: [],
          },
        },
        { status: 404 },
      ),
    );
    apiHandlers.cancelAppointment.mockResolvedValueOnce(
      Response.json(
        {
          error: {
            code: new AppointmentCutoffError().code,
            message: new AppointmentCutoffError().message,
            details: [],
          },
        },
        { status: 403 },
      ),
    );

    const unauthenticated = await getServices(request("/api/v1/services", "GET"));
    const invalid = await searchAvailability(
      request("/api/v1/availability/search", "POST", { petId: "not-a-uuid" }),
    );
    const conflict = await createAppointment(
      request(
        "/api/v1/appointments",
        "POST",
        appointmentPayload,
        { "Idempotency-Key": "create-key" },
      ),
    );
    const missing = await rescheduleAppointment(
      request(
        `/api/v1/appointments/${appointmentId}/reschedule`,
        "POST",
        {
          groomerId,
          selectedServiceIds: [serviceId],
          startsAt: "2028-09-04T14:00:00.000Z",
        },
        { "Idempotency-Key": "reschedule-key" },
      ),
      { params: Promise.resolve({ appointmentId }) },
    );
    const forbidden = await cancelAppointment(
      request(
        `/api/v1/appointments/${appointmentId}/cancel`,
        "POST",
        undefined,
        { "Idempotency-Key": "cancel-key" },
      ),
      { params: Promise.resolve({ appointmentId }) },
    );

    expect(unauthenticated.status).toBe(401);
    await expect(unauthenticated.json()).resolves.toMatchObject({
      error: { code: "AUTHENTICATION_REQUIRED", details: [] },
    });
    expect(invalid.status).toBe(422);
    await expect(invalid.json()).resolves.toMatchObject({
      error: { code: "VALIDATION_ERROR", details: expect.any(Array) },
    });
    expect(conflict.status).toBe(409);
    await expect(conflict.json()).resolves.toMatchObject({
      error: { code: "SLOT_UNAVAILABLE", details: [] },
    });
    expect(missing.status).toBe(404);
    await expect(missing.json()).resolves.toMatchObject({
      error: { code: "APPOINTMENT_NOT_FOUND", details: [] },
    });
    expect(forbidden.status).toBe(403);
    await expect(forbidden.json()).resolves.toMatchObject({
      error: { code: "CANCELLATION_CUTOFF_PASSED", details: [] },
    });
  });

});
