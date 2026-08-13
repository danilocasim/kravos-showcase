import { describe, expect, it } from "vitest";

import type {
  BookingRepository,
  ConfirmedAppointmentBlock,
  Groomer,
  GroomerServiceQualification,
  GroomerTimeOff,
  GroomerWorkingHours,
  Pet,
  Service,
  ServiceCompatibility,
} from "./use-cases";
import {
  AvailabilitySearchValidationError,
  PetUnavailableError,
  createBookingUseCases,
} from "./use-cases";

const customerId = "00000000-0000-4000-8000-000000000a01";
const otherCustomerId = "00000000-0000-4000-8000-000000000a02";
const mayaId = "00000000-0000-4000-8000-000000000b01";
const liamId = "00000000-0000-4000-8000-000000000b02";

const services: ReadonlyArray<Service> = [
  {
    id: "00000000-0000-4000-8000-000000000c01",
    name: "Bath & Brush",
    description: "Bath and brush-out.",
    kind: "BASE",
    isStandaloneEligible: false,
    durationMinutes: 60,
    priceCents: 5500,
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000c02",
    name: "Full Groom",
    description: "Full grooming visit.",
    kind: "BASE",
    isStandaloneEligible: false,
    durationMinutes: 90,
    priceCents: 8500,
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000c03",
    name: "Nail Trim",
    description: "Express nail trim.",
    kind: "ADD_ON",
    isStandaloneEligible: true,
    durationMinutes: 15,
    priceCents: 1500,
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000c04",
    name: "De-shedding Treatment",
    description: "Coat treatment.",
    kind: "ADD_ON",
    isStandaloneEligible: false,
    durationMinutes: 30,
    priceCents: 3000,
    isActive: true,
  },
];

const compatibility: ReadonlyArray<ServiceCompatibility> = [
  { baseServiceId: services[0]!.id, addOnServiceId: services[2]!.id },
  { baseServiceId: services[0]!.id, addOnServiceId: services[3]!.id },
  { baseServiceId: services[1]!.id, addOnServiceId: services[3]!.id },
];

const groomers: ReadonlyArray<Groomer> = [
  { id: mayaId, displayName: "Maya", bio: null, isActive: true },
  { id: liamId, displayName: "Liam", bio: null, isActive: true },
];

const qualifications: ReadonlyArray<GroomerServiceQualification> = [
  ...services.map((service) => ({ groomerId: mayaId, serviceId: service.id })),
  { groomerId: liamId, serviceId: services[0]!.id },
  { groomerId: liamId, serviceId: services[2]!.id },
  { groomerId: liamId, serviceId: services[3]!.id },
];

const workingHours: ReadonlyArray<GroomerWorkingHours> = [
  {
    id: "00000000-0000-4000-8000-000000000d01",
    groomerId: mayaId,
    isoDayOfWeek: 1,
    startsAt: "09:00:00",
    endsAt: "18:00:00",
  },
  {
    id: "00000000-0000-4000-8000-000000000d02",
    groomerId: mayaId,
    isoDayOfWeek: 3,
    startsAt: "09:00:00",
    endsAt: "18:00:00",
  },
  {
    id: "00000000-0000-4000-8000-000000000d03",
    groomerId: mayaId,
    isoDayOfWeek: 6,
    startsAt: "09:00:00",
    endsAt: "16:00:00",
  },
  {
    id: "00000000-0000-4000-8000-000000000d04",
    groomerId: liamId,
    isoDayOfWeek: 1,
    startsAt: "10:00:00",
    endsAt: "18:00:00",
  },
];

const timeOff: ReadonlyArray<GroomerTimeOff> = [
  {
    id: "00000000-0000-4000-8000-000000000e01",
    groomerId: mayaId,
    startsAt: new Date("2026-09-02T16:00:00.000Z"),
    endsAt: new Date("2026-09-02T18:00:00.000Z"),
    reason: "Training",
  },
];

