import { describe, expect, it, vi } from "vitest";

import type {
  Appointment,
  AppointmentServiceSnapshot,
  AvailabilitySearchResult,
  Groomer,
  Pet,
  Service,
} from "./use-cases";
import {
  CustomerUnavailableError,
  createKravosBookingUseCases,
  type KravosCustomerBookingUseCases,
  type KravosCustomerProfile,
} from "./kravos-use-cases";

const customerId = "00000000-0000-4000-8000-000000005101";
const secondCustomerId = "00000000-0000-4000-8000-000000005102";
const petId = "00000000-0000-4000-8000-000000005103";
const appointmentId = "00000000-0000-4000-8000-000000005104";
const groomerId = "00000000-0000-4000-8000-000000005105";
const serviceId = "00000000-0000-4000-8000-000000005106";

const profile: KravosCustomerProfile = { id: customerId, displayName: "Jane Doe" };
const secondProfile: KravosCustomerProfile = {
  id: secondCustomerId,
  displayName: "Jane Doe",
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
const otherPet: Pet = {
  ...pet,
  id: "00000000-0000-4000-8000-000000005107",
  ownerId: secondCustomerId,
  name: "Otis",
};
const groomer: Groomer = {
  id: groomerId,
  displayName: "Maya Chen",
  bio: null,
  isActive: true,
};
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
const snapshot: AppointmentServiceSnapshot = {
  appointmentId,
  serviceId,
  serviceName: service.name,
  serviceKind: "BASE",
  durationMinutes: 60,
  priceCents: 5500,
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

const customerUseCases = (): KravosCustomerBookingUseCases => ({
  listMyPets: vi.fn(async () => [pet]),
  listMyAppointments: vi.fn(async () => [appointment]),
  listMyAppointmentServices: vi.fn(async () => [snapshot]),
  listActiveGroomers: vi.fn(async () => [groomer]),
  searchAvailability: vi.fn(async () => availability),
  createAppointment: vi.fn(async () => appointment),
  rescheduleAppointment: vi.fn(async () => ({
    ...appointment,
    startsAt: new Date("2028-09-05T13:00:00.000Z"),
  })),
  cancelAppointment: vi.fn(async () => ({
    ...appointment,
    status: "CANCELLED" as const,
    cancelledAt: new Date("2028-09-01T13:00:00.000Z"),
  })),
});

const createDependencies = () => {
  const perCustomer = new Map<string, KravosCustomerBookingUseCases>();
  const getCustomerUseCases = vi.fn((id: string) => {
    const existing = perCustomer.get(id);
    if (existing !== undefined) return existing;
    const created = customerUseCases();
    perCustomer.set(id, created);
    return created;
  });

  return {
    perCustomer,
    getCustomerUseCases,
    findCustomersByDisplayName: vi.fn(async () => [profile, secondProfile]),
    getCustomerById: vi.fn(async (id: string) => (id === customerId ? profile : null)),
    listPetsByOwnerIds: vi.fn(async () => [pet, otherPet]),
    listActiveServices: vi.fn(async () => [service]),
    listActiveGroomers: vi.fn(async () => [groomer]),
    now: () => new Date("2028-09-01T12:00:00.000Z"),
  };
};

describe("Kravos booking use cases", () => {
  it("resolves an exact customer name and uses pet name to disambiguate", async () => {
    const dependencies = createDependencies();
    const useCases = createKravosBookingUseCases(dependencies);

    await expect(
      useCases.resolveCustomer({ customerName: "  jane DOE ", petName: " milo " }),
    ).resolves.toEqual({
      status: "RESOLVED",
      customer: profile,
      pets: [pet],
    });
    expect(dependencies.findCustomersByDisplayName).toHaveBeenCalledWith("jane DOE");
  });

  it("returns bounded candidates rather than selecting an ambiguous customer", async () => {
    const dependencies = createDependencies();
    const useCases = createKravosBookingUseCases(dependencies);

    await expect(useCases.resolveCustomer({ customerName: "Jane Doe" })).resolves.toEqual({
      status: "AMBIGUOUS",
      matches: [
        { customer: profile, pets: [pet] },
        { customer: secondProfile, pets: [otherPet] },
      ],
    });
  });

  it("returns NOT_FOUND when neither name nor optional pet identifies a customer", async () => {
    const dependencies = createDependencies();
    dependencies.findCustomersByDisplayName.mockResolvedValue([]);
    const useCases = createKravosBookingUseCases(dependencies);

    await expect(useCases.resolveCustomer({ customerName: "Missing" })).resolves.toEqual({
      status: "NOT_FOUND",
      matches: [],
    });
  });

  it("builds a tool-ready customer context with live change eligibility", async () => {
    const useCases = createKravosBookingUseCases(createDependencies());

    await expect(useCases.getCustomerContext(customerId)).resolves.toEqual({
      timeZone: "America/New_York",
      customer: profile,
      pets: [pet],
      appointmentCount: 1,
      appointmentsTruncated: false,
      appointments: [
        {
          ...appointment,
          services: [snapshot],
          petName: "Milo",
          groomerName: "Maya Chen",
          canChange: true,
          changeCutoffAt: "2028-09-03T13:00:00.000Z",
        },
      ],
    });
  });

  it("bounds customer context so the custom-tool response remains usable", async () => {
    const dependencies = createDependencies();
    const delegated = customerUseCases();
    vi.mocked(delegated.listMyAppointments).mockResolvedValue(
      Array.from({ length: 10 }, (_, index) => ({
        ...appointment,
        id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      })),
    );
    dependencies.getCustomerUseCases.mockReturnValue(delegated);
    const useCases = createKravosBookingUseCases(dependencies);

    const context = await useCases.getCustomerContext(customerId);

    expect(context.appointmentCount).toBe(10);
    expect(context.appointmentsTruncated).toBe(true);
    expect(context.appointments).toHaveLength(8);
  });

  it("rejects an unknown customer before building delegated use cases", async () => {
    const useCases = createKravosBookingUseCases(createDependencies());

    await expect(useCases.getCustomerContext(secondCustomerId)).rejects.toBeInstanceOf(
      CustomerUnavailableError,
    );
  });

  it("delegates availability and lifecycle operations to the selected customer", async () => {
    const dependencies = createDependencies();
    const useCases = createKravosBookingUseCases(dependencies);
    const createInput = {
      customerId,
      petId,
      groomerId,
      selectedServiceIds: [serviceId],
      startsAt: "2028-09-04T13:00:00.000Z",
      idempotencyKey: "create-key",
    };

    await expect(
      useCases.searchAvailability({
        customerId,
        petId,
        selectedServiceIds: [serviceId],
        groomerId,
        startsOn: "2028-09-04",
        endsOn: "2028-09-04",
      }),
    ).resolves.toEqual({
      ...availability,
      slotCount: 1,
      slotsTruncated: false,
      slots: [{ ...availability.slots[0]!, groomerName: "Maya Chen" }],
    });
    await useCases.createAppointment(createInput);
    await useCases.rescheduleAppointment({
      customerId,
      appointmentId,
      groomerId,
      selectedServiceIds: [serviceId],
      startsAt: "2028-09-05T13:00:00.000Z",
      idempotencyKey: "reschedule-key",
    });
    await useCases.cancelAppointment({
      customerId,
      appointmentId,
      idempotencyKey: "cancel-key",
    });

    const delegated = dependencies.perCustomer.get(customerId)!;
    expect(delegated.searchAvailability).toHaveBeenCalledWith({
      petId,
      selectedServiceIds: [serviceId],
      groomerId,
      startsOn: "2028-09-04",
      endsOn: "2028-09-04",
    });
    expect(delegated.createAppointment).toHaveBeenCalledWith({
      petId,
      groomerId,
      selectedServiceIds: [serviceId],
      startsAt: "2028-09-04T13:00:00.000Z",
      idempotencyKey: "create-key",
    });
    expect(delegated.rescheduleAppointment).toHaveBeenCalledWith({
      appointmentId,
      groomerId,
      selectedServiceIds: [serviceId],
      startsAt: "2028-09-05T13:00:00.000Z",
      idempotencyKey: "reschedule-key",
    });
    expect(delegated.cancelAppointment).toHaveBeenCalledWith({
      appointmentId,
      idempotencyKey: "cancel-key",
    });
  });

  it("bounds availability results so the model receives complete JSON", async () => {
    const dependencies = createDependencies();
    const delegated = customerUseCases();
    vi.mocked(delegated.searchAvailability).mockResolvedValue({
      ...availability,
      slots: Array.from({ length: 10 }, (_, index) => ({
        ...availability.slots[0]!,
        startsAt: new Date(`2028-09-04T${String(13 + index).padStart(2, "0")}:00:00.000Z`),
      })),
    });
    dependencies.getCustomerUseCases.mockReturnValue(delegated);
    const useCases = createKravosBookingUseCases(dependencies);

    const result = await useCases.searchAvailability({
      customerId,
      petId,
      selectedServiceIds: [serviceId],
      groomerId,
      startsOn: "2028-09-04",
      endsOn: "2028-09-04",
    });

    expect(result.slotCount).toBe(10);
    expect(result.slotsTruncated).toBe(true);
    expect(result.slots).toHaveLength(8);
  });

  it("searches booking options from human-readable customer selections", async () => {
    const dependencies = createDependencies();
    const useCases = createKravosBookingUseCases(dependencies);

    const result = await useCases.searchBookingOptions({
      customerName: "Jane Doe",
      petName: "Milo",
      serviceNames: ["Bath & Brush"],
    });

    expect(result.selection).toEqual({
      customerName: "Jane Doe",
      petName: "Milo",
      serviceNames: ["Bath & Brush"],
      groomerName: null,
      startsOn: "2028-09-02",
      endsOn: "2028-09-15",
    });
    const delegated = dependencies.perCustomer.get(customerId)!;
    expect(delegated.searchAvailability).toHaveBeenCalledWith({
      petId,
      selectedServiceIds: [serviceId],
      groomerId: null,
      startsOn: "2028-09-02",
      endsOn: "2028-09-15",
    });
  });

  it("confirms a booking from names and an Eastern local start", async () => {
    const dependencies = createDependencies();
    const useCases = createKravosBookingUseCases(dependencies);

    await useCases.confirmBooking({
      customerName: "Jane Doe",
      petName: "Milo",
      serviceNames: ["Bath & Brush"],
      groomerName: "Maya Chen",
      startsOn: "2028-09-04",
      startTime: "09:00",
      idempotencyKey: "confirm-key",
    });

    const delegated = dependencies.perCustomer.get(customerId)!;
    expect(delegated.createAppointment).toHaveBeenCalledWith({
      petId,
      groomerId,
      selectedServiceIds: [serviceId],
      startsAt: "2028-09-04T13:00:00.000Z",
      idempotencyKey: "confirm-key",
    });
  });

  it("reschedules a confirmed booking from names and Eastern local times", async () => {
    const dependencies = createDependencies();
    const useCases = createKravosBookingUseCases(dependencies);

    await useCases.rescheduleBooking({
      customerName: "Jane Doe",
      petName: "Milo",
      currentStartsOn: "2028-09-04",
      currentStartTime: "09:00",
      groomerName: "Maya Chen",
      startsOn: "2028-09-05",
      startTime: "12:00",
      idempotencyKey: "human-reschedule-key",
    });

    const delegated = dependencies.perCustomer.get(customerId)!;
    expect(delegated.rescheduleAppointment).toHaveBeenCalledWith({
      appointmentId,
      groomerId,
      selectedServiceIds: [serviceId],
      startsAt: "2028-09-05T16:00:00.000Z",
      idempotencyKey: "human-reschedule-key",
    });
  });
});
