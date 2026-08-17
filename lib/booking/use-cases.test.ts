import { describe, expect, it } from "vitest";

import type {
  Appointment,
  AppointmentServiceSnapshot,
  BookingRepository,
  Groomer,
  GroomerServiceQualification,
  GroomerTimeOff,
  GroomerWorkingHours,
  Pet,
  Service,
  ServiceCompatibility,
} from "./use-cases";
import {
  PetValidationError,
  createBookingUseCases,
  subtractTimeOff,
} from "./use-cases";

const customerId = "00000000-0000-4000-8000-000000000701";
const otherCustomerId = "00000000-0000-4000-8000-000000000702";

const services: ReadonlyArray<Service> = [
  {
    id: "service-bath",
    name: "Bath & Brush",
    description: "Bath and brush-out.",
    kind: "BASE",
    isStandaloneEligible: false,
    durationMinutes: 60,
    priceCents: 5500,
    isActive: true,
  },
  {
    id: "service-full-groom",
    name: "Full Groom",
    description: "Full grooming visit.",
    kind: "BASE",
    isStandaloneEligible: false,
    durationMinutes: 90,
    priceCents: 8500,
    isActive: true,
  },
  {
    id: "service-nail-trim",
    name: "Nail Trim",
    description: "Express nail trim.",
    kind: "ADD_ON",
    isStandaloneEligible: true,
    durationMinutes: 15,
    priceCents: 1500,
    isActive: true,
  },
  {
    id: "service-deshed",
    name: "De-shedding Treatment",
    description: "Coat treatment.",
    kind: "ADD_ON",
    isStandaloneEligible: false,
    durationMinutes: 30,
    priceCents: 3000,
    isActive: true,
  },
  {
    id: "service-retired",
    name: "Retired Service",
    description: "No longer bookable.",
    kind: "BASE",
    isStandaloneEligible: false,
    durationMinutes: 30,
    priceCents: 2500,
    isActive: false,
  },
];

const compatibility: ReadonlyArray<ServiceCompatibility> = [
  { baseServiceId: "service-bath", addOnServiceId: "service-nail-trim" },
  { baseServiceId: "service-bath", addOnServiceId: "service-deshed" },
  { baseServiceId: "service-full-groom", addOnServiceId: "service-deshed" },
];

const groomers: ReadonlyArray<Groomer> = [
  { id: "groomer-maya", displayName: "Maya", bio: null, isActive: true },
  { id: "groomer-liam", displayName: "Liam", bio: null, isActive: true },
  { id: "groomer-retired", displayName: "Retired", bio: null, isActive: false },
];

const qualifications: ReadonlyArray<GroomerServiceQualification> = [
  { groomerId: "groomer-maya", serviceId: "service-bath" },
  { groomerId: "groomer-maya", serviceId: "service-full-groom" },
  { groomerId: "groomer-maya", serviceId: "service-nail-trim" },
  { groomerId: "groomer-maya", serviceId: "service-deshed" },
  { groomerId: "groomer-liam", serviceId: "service-bath" },
  { groomerId: "groomer-liam", serviceId: "service-nail-trim" },
  { groomerId: "groomer-liam", serviceId: "service-deshed" },
  { groomerId: "groomer-retired", serviceId: "service-bath" },
];

const workingHours: ReadonlyArray<GroomerWorkingHours> = [
  {
    id: "hours-maya-monday",
    groomerId: "groomer-maya",
    isoDayOfWeek: 1,
    startsAt: "09:00",
    endsAt: "18:00",
  },
];

const timeOff: ReadonlyArray<GroomerTimeOff> = [
  {
    id: "time-off-maya-training",
    groomerId: "groomer-maya",
    startsAt: new Date("2026-09-02T16:00:00.000Z"),
    endsAt: new Date("2026-09-02T18:00:00.000Z"),
    reason: "Training",
  },
];

const appointments: ReadonlyArray<Appointment> = [
  {
    id: "appointment-owned",
    customerId,
    petId: "pet-owned",
    groomerId: "groomer-maya",
    status: "CONFIRMED",
    startsAt: new Date("2028-09-04T13:00:00.000Z"),
    serviceEndsAt: new Date("2028-09-04T14:00:00.000Z"),
    blockedUntil: new Date("2028-09-04T14:15:00.000Z"),
    subtotalCents: 5500,
    appliedBufferMinutes: 15,
    cancelledAt: null,
  },
  {
    id: "appointment-other",
    customerId: otherCustomerId,
    petId: "pet-other",
    groomerId: "groomer-liam",
    status: "CONFIRMED",
    startsAt: new Date("2028-09-05T13:00:00.000Z"),
    serviceEndsAt: new Date("2028-09-05T14:00:00.000Z"),
    blockedUntil: new Date("2028-09-05T14:15:00.000Z"),
    subtotalCents: 5500,
    appliedBufferMinutes: 15,
    cancelledAt: null,
  },
];

