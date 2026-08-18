import "server-only";

import { addDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import { businessTimeZone } from "./business-time";
import type {
  Appointment,
  AppointmentServiceSnapshot,
  AvailabilitySearchResult,
  Groomer,
  Pet,
  Service,
} from "./use-cases";

export interface KravosCustomerProfile {
  readonly id: string;
  readonly displayName: string;
}

export interface KravosCustomerBookingUseCases {
  readonly listMyPets: () => Promise<ReadonlyArray<Pet>>;
  readonly createMyPet: (input: unknown) => Promise<Pet>;
  readonly listMyAppointments: () => Promise<ReadonlyArray<Appointment>>;
  readonly listMyAppointmentServices: () => Promise<
    ReadonlyArray<AppointmentServiceSnapshot>
  >;
  readonly listActiveGroomers: () => Promise<ReadonlyArray<Groomer>>;
  readonly searchAvailability: (input: unknown) => Promise<AvailabilitySearchResult>;
  readonly createAppointment: (input: unknown) => Promise<Appointment>;
  readonly rescheduleAppointment: (input: unknown) => Promise<Appointment>;
  readonly cancelAppointment: (input: unknown) => Promise<Appointment>;
}

export interface KravosBookingDependencies {
  readonly findCustomersByDisplayName: (
    displayName: string,
  ) => Promise<ReadonlyArray<KravosCustomerProfile>>;
  readonly getCustomerById: (
    customerId: string,
  ) => Promise<KravosCustomerProfile | null>;
  readonly listPetsByOwnerIds: (
    ownerIds: ReadonlyArray<string>,
  ) => Promise<ReadonlyArray<Pet>>;
  readonly listActiveServices: () => Promise<ReadonlyArray<Service>>;
  readonly listActiveGroomers: () => Promise<ReadonlyArray<Groomer>>;
  readonly getCustomerUseCases: (customerId: string) => KravosCustomerBookingUseCases;
  readonly now?: () => Date;
}

export class CustomerUnavailableError extends Error {
  public readonly code = "CUSTOMER_NOT_FOUND";
  public readonly status = 404;

  public constructor() {
    super("The selected customer was not found.");
    this.name = "CustomerUnavailableError";
  }
}

export class BookingSelectionUnavailableError extends Error {
  public readonly code = "BOOKING_SELECTION_NOT_FOUND";
  public readonly status = 422;

  public constructor() {
    super("The requested customer, pet, service, or groomer could not be selected.");
    this.name = "BookingSelectionUnavailableError";
  }
}

const normalized = (value: string): string => value.trim().toLocaleLowerCase();
const changeCutoffMilliseconds = 24 * 60 * 60 * 1_000;

export const createKravosBookingUseCases = (
  dependencies: KravosBookingDependencies,
) => {
  const requireCustomer = async (
    customerId: string,
  ): Promise<{
    readonly profile: KravosCustomerProfile;
    readonly useCases: KravosCustomerBookingUseCases;
  }> => {
    const profile = await dependencies.getCustomerById(customerId);
    if (profile === null) throw new CustomerUnavailableError();

    return { profile, useCases: dependencies.getCustomerUseCases(customerId) };
  };

  const resolveCustomer = async (input: {
    readonly customerName: string;
    readonly petName?: string;
  }) => {
    const requestedName = input.customerName.trim();
    const exactProfiles = (await dependencies.findCustomersByDisplayName(requestedName))
      .filter((candidate) => normalized(candidate.displayName) === normalized(requestedName))
      .slice(0, 5);
    if (exactProfiles.length === 0) {
      return { status: "NOT_FOUND" as const, matches: [] };
    }

    const pets = await dependencies.listPetsByOwnerIds(
      exactProfiles.map((candidate) => candidate.id),
    );
    const requestedPetName = input.petName === undefined ? null : normalized(input.petName);
    const profiles =
      requestedPetName === null
        ? exactProfiles
        : exactProfiles.filter((candidate) =>
            pets.some(
              (pet) =>
                pet.ownerId === candidate.id && normalized(pet.name) === requestedPetName,
            ),
          );
    if (profiles.length === 0) {
      return { status: "NOT_FOUND" as const, matches: [] };
    }

    const matches = profiles.map((customer) => ({
      customer,
      pets: pets.filter((pet) => pet.ownerId === customer.id),
    }));
    if (matches.length === 1) {
      const match = matches[0]!;
      return { status: "RESOLVED" as const, ...match };
    }

    return { status: "AMBIGUOUS" as const, matches };
  };

  const getCatalog = async () => ({
    services: await dependencies.listActiveServices(),
    groomers: await dependencies.listActiveGroomers(),
  });

  const resolveBookingSelection = async (input: {
    readonly customerName: string;
    readonly petName: string;
    readonly serviceNames: ReadonlyArray<string>;
    readonly groomerName?: string;
  }) => {
    const resolution = await resolveCustomer({
      customerName: input.customerName,
      petName: input.petName,
    });
    if (resolution.status !== "RESOLVED") throw new CustomerUnavailableError();

    const pet = resolution.pets.find(
      (candidate) => normalized(candidate.name) === normalized(input.petName),
    );
    const catalog = await getCatalog();
    const services = input.serviceNames.map((serviceName) =>
      catalog.services.find(
        (candidate) => normalized(candidate.name) === normalized(serviceName),
      ),
    );
    const groomer =
      input.groomerName === undefined
        ? null
        : catalog.groomers.find(
            (candidate) =>
              normalized(candidate.displayName) === normalized(input.groomerName!),
          );
    if (
      pet === undefined ||
      services.some((service) => service === undefined) ||
      (input.groomerName !== undefined && groomer === undefined)
    ) {
      throw new BookingSelectionUnavailableError();
    }

    return {
      customer: resolution.customer,
      pet,
      services: services.filter((service): service is Service => service !== undefined),
      groomer: groomer ?? null,
    };
  };

  const getCustomerContext = async (customerId: string) => {
    const { profile, useCases } = await requireCustomer(customerId);
    const [pets, appointments, snapshots, groomers] = await Promise.all([
      useCases.listMyPets(),
      useCases.listMyAppointments(),
      useCases.listMyAppointmentServices(),
      useCases.listActiveGroomers(),
    ]);
    const now = (dependencies.now ?? (() => new Date()))().getTime();
    const visibleAppointments = appointments.slice(0, 8);

    return {
      timeZone: businessTimeZone,
      customer: profile,
      pets,
      appointmentCount: appointments.length,
      appointmentsTruncated: visibleAppointments.length < appointments.length,
      appointments: visibleAppointments.map((appointment) => ({
        ...appointment,
        services: snapshots.filter(
          (snapshot) => snapshot.appointmentId === appointment.id,
        ),
        petName:
          pets.find((candidate) => candidate.id === appointment.petId)?.name ??
          "Customer pet",
        groomerName:
          groomers.find((candidate) => candidate.id === appointment.groomerId)
            ?.displayName ?? "Assigned groomer",
        canChange:
          appointment.status === "CONFIRMED" &&
          appointment.startsAt.getTime() > now + changeCutoffMilliseconds,
        changeCutoffAt: new Date(
          appointment.startsAt.getTime() - changeCutoffMilliseconds,
        ).toISOString(),
      })),
    };
  };

  const createPet = async (input: {
    readonly customerId: string;
    readonly pet: unknown;
  }): Promise<Pet> => {
    const { useCases } = await requireCustomer(input.customerId);

    return useCases.createMyPet(input.pet);
  };

  const createPetForResolvedCustomer = async (input: {
    readonly customerName: string;
    readonly pet: unknown;
  }) => {
    const resolution = await resolveCustomer({ customerName: input.customerName });
    if (resolution.status !== "RESOLVED") return resolution;

    return {
      status: "CREATED" as const,
      customer: resolution.customer,
      pet: await createPet({ customerId: resolution.customer.id, pet: input.pet }),
    };
  };

  const searchAvailability = async (
    input: {
      readonly customerId: string;
      readonly petId: string;
      readonly selectedServiceIds: ReadonlyArray<string>;
      readonly groomerId: string | null;
      readonly startsOn: string;
      readonly endsOn: string;
    },
  ) => {
    const { useCases } = await requireCustomer(input.customerId);
    const result = await useCases.searchAvailability({
      petId: input.petId,
      selectedServiceIds: input.selectedServiceIds,
      groomerId: input.groomerId,
      startsOn: input.startsOn,
      endsOn: input.endsOn,
    });
    const groomers = await dependencies.listActiveGroomers();
    const visibleSlots = result.slots.slice(0, 8);

    return {
      ...result,
      slotCount: result.slots.length,
      slotsTruncated: visibleSlots.length < result.slots.length,
      slots: visibleSlots.map((slot) => ({
        ...slot,
        groomerName:
          groomers.find((groomer) => groomer.id === slot.groomerId)?.displayName ??
          "Assigned groomer",
      })),
    };
  };

  const createAppointment = async (input: {
    readonly customerId: string;
    readonly petId: string;
    readonly groomerId: string;
    readonly selectedServiceIds: ReadonlyArray<string>;
    readonly startsAt: string;
    readonly idempotencyKey: string;
  }) => {
    const { useCases } = await requireCustomer(input.customerId);
    const { customerId: _customerId, ...appointmentInput } = input;
    void _customerId;
    return useCases.createAppointment(appointmentInput);
  };

  const rescheduleAppointment = async (input: {
    readonly customerId: string;
    readonly appointmentId: string;
    readonly groomerId: string;
    readonly selectedServiceIds: ReadonlyArray<string>;
    readonly startsAt: string;
    readonly idempotencyKey: string;
  }) => {
    const { useCases } = await requireCustomer(input.customerId);
    const { customerId: _customerId, ...appointmentInput } = input;
    void _customerId;
    return useCases.rescheduleAppointment(appointmentInput);
  };

  const cancelAppointment = async (input: {
    readonly customerId: string;
    readonly appointmentId: string;
    readonly idempotencyKey: string;
  }) => {
    const { useCases } = await requireCustomer(input.customerId);
    return useCases.cancelAppointment({
      appointmentId: input.appointmentId,
      idempotencyKey: input.idempotencyKey,
    });
  };

  const searchBookingOptions = async (input: {
    readonly customerName: string;
    readonly petName: string;
    readonly serviceNames: ReadonlyArray<string>;
    readonly groomerName?: string;
    readonly startsOn?: string;
    readonly endsOn?: string;
  }) => {
    const selection = await resolveBookingSelection(input);
    const now = (dependencies.now ?? (() => new Date()))();
    const startsOn =
      input.startsOn ??
      formatInTimeZone(addDays(now, 1), businessTimeZone, "yyyy-MM-dd");
    const endsOn =
      input.endsOn ??
      (input.startsOn === undefined
        ? formatInTimeZone(addDays(now, 14), businessTimeZone, "yyyy-MM-dd")
        : startsOn);
    const availability = await searchAvailability({
      customerId: selection.customer.id,
      petId: selection.pet.id,
      selectedServiceIds: selection.services.map((service) => service.id),
      groomerId: selection.groomer?.id ?? null,
      startsOn,
      endsOn,
    });

    return {
      ...availability,
      selection: {
        customerName: selection.customer.displayName,
        petName: selection.pet.name,
        serviceNames: selection.services.map((service) => service.name),
        groomerName: selection.groomer?.displayName ?? null,
        startsOn,
        endsOn,
      },
    };
  };

  const confirmBooking = async (input: {
    readonly customerName: string;
    readonly petName: string;
    readonly serviceNames: ReadonlyArray<string>;
    readonly groomerName: string;
    readonly startsOn: string;
    readonly startTime: string;
    readonly idempotencyKey: string;
  }) => {
    const selection = await resolveBookingSelection(input);
    if (selection.groomer === null) throw new BookingSelectionUnavailableError();
    const startsAt = fromZonedTime(
      `${input.startsOn}T${input.startTime}:00`,
      businessTimeZone,
    );
    if (Number.isNaN(startsAt.getTime())) throw new BookingSelectionUnavailableError();

    return createAppointment({
      customerId: selection.customer.id,
      petId: selection.pet.id,
      groomerId: selection.groomer.id,
      selectedServiceIds: selection.services.map((service) => service.id),
      startsAt: startsAt.toISOString(),
      idempotencyKey: input.idempotencyKey,
    });
  };

  const rescheduleBooking = async (input: {
    readonly customerName: string;
    readonly petName: string;
    readonly currentStartsOn: string;
    readonly currentStartTime: string;
    readonly groomerName: string;
    readonly startsOn: string;
    readonly startTime: string;
    readonly idempotencyKey: string;
  }) => {
    const resolution = await resolveCustomer({
      customerName: input.customerName,
      petName: input.petName,
    });
    if (resolution.status !== "RESOLVED") throw new CustomerUnavailableError();

    const [context, groomers] = await Promise.all([
      getCustomerContext(resolution.customer.id),
      dependencies.listActiveGroomers(),
    ]);
    const currentStartsAt = fromZonedTime(
      `${input.currentStartsOn}T${input.currentStartTime}:00`,
      businessTimeZone,
    );
    const startsAt = fromZonedTime(
      `${input.startsOn}T${input.startTime}:00`,
      businessTimeZone,
    );
    const appointment = context.appointments.find(
      (candidate) =>
        candidate.status === "CONFIRMED" &&
        normalized(candidate.petName) === normalized(input.petName) &&
        candidate.startsAt.getTime() === currentStartsAt.getTime(),
    );
    const groomer = groomers.find(
      (candidate) =>
        normalized(candidate.displayName) === normalized(input.groomerName),
    );
    if (
      Number.isNaN(currentStartsAt.getTime()) ||
      Number.isNaN(startsAt.getTime()) ||
      appointment === undefined ||
      appointment.services.length === 0 ||
      groomer === undefined
    ) {
      throw new BookingSelectionUnavailableError();
    }

    return rescheduleAppointment({
      customerId: resolution.customer.id,
      appointmentId: appointment.id,
      groomerId: groomer.id,
      selectedServiceIds: appointment.services.map((service) => service.serviceId),
      startsAt: startsAt.toISOString(),
      idempotencyKey: input.idempotencyKey,
    });
  };

  return {
    resolveCustomer,
    getCatalog,
    getCustomerContext,
    createPet,
    createPetForResolvedCustomer,
    searchAvailability,
    createAppointment,
    rescheduleAppointment,
    cancelAppointment,
    searchBookingOptions,
    confirmBooking,
    rescheduleBooking,
  };
};
