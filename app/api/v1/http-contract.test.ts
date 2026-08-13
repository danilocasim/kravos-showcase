import { createRequire } from "node:module";

import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import contract from "../../../doc/openapi.v1.json";

import type { AuthenticatedActor } from "../../../lib/auth/guards";
import type {
  Appointment,
  AvailabilitySearchResult,
  Groomer,
  Pet,
  Service,
} from "../../../lib/booking/use-cases";
import {
  AppointmentCutoffError,
  SlotUnavailableError,
} from "../../../lib/booking/use-cases";
import {
  createBookingApiHandlers,
  type BookingApiUseCases,
} from "../../../lib/api/v1/booking-handlers";

const createSupabaseBookingApiHandlers = vi.hoisted(() => vi.fn());
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

const customerId = "00000000-0000-4000-8000-000000004101";
const petId = "00000000-0000-4000-8000-000000004102";
const appointmentId = "00000000-0000-4000-8000-000000004103";
const groomerId = "00000000-0000-4000-8000-000000004104";
const serviceId = "00000000-0000-4000-8000-000000004105";

const service: Service = {
  id: serviceId,
  name: "Bath & Brush",
  description: "Bath and brush-out.",
  kind: "BASE",
  isStandaloneEligible: false,
  durationMinutes: 60,
  priceCents: 5500,
  isActive: true,
};
const groomer: Groomer = {
  id: groomerId,
  displayName: "Maya",
  bio: null,
  isActive: true,
};
const pet: Pet = {
  id: petId,
  ownerId: customerId,
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
  customerId,
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

const appointmentInput = {
  petId,
  groomerId,
  selectedServiceIds: [serviceId],
  startsAt: "2028-09-04T13:00:00.000Z",
};

const require = createRequire(import.meta.url);
const OpenApiResponseValidator = require("openapi-response-validator").default as new (input: {
  readonly responses: Readonly<Record<string, unknown>>;
  readonly components: unknown;
}) => {
  readonly validateResponse: (
    statusCode: number,
    response: unknown,
  ) => { readonly message: string; readonly errors?: unknown[] } | undefined;
};

type ContractOperation = {
  readonly responses: Readonly<Record<string, unknown>>;
};

const resolveReference = (reference: string): unknown => {
  const path = reference.replace(/^#\//, "").split("/");
  let value: unknown = contract;

  for (const segment of path) {
    if (typeof value !== "object" || value === null || !(segment in value)) {
      throw new Error(`OpenAPI reference cannot be resolved: ${reference}`);
    }
    value = (value as Record<string, unknown>)[segment];
  }

  return value;
};

const resolveResponse = (response: unknown): unknown => {
  if (typeof response !== "object" || response === null) {
    throw new Error("OpenAPI response is invalid.");
  }
  const reference = (response as { readonly $ref?: unknown }).$ref;

  return typeof reference === "string" ? resolveReference(reference) : response;
};

const expectOpenApiResponse = async (
  path: string,
  method: string,
  response: Response,
): Promise<void> => {
  const operation = (contract.paths as Record<string, Record<string, ContractOperation>>)[
    path
  ]?.[method];
  expect(operation, `${method.toUpperCase()} ${path} must be documented`).toBeDefined();

  const documentedResponse = resolveResponse(
    operation!.responses[String(response.status)],
  ) as { readonly content?: unknown };
  const validator = new OpenApiResponseValidator({
    responses: { [response.status]: documentedResponse },
    components: contract.components,
  });
  const validationError = validator.validateResponse(
    response.status,
    await response.clone().json(),
  );
  expect(validationError).toBeUndefined();
};

let useCases: BookingApiUseCases;
let requireAuthenticatedActor: Mock<() => Promise<AuthenticatedActor>>;
let createAppointmentUseCase: Mock<(input: unknown) => Promise<Appointment>>;
let cancelAppointmentUseCase: Mock<(input: unknown) => Promise<Appointment>>;
let updatePetUseCase: Mock<(petId: string, input: unknown) => Promise<Pet | null>>;

beforeEach(() => {
  requireAuthenticatedActor = vi.fn(async () => ({
    id: customerId,
    role: "CUSTOMER" as const,
  }));
  createAppointmentUseCase = vi.fn(async () => appointment);
  cancelAppointmentUseCase = vi.fn(async () => appointment);
  updatePetUseCase = vi.fn(async () => pet);
  useCases = {
    requireAuthenticatedActor,
    listActiveServices: vi.fn(async () => [service]),
    listActiveGroomers: vi.fn(async () => [groomer]),
    listMyPets: vi.fn(async () => [pet]),
    createMyPet: vi.fn(async () => pet),
    updateMyPet: updatePetUseCase,
    deleteMyPet: vi.fn(async () => true),
    searchAvailability: vi.fn(async () => availability),
    listMyAppointments: vi.fn(async () => [appointment]),
    createAppointment: createAppointmentUseCase,
    rescheduleAppointment: vi.fn(async () => appointment),
    cancelAppointment: cancelAppointmentUseCase,
  };
  createSupabaseBookingApiHandlers.mockReset();
  createSupabaseBookingApiHandlers.mockResolvedValue(createBookingApiHandlers(useCases));
});

describe("/api/v1 in-process HTTP contract", () => {
  it("runs every valid API path through the route and real HTTP boundary", async () => {
    await expect(getServices(request("/api/v1/services", "GET"))).resolves.toHaveProperty(
      "status",
      200,
    );
    await expect(getGroomers(request("/api/v1/groomers", "GET"))).resolves.toHaveProperty(
      "status",
      200,
    );
    await expect(getPets(request("/api/v1/pets", "GET"))).resolves.toHaveProperty(
      "status",
      200,
    );
    await expect(
      createPet(
        request("/api/v1/pets", "POST", {
          name: "Baxter",
          breed: "Beagle",
          size: "MEDIUM",
          ageYears: 2,
        }),
      ),
    ).resolves.toHaveProperty("status", 201);
    await expect(
      updatePet(request(`/api/v1/pets/${petId}`, "PATCH", { ageYears: 5 }), {
        params: Promise.resolve({ petId }),
      }),
    ).resolves.toHaveProperty("status", 200);
    await expect(
      deletePet(request(`/api/v1/pets/${petId}`, "DELETE"), {
        params: Promise.resolve({ petId }),
      }),
    ).resolves.toHaveProperty("status", 200);
    await expect(
      searchAvailability(
        request("/api/v1/availability/search", "POST", {
          petId,
          selectedServiceIds: [serviceId],
          groomerId,
          startsOn: "2028-09-04",
          endsOn: "2028-09-04",
        }),
      ),
    ).resolves.toHaveProperty("status", 200);
    await expect(getAppointments(request("/api/v1/appointments", "GET"))).resolves.toHaveProperty(
      "status",
      200,
    );
    await expect(
      createAppointment(
        request("/api/v1/appointments", "POST", appointmentInput, {
          "Idempotency-Key": "create-key",
        }),
      ),
    ).resolves.toHaveProperty("status", 201);
    await expect(
      rescheduleAppointment(
        request(
          `/api/v1/appointments/${appointmentId}/reschedule`,
          "POST",
          {
            groomerId,
            selectedServiceIds: [serviceId],
            startsAt: "2028-09-04T15:00:00.000Z",
          },
          { "Idempotency-Key": "reschedule-key" },
        ),
        { params: Promise.resolve({ appointmentId }) },
      ),
    ).resolves.toHaveProperty("status", 200);
    await expect(
      cancelAppointment(
        request(
          `/api/v1/appointments/${appointmentId}/cancel`,
          "POST",
          undefined,
          { "Idempotency-Key": "cancel-key" },
        ),
        { params: Promise.resolve({ appointmentId }) },
      ),
    ).resolves.toHaveProperty("status", 200);
    expect(createSupabaseBookingApiHandlers).toHaveBeenCalledTimes(11);
  });

  it("conforms every success route response to the checked-in OpenAPI operation", async () => {
    await expectOpenApiResponse(
      "/api/v1/services",
      "get",
      await getServices(request("/api/v1/services", "GET")),
    );
    await expectOpenApiResponse(
      "/api/v1/groomers",
      "get",
      await getGroomers(request("/api/v1/groomers", "GET")),
    );
    await expectOpenApiResponse(
      "/api/v1/pets",
      "get",
      await getPets(request("/api/v1/pets", "GET")),
    );
    await expectOpenApiResponse(
      "/api/v1/pets",
      "post",
      await createPet(
        request("/api/v1/pets", "POST", {
          name: "Baxter",
          breed: "Beagle",
          size: "MEDIUM",
          ageYears: 2,
        }),
      ),
    );
    await expectOpenApiResponse(
      "/api/v1/pets/{petId}",
      "patch",
      await updatePet(request(`/api/v1/pets/${petId}`, "PATCH", { ageYears: 5 }), {
        params: Promise.resolve({ petId }),
      }),
    );
    await expectOpenApiResponse(
      "/api/v1/pets/{petId}",
      "delete",
      await deletePet(request(`/api/v1/pets/${petId}`, "DELETE"), {
        params: Promise.resolve({ petId }),
      }),
    );
    await expectOpenApiResponse(
      "/api/v1/availability/search",
      "post",
      await searchAvailability(
        request("/api/v1/availability/search", "POST", {
          petId,
          selectedServiceIds: [serviceId],
          groomerId,
          startsOn: "2028-09-04",
          endsOn: "2028-09-04",
        }),
      ),
    );
    await expectOpenApiResponse(
      "/api/v1/appointments",
      "get",
      await getAppointments(request("/api/v1/appointments", "GET")),
    );
    await expectOpenApiResponse(
      "/api/v1/appointments",
      "post",
      await createAppointment(
        request("/api/v1/appointments", "POST", appointmentInput, {
          "Idempotency-Key": "create-contract-key",
        }),
      ),
    );
    await expectOpenApiResponse(
      "/api/v1/appointments/{appointmentId}/reschedule",
      "post",
      await rescheduleAppointment(
        request(
          `/api/v1/appointments/${appointmentId}/reschedule`,
          "POST",
          {
            groomerId,
            selectedServiceIds: [serviceId],
            startsAt: "2028-09-04T15:00:00.000Z",
          },
          { "Idempotency-Key": "reschedule-contract-key" },
        ),
        { params: Promise.resolve({ appointmentId }) },
      ),
    );
    await expectOpenApiResponse(
      "/api/v1/appointments/{appointmentId}/cancel",
      "post",
      await cancelAppointment(
        request(
          `/api/v1/appointments/${appointmentId}/cancel`,
          "POST",
          undefined,
          { "Idempotency-Key": "cancel-contract-key" },
        ),
        { params: Promise.resolve({ appointmentId }) },
      ),
    );
  });

  it("returns real standardized validation, authentication, authorization, not-found, and conflict responses", async () => {
    requireAuthenticatedActor.mockRejectedValueOnce(
      Object.assign(new Error("Authentication is required."), {
        code: "AUTHENTICATION_REQUIRED",
        status: 401,
      }),
    );
    createAppointmentUseCase.mockRejectedValueOnce(new SlotUnavailableError());
    cancelAppointmentUseCase.mockRejectedValueOnce(new AppointmentCutoffError());
    updatePetUseCase.mockResolvedValueOnce(null);
    createSupabaseBookingApiHandlers.mockResolvedValue(createBookingApiHandlers(useCases));

    const unauthenticated = await getServices(request("/api/v1/services", "GET"));
    const invalid = await searchAvailability(
      request("/api/v1/availability/search", "POST", { petId: "not-a-uuid" }),
    );
    const missing = await updatePet(
      request(`/api/v1/pets/${petId}`, "PATCH", { ageYears: 5 }),
      { params: Promise.resolve({ petId }) },
    );
    const conflict = await createAppointment(
      request("/api/v1/appointments", "POST", appointmentInput, {
        "Idempotency-Key": "create-conflict-key",
      }),
    );
    const forbidden = await cancelAppointment(
      request(
        `/api/v1/appointments/${appointmentId}/cancel`,
        "POST",
        undefined,
        { "Idempotency-Key": "cancel-cutoff-key" },
      ),
      { params: Promise.resolve({ appointmentId }) },
    );

    createAppointmentUseCase.mockRejectedValueOnce(
      Object.assign(new Error("database endpoint and token: private"), {
        code: "POSTGREST_UNEXPECTED",
        status: 409,
      }),
    );
    const internal = await createAppointment(
      request("/api/v1/appointments", "POST", appointmentInput, {
        "Idempotency-Key": "create-internal-error-key",
      }),
    );

    await expectOpenApiResponse("/api/v1/services", "get", unauthenticated);
    await expectOpenApiResponse("/api/v1/availability/search", "post", invalid);
    await expectOpenApiResponse("/api/v1/pets/{petId}", "patch", missing);
    await expectOpenApiResponse("/api/v1/appointments", "post", conflict);
    await expectOpenApiResponse(
      "/api/v1/appointments/{appointmentId}/cancel",
      "post",
      forbidden,
    );
    await expectOpenApiResponse("/api/v1/appointments", "post", internal);
    expect(unauthenticated.status).toBe(401);
    await expect(unauthenticated.json()).resolves.toMatchObject({
      error: { code: "AUTHENTICATION_REQUIRED", details: [] },
    });
    expect(invalid.status).toBe(422);
    await expect(invalid.json()).resolves.toMatchObject({
      error: { code: "VALIDATION_ERROR", details: expect.any(Array) },
    });
    expect(missing.status).toBe(404);
    await expect(missing.json()).resolves.toMatchObject({
      error: { code: "PET_NOT_FOUND", details: [] },
    });
    expect(conflict.status).toBe(409);
    await expect(conflict.json()).resolves.toMatchObject({
      error: { code: "SLOT_UNAVAILABLE", details: [] },
    });
    expect(forbidden.status).toBe(403);
    await expect(forbidden.json()).resolves.toMatchObject({
      error: { code: "CANCELLATION_CUTOFF_PASSED", details: [] },
    });
    expect(internal.status).toBe(500);
    await expect(internal.json()).resolves.toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
        details: [],
      },
    });
  });
});
