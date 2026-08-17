import { describe, expect, it, vi } from "vitest";

import { AuthenticationRequiredError } from "../../auth/guards";
import type { KravosBookingPrincipal } from "../../auth/kravos-tool-auth";
import { SlotUnavailableError } from "../../booking/use-cases";
import {
  createKravosBookingApiHandlers,
  type KravosBookingApiUseCases,
} from "./kravos-handlers";

const customerId = "00000000-0000-4000-8000-000000005301";
const otherCustomerId = "00000000-0000-4000-8000-000000005302";
const petId = "00000000-0000-4000-8000-000000005303";
const appointmentId = "00000000-0000-4000-8000-000000005304";
const groomerId = "00000000-0000-4000-8000-000000005305";
const serviceId = "00000000-0000-4000-8000-000000005306";

const request = (path: string, body: unknown): Request =>
  new Request(`https://pawandpolish.example${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const appointment = {
  id: appointmentId,
  customerId,
  petId,
  groomerId,
  status: "CONFIRMED" as const,
  startsAt: new Date("2028-09-04T13:00:00.000Z"),
  serviceEndsAt: new Date("2028-09-04T14:00:00.000Z"),
  blockedUntil: new Date("2028-09-04T14:15:00.000Z"),
  subtotalCents: 5500,
  appliedBufferMinutes: 15,
  cancelledAt: null,
};

const createUseCases = (overrides: Partial<KravosBookingApiUseCases> = {}) => ({
  resolveCustomer: vi.fn(async () => ({
    status: "RESOLVED" as const,
    customer: { id: customerId, displayName: "Jane Doe" },
    pets: [
      {
        id: petId,
        ownerId: customerId,
        name: "Milo",
        breed: "Golden Retriever",
        size: "LARGE" as const,
        ageYears: 4,
        temperament: null,
        coatCondition: null,
        allergies: null,
        notes: null,
      },
    ],
  })),
  getCatalog: vi.fn(async () => ({ services: [], groomers: [] })),
  getCustomerContext: vi.fn(async (id: string) => ({
    timeZone: "America/New_York" as const,
    customer: { id, displayName: "Jane Doe" },
    pets: [],
    appointmentCount: 0,
    appointmentsTruncated: false,
    appointments: [],
  })),
  searchAvailability: vi.fn(async () => ({
    timeZone: "America/New_York" as const,
    totalDurationMinutes: 60,
    subtotalCents: 5500,
    slotCount: 1,
    slotsTruncated: false,
    slots: [
      {
        groomerId,
        groomerName: "Maya Chen",
        startsAt: appointment.startsAt,
        serviceEndsAt: appointment.serviceEndsAt,
        blockedUntil: appointment.blockedUntil,
      },
    ],
  })),
  createAppointment: vi.fn(async () => appointment),
  rescheduleAppointment: vi.fn(async () => appointment),
  cancelAppointment: vi.fn(async () => ({
    ...appointment,
    status: "CANCELLED" as const,
    cancelledAt: new Date("2028-09-01T13:00:00.000Z"),
  })),
  searchBookingOptions: vi.fn(async () => ({
    timeZone: "America/New_York" as const,
    totalDurationMinutes: 60,
    subtotalCents: 5500,
    slotCount: 1,
    slotsTruncated: false,
    selection: {
      customerName: "Jane Doe",
      petName: "Milo",
      serviceNames: ["Bath & Brush"],
      groomerName: "Maya Chen",
      startsOn: "2028-09-04",
      endsOn: "2028-09-04",
    },
    slots: [
      {
        groomerId,
        groomerName: "Maya Chen",
        startsAt: appointment.startsAt,
        serviceEndsAt: appointment.serviceEndsAt,
        blockedUntil: appointment.blockedUntil,
      },
    ],
  })),
  confirmBooking: vi.fn(async () => appointment),
  rescheduleBooking: vi.fn(async () => appointment),
  ...overrides,
});

const createHandlers = ({
  principal = { kind: "KRAVOS_TOOL" } as KravosBookingPrincipal,
  overrides = {},
}: {
  readonly principal?: KravosBookingPrincipal;
  readonly overrides?: Partial<KravosBookingApiUseCases>;
} = {}) => {
  const useCases = createUseCases(overrides);
  const resolvePrincipal = vi.fn(async () => principal);

  return {
    useCases,
    resolvePrincipal,
    handlers: createKravosBookingApiHandlers({ useCases, resolvePrincipal }),
  };
};

describe("Kravos booking API handlers", () => {
  it("returns the stable 401 envelope before invoking a tool operation", async () => {
    const useCases = createUseCases();
    const handlers = createKravosBookingApiHandlers({
      useCases,
      resolvePrincipal: async () => {
        throw new AuthenticationRequiredError();
      },
    });

    const response = await handlers.catalog(
      request("/api/v1/integrations/kravos/catalog", {}),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required.",
        details: [],
      },
    });
    expect(useCases.getCatalog).not.toHaveBeenCalled();
  });

  it("requires an empty JSON object for the catalogue tool", async () => {
    const { handlers, useCases } = createHandlers();

    const response = await handlers.catalog(
      request("/api/v1/integrations/kravos/catalog", { unexpected: true }),
    );

    expect(response.status).toBe(422);
    expect(useCases.getCatalog).not.toHaveBeenCalled();
  });

  it("resolves a customer and serializes tool-facing customer and pet IDs", async () => {
    const { handlers, useCases } = createHandlers();

    const response = await handlers.resolveCustomer(
      request("/api/v1/integrations/kravos/customers/resolve", {
        customerName: "Jane Doe",
        petName: "Milo",
      }),
    );

    expect(response.status).toBe(200);
    expect(useCases.resolveCustomer).toHaveBeenCalledWith({
      customerName: "Jane Doe",
      petName: "Milo",
    });
    await expect(response.json()).resolves.toMatchObject({
      data: {
        status: "RESOLVED",
        customer: { customerId, displayName: "Jane Doe" },
        pets: [{ petId, name: "Milo" }],
      },
    });
  });

  it("uses a session customer instead of a body-supplied customer ID", async () => {
    const { handlers, useCases } = createHandlers({
      principal: {
        kind: "CUSTOMER_SESSION",
        actor: { id: customerId, role: "CUSTOMER" },
      },
    });

    const response = await handlers.customerContext(
      request("/api/v1/integrations/kravos/customers/context", {
        customerId: otherCustomerId,
      }),
    );

    expect(response.status).toBe(200);
    expect(useCases.getCustomerContext).toHaveBeenCalledWith(customerId);
  });

  it("requires a customer ID for a bearer-authenticated customer operation", async () => {
    const { handlers } = createHandlers();

    const response = await handlers.customerContext(
      request("/api/v1/integrations/kravos/customers/context", {}),
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "VALIDATION_ERROR", details: [{ path: "customerId" }] },
    });
  });

  it("defaults availability to one day and any qualified groomer", async () => {
    const { handlers, useCases } = createHandlers();

    const response = await handlers.searchAvailability(
      request("/api/v1/integrations/kravos/availability/search", {
        customerId,
        petId,
        selectedServiceIds: [serviceId],
        startsOn: "2028-09-04",
      }),
    );

    expect(response.status).toBe(200);
    expect(useCases.searchAvailability).toHaveBeenCalledWith({
      customerId,
      petId,
      selectedServiceIds: [serviceId],
      groomerId: null,
      startsOn: "2028-09-04",
      endsOn: "2028-09-04",
    });
  });

  it("searches booking options from human-readable values without requiring IDs", async () => {
    const { handlers, useCases } = createHandlers();
    const input = {
      customerName: "Danilo Jr. Casim",
      petName: "Yasi",
      serviceName: "Full Groom",
      groomerName: "Maya Chen",
    };

    const response = await handlers.bookingOptions(
      request("/api/v1/integrations/kravos/booking/options", input),
    );

    expect(response.status).toBe(200);
    expect(useCases.searchBookingOptions).toHaveBeenCalledWith({
      customerName: "Danilo Jr. Casim",
      petName: "Yasi",
      serviceNames: ["Full Groom"],
      groomerName: "Maya Chen",
    });
    await expect(response.json()).resolves.toMatchObject({
      data: {
        selection: { customerName: "Jane Doe", petName: "Milo" },
        slots: [{ startsAtEastern: "2028-09-04T09:00:00-04:00" }],
      },
    });
  });

  it("confirms a reviewed booking from human-readable values", async () => {
    const { handlers, useCases } = createHandlers();
    const input = {
      customerName: "Danilo Jr. Casim",
      petName: "Yasi",
      serviceName: "Full Groom",
      groomerName: "Maya Chen",
      startsOn: "2028-09-04",
      startTime: "09:00",
      idempotencyKey: "confirm-key",
    };

    const response = await handlers.confirmBooking(
      request("/api/v1/integrations/kravos/booking/confirm", input),
    );

    expect(response.status).toBe(201);
    expect(useCases.confirmBooking).toHaveBeenCalledWith({
      customerName: "Danilo Jr. Casim",
      petName: "Yasi",
      serviceNames: ["Full Groom"],
      groomerName: "Maya Chen",
      startsOn: "2028-09-04",
      startTime: "09:00",
      idempotencyKey: "confirm-key",
    });
    await expect(response.json()).resolves.toMatchObject({
      data: { id: appointmentId, status: "CONFIRMED" },
    });
  });

  it("reschedules a reviewed booking from human-readable Eastern times", async () => {
    const { handlers, useCases } = createHandlers();
    const input = {
      customerName: "Danilo Jr. Casim",
      petName: "Yasi",
      currentStartsOn: "2028-09-04",
      currentStartTime: "09:00",
      groomerName: "Maya Chen",
      startsOn: "2028-09-05",
      startTime: "12:00",
      idempotencyKey: "human-reschedule-key",
    };

    const response = await handlers.rescheduleBooking(
      request("/api/v1/integrations/kravos/booking/reschedule", input),
    );

    expect(response.status).toBe(200);
    expect(useCases.rescheduleBooking).toHaveBeenCalledWith(input);
    await expect(response.json()).resolves.toMatchObject({
      data: { id: appointmentId, status: "CONFIRMED" },
    });
  });

  it("delegates availability and lifecycle bodies with JSON idempotency keys", async () => {
    const { handlers, useCases } = createHandlers();
    const availabilityInput = {
      customerId,
      petId,
      selectedServiceIds: [serviceId],
      groomerId,
      startsOn: "2028-09-04",
      endsOn: "2028-09-04",
    };
    const createInput = {
      customerId,
      petId,
      groomerId,
      selectedServiceIds: [serviceId],
      startsAt: "2028-09-04T13:00:00.000Z",
      idempotencyKey: "create-key",
    };

    const availabilityResponse = await handlers.searchAvailability(
      request("/api/v1/integrations/kravos/availability/search", availabilityInput),
    );
    const createResponse = await handlers.createAppointment(
      request("/api/v1/integrations/kravos/appointments/create", createInput),
    );
    const rescheduleResponse = await handlers.rescheduleAppointment(
      request("/api/v1/integrations/kravos/appointments/reschedule", {
        customerId,
        appointmentId,
        groomerId,
        selectedServiceIds: [serviceId],
        startsAt: "2028-09-05T13:00:00.000Z",
        idempotencyKey: "reschedule-key",
      }),
    );
    const cancelResponse = await handlers.cancelAppointment(
      request("/api/v1/integrations/kravos/appointments/cancel", {
        customerId,
        appointmentId,
        idempotencyKey: "cancel-key",
      }),
    );

    expect(availabilityResponse.status).toBe(200);
    expect(createResponse.status).toBe(201);
    expect(rescheduleResponse.status).toBe(200);
    expect(cancelResponse.status).toBe(200);
    expect(useCases.searchAvailability).toHaveBeenCalledWith(availabilityInput);
    expect(useCases.createAppointment).toHaveBeenCalledWith(createInput);
    expect(useCases.rescheduleAppointment).toHaveBeenCalledWith({
      customerId,
      appointmentId,
      groomerId,
      selectedServiceIds: [serviceId],
      startsAt: "2028-09-05T13:00:00.000Z",
      idempotencyKey: "reschedule-key",
    });
    expect(useCases.cancelAppointment).toHaveBeenCalledWith({
      customerId,
      appointmentId,
      idempotencyKey: "cancel-key",
    });
    await expect(availabilityResponse.json()).resolves.toMatchObject({
      data: {
        timeZone: "America/New_York",
        slots: [
          {
            startsAtEastern: "2028-09-04T09:00:00-04:00",
            serviceEndsAtEastern: "2028-09-04T10:00:00-04:00",
          },
        ],
      },
    });
    await expect(createResponse.json()).resolves.toEqual({
      data: {
        id: appointmentId,
        customerId,
        petId,
        groomerId,
        status: "CONFIRMED",
        startsAt: "2028-09-04T13:00:00.000Z",
        serviceEndsAt: "2028-09-04T14:00:00.000Z",
        blockedUntil: "2028-09-04T14:15:00.000Z",
        subtotalCents: 5500,
        appliedBufferMinutes: 15,
        cancelledAt: null,
        timeZone: "America/New_York",
        startsAtEastern: "2028-09-04T09:00:00-04:00",
        serviceEndsAtEastern: "2028-09-04T10:00:00-04:00",
        blockedUntilEastern: "2028-09-04T10:15:00-04:00",
      },
    });
  });

  it("maps booking conflicts without leaking an internal exception", async () => {
    const { handlers } = createHandlers({
      overrides: {
        createAppointment: async () => {
          throw new SlotUnavailableError();
        },
      },
    });

    const response = await handlers.createAppointment(
      request("/api/v1/integrations/kravos/appointments/create", {
        customerId,
        petId,
        groomerId,
        selectedServiceIds: [serviceId],
        startsAt: "2028-09-04T13:00:00.000Z",
        idempotencyKey: "conflict-key",
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "SLOT_UNAVAILABLE",
        message: "This appointment time is no longer available.",
        details: [],
      },
    });
  });
});