const ownedPet: Pet = {
  id: "00000000-0000-4000-8000-000000000f01",
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

const otherPet: Pet = { ...ownedPet, id: "00000000-0000-4000-8000-000000000f02", ownerId: otherCustomerId };

const createRepository = (
  confirmedBlocks: ReadonlyArray<ConfirmedAppointmentBlock> = [],
): BookingRepository => ({
  listServices: async () => services,
  listServiceCompatibility: async () => compatibility,
  listGroomers: async () => groomers,
  listGroomerServiceQualifications: async () => qualifications,
  listGroomerWorkingHours: async (groomerId) =>
    workingHours.filter((hours) => hours.groomerId === groomerId),
  listGroomerTimeOff: async (groomerId) =>
    timeOff.filter((entry) => entry.groomerId === groomerId),
  listConfirmedAppointmentBlocks: async (groomerId, range) =>
    confirmedBlocks.filter(
      (block) =>
        block.groomerId === groomerId &&
        block.startsAt < range.endsAt &&
        block.blockedUntil > range.startsAt,
    ),
  createConfirmedAppointment: async () => {
    throw new Error("not needed");
  },
  rescheduleConfirmedAppointment: async () => {
    throw new Error("not needed");
  },
  cancelConfirmedAppointment: async () => {
    throw new Error("not needed");
  },
  listAppointmentsByCustomer: async () => [],
  listPetsByOwner: async (ownerId) =>
    [ownedPet, otherPet].filter((pet) => pet.ownerId === ownerId),
  getPetByOwner: async (petId, ownerId) =>
    [ownedPet, otherPet].find(
      (pet) => pet.id === petId && pet.ownerId === ownerId,
    ) ?? null,
  createPet: async () => ownedPet,
  updatePetByOwner: async () => ownedPet,
  deletePetByOwner: async () => true,
});

const createUseCases = (
  confirmedBlocks: ReadonlyArray<ConfirmedAppointmentBlock> = [],
) =>
  createBookingUseCases({
    repository: createRepository(confirmedBlocks),
    getCurrentActor: async () => ({ id: customerId, role: "CUSTOMER" }),
  });

const searchBathForMaya = (useCases: ReturnType<typeof createUseCases>, date: string) =>
  useCases.searchAvailability({
    petId: ownedPet.id,
    selectedServiceIds: [services[0]!.id],
    groomerId: mayaId,
    startsOn: date,
    endsOn: date,
  });

const startTimes = (result: Awaited<ReturnType<typeof searchBathForMaya>>) =>
  result.slots.map((slot) => slot.startsAt.toISOString());

describe("searchAvailability", () => {
  it("derives duration, subtotal, service end, and cleanup-blocked time", async () => {
    const useCases = createUseCases();

    const result = await searchBathForMaya(useCases, "2026-09-07");
    const firstSlot = result.slots[0];

    expect(result).toMatchObject({
      timeZone: "America/New_York",
      totalDurationMinutes: 60,
      subtotalCents: 5500,
    });
    expect(firstSlot).toMatchObject({ groomerId: mayaId });
    expect(firstSlot?.startsAt).toEqual(new Date("2026-09-07T13:00:00.000Z"));
    expect(firstSlot?.serviceEndsAt).toEqual(
      new Date("2026-09-07T14:00:00.000Z"),
    );
    expect(firstSlot?.blockedUntil).toEqual(
      new Date("2026-09-07T14:15:00.000Z"),
    );
  });

  it("honors confirmed booking cleanup blocks and admits the first valid next boundary", async () => {
    const useCases = createUseCases([
      {
        groomerId: mayaId,
        startsAt: new Date("2026-09-07T13:00:00.000Z"),
        blockedUntil: new Date("2026-09-07T14:15:00.000Z"),
      },
    ]);

    const result = await searchBathForMaya(useCases, "2026-09-07");

    expect(startTimes(result)).not.toContain("2026-09-07T14:00:00.000Z");
    expect(startTimes(result)).toContain("2026-09-07T14:15:00.000Z");
  });

  it("does not return a slot whose cleanup buffer would extend past working hours", async () => {
    const useCases = createUseCases();

    const result = await useCases.searchAvailability({
      petId: ownedPet.id,
      selectedServiceIds: [services[1]!.id],
      groomerId: mayaId,
      startsOn: "2026-09-07",
      endsOn: "2026-09-07",
    });

    expect(result.slots.map((slot) => slot.startsAt.toISOString())).toContain(
      "2026-09-07T20:15:00.000Z",
    );
    expect(result.slots.map((slot) => slot.startsAt.toISOString())).not.toContain(
      "2026-09-07T20:30:00.000Z",
    );
  });

  it("removes slots overlapping an explicit time-off interval", async () => {
    const useCases = createUseCases();

    const result = await searchBathForMaya(useCases, "2026-09-02");

    expect(startTimes(result)).toContain("2026-09-02T14:45:00.000Z");
    expect(startTimes(result)).not.toContain("2026-09-02T15:00:00.000Z");
    expect(startTimes(result)).toContain("2026-09-02T18:00:00.000Z");
  });

  it("returns every qualifying groomer for any-available but excludes unqualified groomers", async () => {
    const useCases = createUseCases();

    const result = await useCases.searchAvailability({
      petId: ownedPet.id,
      selectedServiceIds: [services[1]!.id, services[3]!.id],
      groomerId: null,
      startsOn: "2026-09-07",
      endsOn: "2026-09-07",
    });

    expect(new Set(result.slots.map((slot) => slot.groomerId))).toEqual(
      new Set([mayaId]),
    );
  });

  it("converts local calendar boundaries using the business timezone across DST", async () => {
    const dstWorkingHours: ReadonlyArray<GroomerWorkingHours> = [
      {
        id: "00000000-0000-4000-8000-000000000d05",
        groomerId: mayaId,
        isoDayOfWeek: 6,
        startsAt: "09:00:00",
        endsAt: "10:00:00",
      },
      {
        id: "00000000-0000-4000-8000-000000000d06",
        groomerId: mayaId,
        isoDayOfWeek: 1,
        startsAt: "09:00:00",
        endsAt: "10:00:00",
      },
    ];
    const repository = createRepository();
    const useCases = createBookingUseCases({
      repository: {
        ...repository,
        listGroomerWorkingHours: async (groomerId) =>
          groomerId === mayaId ? dstWorkingHours : [],
      },
      getCurrentActor: async () => ({ id: customerId, role: "CUSTOMER" }),
    });

    const result = await useCases.searchAvailability({
      petId: ownedPet.id,
      selectedServiceIds: [services[2]!.id],
      groomerId: mayaId,
      startsOn: "2026-03-07",
      endsOn: "2026-03-09",
    });

    expect(result.slots.map((slot) => slot.startsAt.toISOString())).toContain(
      "2026-03-07T14:00:00.000Z",
    );
    expect(result.slots.map((slot) => slot.startsAt.toISOString())).toContain(
      "2026-03-09T13:00:00.000Z",
    );
  });

  it("rejects out-of-range searches and caller-supplied calculated values", async () => {
    const useCases = createUseCases();

    await expect(
      useCases.searchAvailability({
        petId: ownedPet.id,
        selectedServiceIds: [services[0]!.id],
        groomerId: mayaId,
        startsOn: "2026-09-01",
        endsOn: "2026-10-02",
      }),
    ).rejects.toBeInstanceOf(AvailabilitySearchValidationError);
    await expect(
      useCases.searchAvailability({
        petId: ownedPet.id,
        selectedServiceIds: [services[0]!.id],
        groomerId: mayaId,
        startsOn: "2026-09-07",
        endsOn: "2026-09-07",
        totalDurationMinutes: 1,
      }),
    ).rejects.toBeInstanceOf(AvailabilitySearchValidationError);
  });

  it("does not search with another customer's pet and rejects invalid date ranges", async () => {
    const useCases = createUseCases();

    await expect(
      useCases.searchAvailability({
        petId: otherPet.id,
        selectedServiceIds: [services[0]!.id],
        groomerId: mayaId,
        startsOn: "2026-09-07",
        endsOn: "2026-09-07",
      }),
    ).rejects.toBeInstanceOf(PetUnavailableError);
    await expect(
      useCases.searchAvailability({
        petId: ownedPet.id,
        selectedServiceIds: [services[0]!.id],
        groomerId: mayaId,
        startsOn: "2026-09-08",
        endsOn: "2026-09-07",
      }),
    ).rejects.toBeInstanceOf(AvailabilitySearchValidationError);
  });
});