const appointmentServices: ReadonlyArray<AppointmentServiceSnapshot> = [
  {
    appointmentId: "appointment-owned",
    serviceId: "service-bath",
    serviceName: "Bath & Brush",
    serviceKind: "BASE",
    durationMinutes: 60,
    priceCents: 5500,
  },
  {
    appointmentId: "appointment-other",
    serviceId: "service-full-groom",
    serviceName: "Full Groom",
    serviceKind: "BASE",
    durationMinutes: 90,
    priceCents: 8500,
  },
];

const pets: Array<Pet> = [
  {
    id: "pet-owned",
    ownerId: customerId,
    name: "Milo",
    breed: "Golden Retriever",
    size: "LARGE",
    ageYears: 4,
    temperament: null,
    coatCondition: null,
    allergies: null,
    notes: null,
  },
  {
    id: "pet-other",
    ownerId: otherCustomerId,
    name: "Luna",
    breed: "Poodle",
    size: "SMALL",
    ageYears: 3,
    temperament: null,
    coatCondition: null,
    allergies: null,
    notes: null,
  },
];

const createRepository = (): BookingRepository => ({
  listServices: async () => services,
  listServiceCompatibility: async () => compatibility,
  listGroomers: async () => groomers,
  listGroomerServiceQualifications: async () => qualifications,
  listGroomerWorkingHours: async (groomerId) =>
    workingHours.filter((hours) => hours.groomerId === groomerId),
  listGroomerTimeOff: async (groomerId) =>
    timeOff.filter((entry) => entry.groomerId === groomerId),
  listConfirmedAppointmentBlocks: async () => [],
  createConfirmedAppointment: async () => {
    throw new Error("not needed");
  },
  rescheduleConfirmedAppointment: async () => {
    throw new Error("not needed");
  },
  cancelConfirmedAppointment: async () => {
    throw new Error("not needed");
  },
  listAppointmentsByCustomer: async (requestedCustomerId) =>
    appointments.filter((appointment) => appointment.customerId === requestedCustomerId),
  listAppointmentServices: async (appointmentIds) =>
    appointmentServices.filter((snapshot) =>
      appointmentIds.includes(snapshot.appointmentId),
    ),
  listPetsByOwner: async (ownerId) =>
    pets.filter((pet) => pet.ownerId === ownerId),
  getPetByOwner: async (petId, ownerId) =>
    pets.find((pet) => pet.id === petId && pet.ownerId === ownerId) ?? null,
  createPet: async (input) => {
    const pet: Pet = { id: "pet-created", ...input };
    pets.push(pet);
    return pet;
  },
  updatePetByOwner: async (petId, ownerId, input) => {
    const petIndex = pets.findIndex(
      (pet) => pet.id === petId && pet.ownerId === ownerId,
    );

    if (petIndex === -1) {
      return null;
    }

    const existingPet = pets[petIndex];
    if (existingPet === undefined) {
      return null;
    }

    const updatedPet = { ...existingPet, ...input };
    pets[petIndex] = updatedPet;
    return updatedPet;
  },
  deletePetByOwner: async (petId, ownerId) => {
    const petIndex = pets.findIndex(
      (pet) => pet.id === petId && pet.ownerId === ownerId,
    );

    if (petIndex === -1) {
      return false;
    }

    pets.splice(petIndex, 1);
    return true;
  },
});

const createUseCases = () =>
  createBookingUseCases({
    repository: createRepository(),
    getCurrentActor: async () => ({ id: customerId, role: "CUSTOMER" }),
  });

describe("catalogue use cases", () => {
  it("returns only active services to customers", async () => {
    const useCases = createUseCases();

    await expect(useCases.listActiveServices()).resolves.toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({ id: "service-retired" }),
      ]),
    );
  });

  it("exposes persisted service compatibility for customer presentation", async () => {
    const useCases = createUseCases();

    await expect(useCases.listServiceCompatibility()).resolves.toEqual(
      compatibility,
    );
  });

  it("accepts one base service with compatible add-ons and derives totals", async () => {
    const useCases = createUseCases();

    await expect(
      useCases.resolveServiceSelection(["service-bath", "service-deshed"]),
    ).resolves.toMatchObject({
      baseService: { id: "service-bath" },
      totalDurationMinutes: 90,
      subtotalCents: 8500,
    });
  });

  it("accepts an allowed standalone express service", async () => {
    const useCases = createUseCases();

    await expect(
      useCases.resolveServiceSelection(["service-nail-trim"]),
    ).resolves.toMatchObject({
      baseService: null,
      isStandaloneExpress: true,
      totalDurationMinutes: 15,
      subtotalCents: 1500,
    });
  });

  it("rejects multiple base services and incompatible add-ons", async () => {
    const useCases = createUseCases();

    await expect(
      useCases.resolveServiceSelection(["service-bath", "service-full-groom"]),
    ).rejects.toMatchObject({
      code: "EXACTLY_ONE_BASE_SERVICE_REQUIRED",
    });
    await expect(
      useCases.resolveServiceSelection(["service-full-groom", "service-nail-trim"]),
    ).rejects.toMatchObject({
      code: "INCOMPATIBLE_ADD_ON",
    });
  });
});

