import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  Appointment,
  BookingRepository,
  CreateAppointmentInput,
  CreatePetRecord,
  Pet,
  RescheduleAppointmentInput,
  UpdatePetRecord,
} from "../../../lib/booking/use-cases";
import {
  AppointmentStateError,
  AppointmentUnavailableError,
  IdempotencyKeyError,
  SlotUnavailableError,
} from "../../../lib/booking/use-cases";

const fixtures = vi.hoisted(() => ({
  currentActorId: null as string | null,
  repository: null as unknown,
  supabase: { requestScoped: true },
  users: new Map<string, { readonly id: string; readonly role: "CUSTOMER" | "ADMIN" }>(),
}));

const createSupabaseServerClient = vi.hoisted(() => vi.fn(async () => fixtures.supabase));
const createSupabaseAuthDependencies = vi.hoisted(() =>
  vi.fn(() => ({
    getVerifiedUserId: async () => fixtures.currentActorId,
    getProfile: async (userId: string) => fixtures.users.get(userId) ?? null,
  })),
);
const createSupabaseBookingRepository = vi.hoisted(() => vi.fn(() => fixtures.repository));

vi.mock("../../../lib/supabase/server", () => ({ createSupabaseServerClient }));
vi.mock("../../../lib/auth/server", () => ({ createSupabaseAuthDependencies }));
vi.mock("../../../lib/booking/supabase-repository", () => ({
  createSupabaseBookingRepository,
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

const customerOneId = "00000000-0000-4000-8000-000000004501";
const customerTwoId = "00000000-0000-4000-8000-000000004502";
const administratorId = "00000000-0000-4000-8000-000000004503";
const petOneId = "00000000-0000-4000-8000-000000004511";
const petTwoId = "00000000-0000-4000-8000-000000004512";
const groomerId = "20000000-0000-0000-0000-000000000001";
const serviceId = "10000000-0000-0000-0000-000000000001";
const appointmentId = "00000000-0000-4000-8000-000000004521";

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

const context = <const Parameters extends Record<string, string>>(
  parameters: Parameters,
) => ({
  params: Promise.resolve(parameters),
});

const asJson = async (response: Response): Promise<{
  readonly data?: unknown;
  readonly error?: { readonly code: string };
}> => response.json();

const responseAppointment = (body: unknown) =>
  (body as { readonly data: { readonly id: string; readonly status: string } }).data;

const intervalOverlaps = (left: Appointment, right: Appointment): boolean =>
  left.startsAt < right.blockedUntil && left.blockedUntil > right.startsAt;

const createSeededRepository = (): BookingRepository => {
  const pets: Array<Pet> = [];
  const appointments: Array<Appointment> = [];
  const idempotency = new Map<
    string,
    { readonly fingerprint: string; readonly response: Appointment }
  >();
  const service = {
    id: serviceId,
    name: "Bath & Brush",
    description: "Bath, drying, brush-out, and light tidy.",
    kind: "BASE" as const,
    isStandaloneEligible: false,
    durationMinutes: 60,
    priceCents: 5500,
    isActive: true,
  };
  const actorId = (): string => {
    if (fixtures.currentActorId === null) {
      throw new Error("Repository should not run without the real auth guard.");
    }

    return fixtures.currentActorId;
  };
  const toAppointment = (
    input: CreateAppointmentInput | RescheduleAppointmentInput,
    customerId: string,
    id = appointmentId,
  ): Appointment => {
    const startsAt = new Date(input.startsAt);
    const serviceEndsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);

    return {
      id,
      customerId,
      petId:
        "petId" in input
          ? input.petId
          : appointments.find((appointment) => appointment.id === input.appointmentId)!
              .petId,
      groomerId: input.groomerId,
      status: "CONFIRMED",
      startsAt,
      serviceEndsAt,
      blockedUntil: new Date(serviceEndsAt.getTime() + 15 * 60_000),
      subtotalCents: service.priceCents,
      appliedBufferMinutes: 15,
      cancelledAt: null,
    };
  };
  const createFingerprint = (
    input: CreateAppointmentInput | RescheduleAppointmentInput,
  ) =>
    JSON.stringify({
      ...input,
      selectedServiceIds: [...input.selectedServiceIds].sort(),
    });
  const replayOrReserve = (
    operation: string,
    input:
      | CreateAppointmentInput
      | RescheduleAppointmentInput
      | { readonly appointmentId: string; readonly idempotencyKey: string },
    fingerprint: string,
  ): Appointment | null => {
    const key = `${actorId()}:${operation}:${input.idempotencyKey}`;
    const existing = idempotency.get(key);
    if (existing === undefined) {
      return null;
    }
    if (existing.fingerprint !== fingerprint) {
      throw new IdempotencyKeyError("IDEMPOTENCY_KEY_REUSED");
    }

    return existing.response;
  };
  const saveIdempotency = (
    operation: string,
    key: string,
    fingerprint: string,
    response: Appointment,
  ) => {
    idempotency.set(`${actorId()}:${operation}:${key}`, { fingerprint, response });
  };

  return {
    listServices: async () => [service],
    listServiceCompatibility: async () => [],
    listGroomers: async () => [
      {
        id: groomerId,
        displayName: "Maya Chen",
        bio: "Senior groomer",
        isActive: true,
      },
    ],
    listGroomerServiceQualifications: async () => [
      { groomerId, serviceId },
    ],
    listGroomerWorkingHours: async () => [
      {
        id: "30000000-0000-0000-0000-000000000101",
        groomerId,
        isoDayOfWeek: 1,
        startsAt: "09:00",
        endsAt: "18:00",
      },
    ],
    listGroomerTimeOff: async () => [],
    listConfirmedAppointmentBlocks: async (requestedGroomerId, range) =>
      appointments
        .filter(
          (appointment) =>
            appointment.groomerId === requestedGroomerId &&
            appointment.status === "CONFIRMED" &&
            appointment.startsAt < range.endsAt &&
            appointment.blockedUntil > range.startsAt,
        )
        .map((appointment) => ({
          groomerId: appointment.groomerId,
          startsAt: appointment.startsAt,
          blockedUntil: appointment.blockedUntil,
        })),
    createConfirmedAppointment: async (input) => {
      const fingerprint = createFingerprint(input);
      const replay = replayOrReserve("CREATE_APPOINTMENT", input, fingerprint);
      if (replay !== null) {
        return replay;
      }
      const created = toAppointment(input, actorId());
      if (
        appointments.some(
          (existing) =>
            existing.groomerId === created.groomerId &&
            existing.status === "CONFIRMED" &&
            intervalOverlaps(existing, created),
        )
      ) {
        throw new SlotUnavailableError();
      }
      appointments.push(created);
      saveIdempotency("CREATE_APPOINTMENT", input.idempotencyKey, fingerprint, created);
      return created;
    },
    rescheduleConfirmedAppointment: async (input) => {
      const fingerprint = createFingerprint(input);
      const replay = replayOrReserve("RESCHEDULE_APPOINTMENT", input, fingerprint);
      if (replay !== null) {
        return replay;
      }
      const existing = appointments.find(
        (appointment) => appointment.id === input.appointmentId,
      );
      if (existing === undefined || existing.customerId !== actorId()) {
        throw new AppointmentUnavailableError();
      }
      if (existing.status !== "CONFIRMED") {
        throw new AppointmentStateError();
      }
      const rescheduled = toAppointment(input, actorId(), existing.id);
      if (
        appointments.some(
          (candidate) =>
            candidate.id !== existing.id &&
            candidate.groomerId === rescheduled.groomerId &&
            candidate.status === "CONFIRMED" &&
            intervalOverlaps(candidate, rescheduled),
        )
      ) {
        throw new SlotUnavailableError();
      }
      Object.assign(existing, rescheduled);
      saveIdempotency("RESCHEDULE_APPOINTMENT", input.idempotencyKey, fingerprint, existing);
      return existing;
    },
    cancelConfirmedAppointment: async (input) => {
      const fingerprint = input.appointmentId;
      const replay = replayOrReserve("CANCEL_APPOINTMENT", input, fingerprint);
      if (replay !== null) {
        return replay;
      }
      const existing = appointments.find(
        (appointment) => appointment.id === input.appointmentId,
      );
      const actor = fixtures.users.get(actorId());
      if (
        existing === undefined ||
        actor === undefined ||
        (existing.customerId !== actor.id && actor.role !== "ADMIN")
      ) {
        throw new AppointmentUnavailableError();
      }
      if (existing.status !== "CONFIRMED") {
        throw new AppointmentStateError();
      }
      const cancelled: Appointment = {
        ...existing,
        status: "CANCELLED",
        cancelledAt: new Date("2028-09-01T13:00:00.000Z"),
      };
      Object.assign(existing, cancelled);
      saveIdempotency("CANCEL_APPOINTMENT", input.idempotencyKey, fingerprint, existing);
      return existing;
    },
    listAppointmentsByCustomer: async (customerId) =>
      appointments.filter((appointment) => appointment.customerId === customerId),
    listPetsByOwner: async (ownerId) => pets.filter((pet) => pet.ownerId === ownerId),
    getPetByOwner: async (id, ownerId) =>
      pets.find((pet) => pet.id === id && pet.ownerId === ownerId) ?? null,
    createPet: async (input: CreatePetRecord) => {
      const pet: Pet = {
        id: input.ownerId === customerOneId ? petOneId : petTwoId,
        ...input,
      };
      pets.push(pet);
      return pet;
    },
    updatePetByOwner: async (id, ownerId, input: UpdatePetRecord) => {
      const pet = pets.find((candidate) => candidate.id === id && candidate.ownerId === ownerId);
      if (pet === undefined) {
        return null;
      }
      Object.assign(pet, input);
      return pet;
    },
    deletePetByOwner: async (id, ownerId) => {
      const index = pets.findIndex((pet) => pet.id === id && pet.ownerId === ownerId);
      if (index === -1) {
        return false;
      }
      pets.splice(index, 1);
      return true;
    },
  };
};

beforeEach(() => {
  fixtures.currentActorId = null;
  fixtures.users.clear();
  fixtures.users.set(customerOneId, { id: customerOneId, role: "CUSTOMER" });
  fixtures.users.set(customerTwoId, { id: customerTwoId, role: "CUSTOMER" });
  fixtures.users.set(administratorId, { id: administratorId, role: "ADMIN" });
  fixtures.repository = createSeededRepository();
  vi.clearAllMocks();
});

describe("/api/v1 seeded HTTP lifecycle", () => {
  it("runs the complete customer lifecycle through real route composition and preserves ownership, retries, and stale-slot conflicts", async () => {
    await expect(getServices(request("/api/v1/services", "GET"))).resolves.toHaveProperty(
      "status",
      401,
    );

    fixtures.currentActorId = customerOneId;
    const catalogue = await getServices(request("/api/v1/services", "GET"));
    const groomers = await getGroomers(request("/api/v1/groomers", "GET"));
    const firstPet = await createPet(
      request("/api/v1/pets", "POST", {
        name: "Milo",
        breed: "Golden Retriever",
        size: "LARGE",
        ageYears: 4,
      }),
    );
    const petsForCustomerOne = await getPets(request("/api/v1/pets", "GET"));
    const availability = await searchAvailability(
      request("/api/v1/availability/search", "POST", {
        petId: petOneId,
        selectedServiceIds: [serviceId],
        groomerId,
        startsOn: "2028-09-04",
        endsOn: "2028-09-04",
      }),
    );
    const createInput = {
      petId: petOneId,
      groomerId,
      selectedServiceIds: [serviceId],
      startsAt: "2028-09-04T13:00:00.000Z",
    };
    const created = await createAppointment(
      request("/api/v1/appointments", "POST", createInput, {
        "Idempotency-Key": "customer-one-create",
      }),
    );
    const replayed = await createAppointment(
      request("/api/v1/appointments", "POST", createInput, {
        "Idempotency-Key": "customer-one-create",
      }),
    );
    const listed = await getAppointments(request("/api/v1/appointments", "GET"));

    expect(catalogue.status).toBe(200);
    expect(groomers.status).toBe(200);
    expect(firstPet.status).toBe(201);
    expect(petsForCustomerOne.status).toBe(200);
    expect((await asJson(petsForCustomerOne)).data).toMatchObject({
      pets: [{ id: petOneId, name: "Milo" }],
    });
    expect(availability.status).toBe(200);
    const availabilityBody = await asJson(availability);
    expect(availabilityBody.data).toMatchObject({
      totalDurationMinutes: 60,
      subtotalCents: 5500,
    });
    expect(
      (
        availabilityBody.data as {
          readonly slots: ReadonlyArray<{ readonly groomerId: string; readonly startsAt: string }>;
        }
      ).slots,
    ).toContainEqual(expect.objectContaining({ groomerId, startsAt: createInput.startsAt }));
    expect(created.status).toBe(201);
    expect(replayed.status).toBe(201);
    expect(responseAppointment(await asJson(replayed)).id).toBe(
      responseAppointment(await asJson(created)).id,
    );
    expect(listed.status).toBe(200);
    expect((await asJson(listed)).data).toMatchObject({
      appointments: [{ id: appointmentId, petId: petOneId, status: "CONFIRMED" }],
    });

    fixtures.currentActorId = customerTwoId;
    const secondPet = await createPet(
      request("/api/v1/pets", "POST", {
        name: "Luna",
        breed: "Poodle",
        size: "SMALL",
        ageYears: 3,
      }),
    );
    const secondCustomerAppointments = await getAppointments(
      request("/api/v1/appointments", "GET"),
    );
    const crossCustomerUpdate = await updatePet(
      request(`/api/v1/pets/${petOneId}`, "PATCH", { name: "Stolen" }),
      context({ petId: petOneId }),
    );
    const staleSlot = await createAppointment(
      request(
        "/api/v1/appointments",
        "POST",
        { ...createInput, petId: petTwoId },
        { "Idempotency-Key": "customer-two-conflict" },
      ),
    );

    expect(secondPet.status).toBe(201);
    expect(secondCustomerAppointments.status).toBe(200);
    expect((await asJson(secondCustomerAppointments)).data).toMatchObject({
      appointments: [],
    });
    expect(crossCustomerUpdate.status).toBe(404);
    expect((await asJson(crossCustomerUpdate)).error?.code).toBe("PET_NOT_FOUND");
    expect(staleSlot.status).toBe(409);
    expect((await asJson(staleSlot)).error?.code).toBe("SLOT_UNAVAILABLE");

    fixtures.currentActorId = customerOneId;
    const rescheduled = await rescheduleAppointment(
      request(
        `/api/v1/appointments/${appointmentId}/reschedule`,
        "POST",
        {
          groomerId,
          selectedServiceIds: [serviceId],
          startsAt: "2028-09-04T15:00:00.000Z",
        },
        { "Idempotency-Key": "customer-one-reschedule" },
      ),
      context({ appointmentId }),
    );
    const cancelled = await cancelAppointment(
      request(
        `/api/v1/appointments/${appointmentId}/cancel`,
        "POST",
        undefined,
        { "Idempotency-Key": "customer-one-cancel" },
      ),
      context({ appointmentId }),
    );
    const invalidRepeatCancel = await cancelAppointment(
      request(
        `/api/v1/appointments/${appointmentId}/cancel`,
        "POST",
        undefined,
        { "Idempotency-Key": "customer-one-cancel-again" },
      ),
      context({ appointmentId }),
    );

    expect(rescheduled.status).toBe(200);
    expect(cancelled.status).toBe(200);
    expect(responseAppointment(await asJson(cancelled)).status).toBe("CANCELLED");
    expect(invalidRepeatCancel.status).toBe(409);
    expect((await asJson(invalidRepeatCancel)).error?.code).toBe(
      "APPOINTMENT_NOT_CHANGEABLE",
    );
  });

  it("limits admin HTTP access to own customer resources while permitting the documented admin cancellation", async () => {
    fixtures.currentActorId = customerOneId;
    const createdPet = await createPet(
      request("/api/v1/pets", "POST", {
        name: "Milo",
        breed: "Golden Retriever",
        size: "LARGE",
        ageYears: 4,
      }),
    );
    const createdAppointment = await createAppointment(
      request(
        "/api/v1/appointments",
        "POST",
        {
          petId: petOneId,
          groomerId,
          selectedServiceIds: [serviceId],
          startsAt: "2028-09-04T13:00:00.000Z",
        },
        { "Idempotency-Key": "customer-one-admin-cancel-fixture" },
      ),
    );
    expect(createdPet.status).toBe(201);
    expect(createdAppointment.status).toBe(201);

    fixtures.currentActorId = administratorId;
    const adminPets = await getPets(request("/api/v1/pets", "GET"));
    const adminAppointments = await getAppointments(
      request("/api/v1/appointments", "GET"),
    );
    const adminPetMutation = await updatePet(
      request(`/api/v1/pets/${petOneId}`, "PATCH", { name: "Not allowed" }),
      context({ petId: petOneId }),
    );
    const adminCancellation = await cancelAppointment(
      request(
        `/api/v1/appointments/${appointmentId}/cancel`,
        "POST",
        undefined,
        { "Idempotency-Key": "administrator-cancel-customer-one" },
      ),
      context({ appointmentId }),
    );

    expect(adminPets.status).toBe(200);
    expect((await asJson(adminPets)).data).toMatchObject({ pets: [] });
    expect(adminAppointments.status).toBe(200);
    expect((await asJson(adminAppointments)).data).toMatchObject({ appointments: [] });
    expect(adminPetMutation.status).toBe(404);
    expect((await asJson(adminPetMutation)).error?.code).toBe("PET_NOT_FOUND");
    expect(adminCancellation.status).toBe(200);
    expect(responseAppointment(await asJson(adminCancellation)).status).toBe("CANCELLED");

    fixtures.currentActorId = customerOneId;
    const customerAppointments = await getAppointments(
      request("/api/v1/appointments", "GET"),
    );
    expect((await asJson(customerAppointments)).data).toMatchObject({
      appointments: [{ id: appointmentId, status: "CANCELLED" }],
    });
  });

  it("rejects malformed lifecycle requests before the seeded repository runs", async () => {
    fixtures.currentActorId = customerOneId;

    const missingKey = await createAppointment(
      request("/api/v1/appointments", "POST", {
        petId: petOneId,
        groomerId,
        selectedServiceIds: [serviceId],
        startsAt: "2028-09-04T13:00:00.000Z",
      }),
    );
    const malformedRouteId = await deletePet(
      request("/api/v1/pets/not-a-uuid", "DELETE"),
      context({ petId: "not-a-uuid" }),
    );

    expect(missingKey.status).toBe(422);
    expect((await asJson(missingKey)).error?.code).toBe("VALIDATION_ERROR");
    expect(malformedRouteId.status).toBe(422);
    expect((await asJson(malformedRouteId)).error?.code).toBe("VALIDATION_ERROR");
  });
});