describe("groomer and schedule use cases", () => {
  it("returns only active groomers to customers", async () => {
    const useCases = createUseCases();

    await expect(useCases.listActiveGroomers()).resolves.toEqual([
      expect.objectContaining({ id: "groomer-maya", isActive: true }),
      expect.objectContaining({ id: "groomer-liam", isActive: true }),
    ]);
  });

  it("returns only active groomers qualified for every selected service", async () => {
    const useCases = createUseCases();

    await expect(
      useCases.listQualifiedGroomers(["service-full-groom", "service-deshed"]),
    ).resolves.toEqual([
      expect.objectContaining({ id: "groomer-maya", isActive: true }),
    ]);
  });

  it("returns an active groomer's working hours and time off", async () => {
    const useCases = createUseCases();

    await expect(useCases.getGroomerSchedule("groomer-maya")).resolves.toEqual({
      groomer: groomers[0],
      workingHours,
      timeOff,
    });
  });

  it("removes time-off intervals from working windows", () => {
    const effectiveWindows = subtractTimeOff(
      [
        {
          startsAt: new Date("2026-09-02T13:00:00.000Z"),
          endsAt: new Date("2026-09-02T22:00:00.000Z"),
        },
      ],
      timeOff,
    );

    expect(effectiveWindows).toEqual([
      {
        startsAt: new Date("2026-09-02T13:00:00.000Z"),
        endsAt: new Date("2026-09-02T16:00:00.000Z"),
      },
      {
        startsAt: new Date("2026-09-02T18:00:00.000Z"),
        endsAt: new Date("2026-09-02T22:00:00.000Z"),
      },
    ]);
  });
});

describe("customer appointment use cases", () => {
  it("lists only appointments belonging to the verified current customer", async () => {
    const useCases = createUseCases();

    await expect(useCases.listMyAppointments()).resolves.toEqual([
      expect.objectContaining({ id: "appointment-owned", customerId }),
    ]);
  });
  it("lists service snapshots only for the current customer's appointments", async () => {
    const useCases = createUseCases();

    await expect(useCases.listMyAppointmentServices()).resolves.toEqual([
      expect.objectContaining({
        appointmentId: "appointment-owned",
        serviceName: "Bath & Brush",
      }),
    ]);
  });
});

describe("customer-owned pet use cases", () => {
  it("lists and reads only the current customer's pets", async () => {
    const useCases = createUseCases();

    await expect(useCases.listMyPets()).resolves.toEqual([
      expect.objectContaining({ id: "pet-owned", ownerId: customerId }),
    ]);
    await expect(useCases.getMyPet("pet-other")).resolves.toBeNull();
  });

  it("creates, updates, and deletes a pet with the current actor as owner", async () => {
    const useCases = createUseCases();

    const createdPet = await useCases.createMyPet({
      name: "  Baxter  ",
      breed: "  Beagle  ",
      size: "MEDIUM",
      ageYears: 2,
      notes: "  Nervous around dryers.  ",
    });

    expect(createdPet).toMatchObject({
      id: "pet-created",
      ownerId: customerId,
      name: "Baxter",
      breed: "Beagle",
      notes: "Nervous around dryers.",
    });
    await expect(
      useCases.updateMyPet("pet-created", { ageYears: 3 }),
    ).resolves.toMatchObject({ ageYears: 3 });
    await expect(useCases.deleteMyPet("pet-created")).resolves.toBe(true);
  });

  it("rejects invalid input and cannot mutate another customer's pet", async () => {
    const useCases = createUseCases();

    await expect(
      useCases.createMyPet({
        name: "",
        breed: "Beagle",
        size: "MEDIUM",
        ageYears: 31,
      }),
    ).rejects.toBeInstanceOf(PetValidationError);
    await expect(
      useCases.updateMyPet("pet-other", { name: "Unauthorized" }),
    ).resolves.toBeNull();
    await expect(useCases.deleteMyPet("pet-other")).resolves.toBe(false);
  });
});
