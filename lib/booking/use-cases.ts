import "server-only";

import { fromZonedTime } from "date-fns-tz";
import { z } from "zod";

import type { AuthenticatedActor } from "../auth/guards";

const businessTimeZone = "America/New_York";
const cleanupBufferMinutes = 15;
const slotIntervalMinutes = 15;
const maximumAvailabilitySearchDays = 31;

/** A booking service exposed to the customer-facing catalogue. */
export interface Service {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly kind: "BASE" | "ADD_ON";
  readonly isStandaloneEligible: boolean;
  readonly durationMinutes: number;
  readonly priceCents: number;
  readonly isActive: boolean;
}

/** One persisted base-service/add-on relationship. */
export interface ServiceCompatibility {
  readonly baseServiceId: string;
  readonly addOnServiceId: string;
}

/** A groomer who may be considered for a booking. */
export interface Groomer {
  readonly id: string;
  readonly displayName: string;
  readonly bio: string | null;
  readonly isActive: boolean;
}

/** One service qualification held by a groomer. */
export interface GroomerServiceQualification {
  readonly groomerId: string;
  readonly serviceId: string;
}

/** A recurring weekly working-hours interval for a groomer. */
export interface GroomerWorkingHours {
  readonly id: string;
  readonly groomerId: string;
  readonly isoDayOfWeek: number;
  readonly startsAt: string;
  readonly endsAt: string;
}

/** A dated interval during which a groomer is unavailable. */
export interface GroomerTimeOff {
  readonly id: string;
  readonly groomerId: string;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly reason: string | null;
}

/** A customer-owned pet. */
export interface Pet {
  readonly id: string;
  readonly ownerId: string;
  readonly name: string;
  readonly breed: string;
  readonly size: "SMALL" | "MEDIUM" | "LARGE";
  readonly ageYears: number;
  readonly temperament: string | null;
  readonly coatCondition: string | null;
  readonly allergies: string | null;
  readonly notes: string | null;
}

/** A concrete period of time that is available or unavailable. */
export interface TimeInterval {
  readonly startsAt: Date;
  readonly endsAt: Date;
}

/** A confirmed interval that occupies a groomer's schedule through cleanup. */
export interface ConfirmedAppointmentBlock {
  readonly groomerId: string;
  readonly startsAt: Date;
  readonly blockedUntil: Date;
}

/** Customer-controlled availability inputs; duration and price are excluded. */
export interface AvailabilitySearchInput {
  readonly petId: string;
  readonly selectedServiceIds: ReadonlyArray<string>;
  readonly groomerId: string | null;
  /** Inclusive calendar date in the configured business timezone. */
  readonly startsOn: string;
  /** Inclusive calendar date in the configured business timezone. */
  readonly endsOn: string;
}

/** A server-calculated candidate appointment, stored as UTC instants. */
export interface AvailabilitySlot {
  readonly groomerId: string;
  readonly startsAt: Date;
  readonly serviceEndsAt: Date;
  readonly blockedUntil: Date;
}

/** A deterministic availability result using the approved business timezone. */
export interface AvailabilitySearchResult {
  readonly timeZone: typeof businessTimeZone;
  readonly totalDurationMinutes: number;
  readonly subtotalCents: number;
  readonly slots: ReadonlyArray<AvailabilitySlot>;
}

/** A booking lifecycle record with server-derived timing and pricing. */
export interface Appointment {
  readonly id: string;
  readonly customerId: string;
  readonly petId: string;
  readonly groomerId: string;
  readonly status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  readonly startsAt: Date;
  readonly serviceEndsAt: Date;
  readonly blockedUntil: Date;
  readonly subtotalCents: number;
  readonly appliedBufferMinutes: number;
  readonly cancelledAt: Date | null;
}

/** Customer-controlled inputs for a confirmed appointment create. */
export interface CreateAppointmentInput {
  readonly petId: string;
  readonly groomerId: string;
  readonly selectedServiceIds: ReadonlyArray<string>;
  readonly startsAt: string;
  /** Nonblank opaque key supplied once per mutation; retries replay its saved response. */
  readonly idempotencyKey: string;
}

/** Customer-controlled inputs for an atomic appointment reschedule. */
export interface RescheduleAppointmentInput {
  readonly appointmentId: string;
  readonly groomerId: string;
  readonly selectedServiceIds: ReadonlyArray<string>;
  readonly startsAt: string;
  /** Nonblank opaque key supplied once per mutation; retries replay its saved response. */
  readonly idempotencyKey: string;
}

/** Customer-controlled input for an appointment cancellation. */
export interface CancelAppointmentInput {
  readonly appointmentId: string;
  /** Nonblank opaque key supplied once per mutation; retries replay its saved response. */
  readonly idempotencyKey: string;
}

export interface CreatePetRecord {
  readonly ownerId: string;
  readonly name: string;
  readonly breed: string;
  readonly size: Pet["size"];
  readonly ageYears: number;
  readonly temperament: string | null;
  readonly coatCondition: string | null;
  readonly allergies: string | null;
  readonly notes: string | null;
}

export interface UpdatePetRecord {
  readonly name?: string;
  readonly breed?: string;
  readonly size?: Pet["size"];
  readonly ageYears?: number;
  readonly temperament?: string | null;
  readonly coatCondition?: string | null;
  readonly allergies?: string | null;
  readonly notes?: string | null;
}

/**
 * Persistence boundary for Task 5 booking-domain operations.
 *
 * The production implementation uses the request-scoped Supabase client, while
 * deterministic tests provide an in-memory implementation.
 */
export interface BookingRepository {
  readonly listServices: () => Promise<ReadonlyArray<Service>>;
  readonly listServiceCompatibility: () => Promise<
    ReadonlyArray<ServiceCompatibility>
  >;
  readonly listGroomers: () => Promise<ReadonlyArray<Groomer>>;
  readonly listGroomerServiceQualifications: () => Promise<
    ReadonlyArray<GroomerServiceQualification>
  >;
  readonly listGroomerWorkingHours: (
    groomerId: string,
  ) => Promise<ReadonlyArray<GroomerWorkingHours>>;
  readonly listGroomerTimeOff: (
    groomerId: string,
  ) => Promise<ReadonlyArray<GroomerTimeOff>>;
  readonly listConfirmedAppointmentBlocks: (
    groomerId: string,
    range: TimeInterval,
  ) => Promise<ReadonlyArray<ConfirmedAppointmentBlock>>;
  /** Each mutation is a single database transaction/RPC. */
  readonly createConfirmedAppointment: (
    input: CreateAppointmentInput,
  ) => Promise<Appointment>;
  readonly rescheduleConfirmedAppointment: (
    input: RescheduleAppointmentInput,
  ) => Promise<Appointment>;
  readonly cancelConfirmedAppointment: (
    input: CancelAppointmentInput,
  ) => Promise<Appointment>;
  readonly listAppointmentsByCustomer: (
    customerId: string,
  ) => Promise<ReadonlyArray<Appointment>>;
  readonly listPetsByOwner: (ownerId: string) => Promise<ReadonlyArray<Pet>>;
  readonly getPetByOwner: (
    petId: string,
    ownerId: string,
  ) => Promise<Pet | null>;
  readonly createPet: (input: CreatePetRecord) => Promise<Pet>;
  readonly updatePetByOwner: (
    petId: string,
    ownerId: string,
    input: UpdatePetRecord,
  ) => Promise<Pet | null>;
  readonly deletePetByOwner: (
    petId: string,
    ownerId: string,
  ) => Promise<boolean>;
}

/** Input dependencies for server-only booking use cases. */
export interface BookingUseCaseDependencies {
  readonly repository: BookingRepository;
  /** Returns identity derived from the verified server-side Supabase session. */
  readonly getCurrentActor: () => Promise<AuthenticatedActor>;
}

/** A successfully validated customer service selection. */
export interface ResolvedServiceSelection {
  readonly services: ReadonlyArray<Service>;
  readonly baseService: Service | null;
  readonly isStandaloneExpress: boolean;
  readonly totalDurationMinutes: number;
  readonly subtotalCents: number;
}

/** An active groomer's schedule inputs for later availability calculation. */
export interface GroomerSchedule {
  readonly groomer: Groomer;
  readonly workingHours: ReadonlyArray<GroomerWorkingHours>;
  readonly timeOff: ReadonlyArray<GroomerTimeOff>;
}

type ServiceSelectionErrorCode =
  | "NO_SERVICES_SELECTED"
  | "DUPLICATE_SERVICE_SELECTION"
  | "UNKNOWN_OR_INACTIVE_SERVICE"
  | "EXACTLY_ONE_BASE_SERVICE_REQUIRED"
  | "INVALID_STANDALONE_EXPRESS_SERVICE"
  | "INCOMPATIBLE_ADD_ON";

/** A stable domain error for invalid server-side service selections. */
export class ServiceSelectionError extends Error {
  public readonly status = 422;

  public constructor(public readonly code: ServiceSelectionErrorCode) {
    super(serviceSelectionMessages[code]);
    this.name = "ServiceSelectionError";
  }
}

const serviceSelectionMessages: Record<ServiceSelectionErrorCode, string> = {
  NO_SERVICES_SELECTED: "Select a service before continuing.",
  DUPLICATE_SERVICE_SELECTION: "A service may be selected only once.",
  UNKNOWN_OR_INACTIVE_SERVICE: "One or more selected services are unavailable.",
  EXACTLY_ONE_BASE_SERVICE_REQUIRED:
    "Select exactly one base service or one eligible express service.",
  INVALID_STANDALONE_EXPRESS_SERVICE:
    "This add-on cannot be booked as a standalone express service.",
  INCOMPATIBLE_ADD_ON:
    "One or more add-ons are not compatible with the selected base service.",
};

/** A stable domain error for invalid customer-owned pet data. */
export class PetValidationError extends Error {
  public readonly code = "INVALID_PET_INPUT";
  public readonly status = 422;

  public constructor() {
    super("Pet details are invalid.");
    this.name = "PetValidationError";
  }
}

/** A stable error when availability request boundaries are malformed. */
export class AvailabilitySearchValidationError extends Error {
  public readonly code = "INVALID_AVAILABILITY_SEARCH";
  public readonly status = 422;

  public constructor() {
    super("Availability search details are invalid.");
    this.name = "AvailabilitySearchValidationError";
  }
}

/** A stable not-found response that does not reveal another customer's pet. */
export class PetUnavailableError extends Error {
  public readonly code = "PET_NOT_FOUND";
  public readonly status = 404;

  public constructor() {
    super("The selected pet was not found.");
    this.name = "PetUnavailableError";
  }
}

/** Rejects malformed lifecycle input before it reaches the transaction. */
export class AppointmentLifecycleValidationError extends Error {
  public readonly code = "INVALID_APPOINTMENT_INPUT";
  public readonly status = 422;

  public constructor() {
    super("Appointment details are invalid.");
    this.name = "AppointmentLifecycleValidationError";
  }
}

/** An idempotency key cannot be safely used for this mutation. */
export class IdempotencyKeyError extends Error {
  public readonly status = 409;

  public constructor(
    public readonly code:
      | "IDEMPOTENCY_KEY_REUSED"
      | "IDEMPOTENCY_KEY_EXPIRED"
      | "IDEMPOTENCY_RECORD_INCOMPLETE",
  ) {
    super(
      code === "IDEMPOTENCY_KEY_REUSED"
        ? "This idempotency key was already used for a different request."
        : code === "IDEMPOTENCY_KEY_EXPIRED"
          ? "This idempotency key has expired and cannot be retried."
          : "This idempotency request did not complete safely. Retry with a new key.",
    );
    this.name = "IdempotencyKeyError";
  }
}

/** A requested appointment time failed authoritative database availability. */
export class SlotUnavailableError extends Error {
  public readonly code = "SLOT_UNAVAILABLE";
  public readonly status = 409;

  public constructor() {
    super("This appointment time is no longer available.");
    this.name = "SlotUnavailableError";
  }
}

/** The caller cannot observe or change the requested appointment. */
export class AppointmentUnavailableError extends Error {
  public readonly code = "APPOINTMENT_NOT_FOUND";
  public readonly status = 404;

  public constructor() {
    super("The requested appointment was not found.");
    this.name = "AppointmentUnavailableError";
  }
}

/** The customer cancellation/reschedule cutoff has passed. */
export class AppointmentCutoffError extends Error {
  public readonly code = "CANCELLATION_CUTOFF_PASSED";
  public readonly status = 403;

  public constructor() {
    super("This appointment can no longer be changed online.");
    this.name = "AppointmentCutoffError";
  }
}

/** A non-confirmed appointment cannot be changed through its lifecycle. */
export class AppointmentStateError extends Error {
  public readonly code = "APPOINTMENT_NOT_CHANGEABLE";
  public readonly status = 409;

  public constructor() {
    super("This appointment can no longer be changed.");
    this.name = "AppointmentStateError";
  }
}

const appointmentStartSchema = z
  .string()
  .datetime({ offset: true })
  .refine((value) => !Number.isNaN(new Date(value).getTime()));

const createAppointmentSchema = z
  .object({
    petId: z.guid(),
    groomerId: z.guid(),
    selectedServiceIds: z.array(z.guid()).min(1).max(6),
    startsAt: appointmentStartSchema,
    idempotencyKey: z.string().trim().min(1).max(255),
  })
  .strict();

const rescheduleAppointmentSchema = z
  .object({
    appointmentId: z.guid(),
    groomerId: z.guid(),
    selectedServiceIds: z.array(z.guid()).min(1).max(6),
    startsAt: appointmentStartSchema,
    idempotencyKey: z.string().trim().min(1).max(255),
  })
  .strict();

const cancelAppointmentSchema = z
  .object({
    appointmentId: z.guid(),
    idempotencyKey: z.string().trim().min(1).max(255),
  })
  .strict();

const normalizeCreateAppointment = (input: unknown): CreateAppointmentInput => {
  const parsed = createAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    throw new AppointmentLifecycleValidationError();
  }

  return parsed.data;
};

const normalizeRescheduleAppointment = (
  input: unknown,
): RescheduleAppointmentInput => {
  const parsed = rescheduleAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    throw new AppointmentLifecycleValidationError();
  }

  return parsed.data;
};

const normalizeCancelAppointment = (input: unknown): CancelAppointmentInput => {
  const parsed = cancelAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    throw new AppointmentLifecycleValidationError();
  }

  return parsed.data;
};

const availabilitySearchSchema = z
  .object({
    petId: z.guid(),
    selectedServiceIds: z.array(z.guid()).min(1).max(6),
    groomerId: z.guid().nullable(),
    startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict();

const dateAtUtcMidnight = (date: string): Date =>
  new Date(`${date}T00:00:00.000Z`);

const isCalendarDate = (date: string): boolean => {
  const candidate = dateAtUtcMidnight(date);

  return !Number.isNaN(candidate.getTime()) && candidate.toISOString().slice(0, 10) === date;
};

const normalizeAvailabilitySearch = (input: unknown): AvailabilitySearchInput => {
  const parsed = availabilitySearchSchema.safeParse(input);

  if (
    !parsed.success ||
    !isCalendarDate(parsed.data.startsOn) ||
    !isCalendarDate(parsed.data.endsOn) ||
    parsed.data.startsOn > parsed.data.endsOn ||
    dateAtUtcMidnight(parsed.data.endsOn).getTime() -
      dateAtUtcMidnight(parsed.data.startsOn).getTime() >=
      maximumAvailabilitySearchDays * 24 * 60 * 60 * 1_000
  ) {
    throw new AvailabilitySearchValidationError();
  }

  return parsed.data;
};

const nextCalendarDate = (localDate: string): string =>
  new Date(
    dateAtUtcMidnight(localDate).getTime() + 24 * 60 * 60 * 1_000,
  )
    .toISOString()
    .slice(0, 10);

const datesInInclusiveRange = (
  startsOn: string,
  endsOn: string,
): ReadonlyArray<string> => {
  const dates: Array<string> = [];
  let current = startsOn;

  while (current <= endsOn) {
    dates.push(current);
    current = nextCalendarDate(current);
  }

  return dates;
};

const isoDayOfWeek = (localDate: string): number => {
  const day = dateAtUtcMidnight(localDate).getUTCDay();

  return day === 0 ? 7 : day;
};

const localDateTimeToUtc = (localDate: string, localTime: string): Date => {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(localTime);

  if (match === null) {
    throw new Error("Database returned an invalid working-hours time.");
  }

  const [, hours, minutes, seconds = "00"] = match;
  return fromZonedTime(
    `${localDate}T${hours}:${minutes}:${seconds}`,
    businessTimeZone,
  );
};

const addMinutesToInstant = (instant: Date, minutes: number): Date =>
  new Date(instant.getTime() + minutes * 60 * 1_000);

const overlap = (left: TimeInterval, right: TimeInterval): boolean =>
  left.startsAt < right.endsAt && left.endsAt > right.startsAt;

const alignsToSlotBoundary = (instant: Date): boolean =>
  instant.getUTCSeconds() === 0 && instant.getUTCMilliseconds() === 0 && instant.getUTCMinutes() % slotIntervalMinutes === 0;

const firstSlotBoundaryAtOrAfter = (instant: Date): Date => {
  const millisecondsPerSlot = slotIntervalMinutes * 60 * 1_000;
  const rounded = Math.ceil(instant.getTime() / millisecondsPerSlot) * millisecondsPerSlot;

  return new Date(rounded);
};

const optionalPetText = (maximumLength: number) =>
  z
    .string()
    .trim()
    .max(maximumLength)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional();

const petFields = {
  name: z.string().trim().min(1).max(80),
  breed: z.string().trim().min(1).max(100),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]),
  ageYears: z.number().int().min(0).max(30),
  temperament: optionalPetText(500),
  coatCondition: optionalPetText(500),
  allergies: optionalPetText(2_000),
  notes: optionalPetText(2_000),
};

const createPetSchema = z.object(petFields).strict();
const updatePetSchema = z.object(petFields).partial().strict().refine(
  (input) => Object.keys(input).length > 0,
);

const normalizeCreatePet = (input: unknown, ownerId: string): CreatePetRecord => {
  const parsed = createPetSchema.safeParse(input);

  if (!parsed.success) {
    throw new PetValidationError();
  }

  return {
    ownerId,
    name: parsed.data.name,
    breed: parsed.data.breed,
    size: parsed.data.size,
    ageYears: parsed.data.ageYears,
    temperament: parsed.data.temperament ?? null,
    coatCondition: parsed.data.coatCondition ?? null,
    allergies: parsed.data.allergies ?? null,
    notes: parsed.data.notes ?? null,
  };
};

const normalizeUpdatePet = (input: unknown): UpdatePetRecord => {
  const parsed = updatePetSchema.safeParse(input);

  if (!parsed.success) {
    throw new PetValidationError();
  }

  const normalizedInput = parsed.data;

  return {
    ...(normalizedInput.name === undefined ? {} : { name: normalizedInput.name }),
    ...(normalizedInput.breed === undefined
      ? {}
      : { breed: normalizedInput.breed }),
    ...(normalizedInput.size === undefined ? {} : { size: normalizedInput.size }),
    ...(normalizedInput.ageYears === undefined
      ? {}
      : { ageYears: normalizedInput.ageYears }),
    ...(normalizedInput.temperament === undefined
      ? {}
      : { temperament: normalizedInput.temperament }),
    ...(normalizedInput.coatCondition === undefined
      ? {}
      : { coatCondition: normalizedInput.coatCondition }),
    ...(normalizedInput.allergies === undefined
      ? {}
      : { allergies: normalizedInput.allergies }),
    ...(normalizedInput.notes === undefined ? {} : { notes: normalizedInput.notes }),
  };
};

/**
 * Removes time-off periods from working windows. The result is a set of
 * non-overlapping windows that Task 6 can use without treating time off as an
 * optional client-side concern.
 */
export const subtractTimeOff = (
  workingWindows: ReadonlyArray<TimeInterval>,
  timeOff: ReadonlyArray<GroomerTimeOff>,
): ReadonlyArray<TimeInterval> => {
  const sortedTimeOff = [...timeOff].sort(
    (left, right) => left.startsAt.getTime() - right.startsAt.getTime(),
  );

  return workingWindows.flatMap((window) => {
    let remainingStart = window.startsAt;
    const effectiveWindows: Array<TimeInterval> = [];

    for (const timeOffEntry of sortedTimeOff) {
      if (
        timeOffEntry.endsAt <= remainingStart ||
        timeOffEntry.startsAt >= window.endsAt
      ) {
        continue;
      }

      if (timeOffEntry.startsAt > remainingStart) {
        effectiveWindows.push({
          startsAt: remainingStart,
          endsAt:
            timeOffEntry.startsAt < window.endsAt
              ? timeOffEntry.startsAt
              : window.endsAt,
        });
      }

      if (timeOffEntry.endsAt > remainingStart) {
        remainingStart = timeOffEntry.endsAt;
      }

      if (remainingStart >= window.endsAt) {
        break;
      }
    }

    if (remainingStart < window.endsAt) {
      effectiveWindows.push({ startsAt: remainingStart, endsAt: window.endsAt });
    }

    return effectiveWindows;
  });
};

/**
 * Creates the server booking-domain functions shared by future Route Handlers
 * and Server Actions. Actor identity is deliberately injected from verified
 * authentication; none of these operations accepts an owner/customer ID.
 */
export const createBookingUseCases = ({
  repository,
  getCurrentActor,
}: BookingUseCaseDependencies) => {
  const listActiveServices = async (): Promise<ReadonlyArray<Service>> => {
    const services = await repository.listServices();

    return services.filter((service) => service.isActive);
  };

  const resolveServiceSelection = async (
    selectedServiceIds: ReadonlyArray<string>,
  ): Promise<ResolvedServiceSelection> => {
    if (selectedServiceIds.length === 0) {
      throw new ServiceSelectionError("NO_SERVICES_SELECTED");
    }

    const distinctServiceIds = new Set(selectedServiceIds);
    if (distinctServiceIds.size !== selectedServiceIds.length) {
      throw new ServiceSelectionError("DUPLICATE_SERVICE_SELECTION");
    }

    const activeServices = await listActiveServices();
    const servicesById = new Map(
      activeServices.map((service) => [service.id, service]),
    );
    const selectedServices = selectedServiceIds.map((serviceId) =>
      servicesById.get(serviceId),
    );

    if (selectedServices.some((service) => service === undefined)) {
      throw new ServiceSelectionError("UNKNOWN_OR_INACTIVE_SERVICE");
    }

    const validatedServices = selectedServices.filter(
      (service): service is Service => service !== undefined,
    );
    const baseServices = validatedServices.filter(
      (service) => service.kind === "BASE",
    );
    const addOnServices = validatedServices.filter(
      (service) => service.kind === "ADD_ON",
    );

    if (baseServices.length === 0) {
      const standaloneService = addOnServices[0];
      if (
        validatedServices.length === 1 &&
        standaloneService?.isStandaloneEligible === true
      ) {
        return {
          services: validatedServices,
          baseService: null,
          isStandaloneExpress: true,
          totalDurationMinutes: standaloneService.durationMinutes,
          subtotalCents: standaloneService.priceCents,
        };
      }

      if (validatedServices.length === 1) {
        throw new ServiceSelectionError("INVALID_STANDALONE_EXPRESS_SERVICE");
      }

      throw new ServiceSelectionError("EXACTLY_ONE_BASE_SERVICE_REQUIRED");
    }

    if (baseServices.length !== 1) {
      throw new ServiceSelectionError("EXACTLY_ONE_BASE_SERVICE_REQUIRED");
    }

    const baseService = baseServices[0];
    if (baseService === undefined) {
      throw new ServiceSelectionError("EXACTLY_ONE_BASE_SERVICE_REQUIRED");
    }

    const compatiblePairs = await repository.listServiceCompatibility();
    const compatibleAddOnIds = new Set(
      compatiblePairs
        .filter((pair) => pair.baseServiceId === baseService.id)
        .map((pair) => pair.addOnServiceId),
    );

    if (
      addOnServices.some(
        (addOnService) => !compatibleAddOnIds.has(addOnService.id),
      )
    ) {
      throw new ServiceSelectionError("INCOMPATIBLE_ADD_ON");
    }

    return {
      services: validatedServices,
      baseService,
      isStandaloneExpress: false,
      totalDurationMinutes: validatedServices.reduce(
        (total, service) => total + service.durationMinutes,
        0,
      ),
      subtotalCents: validatedServices.reduce(
        (total, service) => total + service.priceCents,
        0,
      ),
    };
  };

  const listActiveGroomers = async (): Promise<ReadonlyArray<Groomer>> => {
    const groomers = await repository.listGroomers();

    return groomers.filter((groomer) => groomer.isActive);
  };

  const listQualifiedGroomers = async (
    selectedServiceIds: ReadonlyArray<string>,
  ): Promise<ReadonlyArray<Groomer>> => {
    const selection = await resolveServiceSelection(selectedServiceIds);
    const selectedServiceIdSet = new Set(
      selection.services.map((service) => service.id),
    );
    const [groomers, qualifications] = await Promise.all([
      repository.listGroomers(),
      repository.listGroomerServiceQualifications(),
    ]);

    const qualificationServiceIdsByGroomer = qualifications.reduce(
      (byGroomer, qualification) => {
        const qualifiedServices =
          byGroomer.get(qualification.groomerId) ?? new Set<string>();
        qualifiedServices.add(qualification.serviceId);
        byGroomer.set(qualification.groomerId, qualifiedServices);
        return byGroomer;
      },
      new Map<string, Set<string>>(),
    );

    return groomers.filter((groomer) => {
      const qualifiedServiceIds = qualificationServiceIdsByGroomer.get(
        groomer.id,
      );

      return (
        groomer.isActive &&
        qualifiedServiceIds !== undefined &&
        [...selectedServiceIdSet].every((serviceId) =>
          qualifiedServiceIds.has(serviceId),
        )
      );
    });
  };

  const searchAvailability = async (
    input: unknown,
  ): Promise<AvailabilitySearchResult> => {
    const search = normalizeAvailabilitySearch(input);
    const actor = await getCurrentActor();
    const pet = await repository.getPetByOwner(search.petId, actor.id);

    if (pet === null || pet.ownerId !== actor.id) {
      throw new PetUnavailableError();
    }

    const selection = await resolveServiceSelection(search.selectedServiceIds);
    const candidateGroomers =
      search.groomerId === null
        ? await listQualifiedGroomers(search.selectedServiceIds)
        : (await listQualifiedGroomers(search.selectedServiceIds)).filter(
            (groomer) => groomer.id === search.groomerId,
          );

    const totalBlockedMinutes =
      selection.totalDurationMinutes + cleanupBufferMinutes;
    const dates = datesInInclusiveRange(search.startsOn, search.endsOn);
    const slots: Array<AvailabilitySlot> = [];

    for (const groomer of candidateGroomers) {
      const [workingHours, timeOff] = await Promise.all([
        repository.listGroomerWorkingHours(groomer.id),
        repository.listGroomerTimeOff(groomer.id),
      ]);
      const searchRange: TimeInterval = {
        startsAt: localDateTimeToUtc(search.startsOn, "00:00"),
        endsAt: localDateTimeToUtc(nextCalendarDate(search.endsOn), "00:00"),
      };
      const confirmedBlocks = await repository.listConfirmedAppointmentBlocks(
        groomer.id,
        searchRange,
      );

      for (const localDate of dates) {
        const dayWorkingHours = workingHours.filter(
          (hours) => hours.isoDayOfWeek === isoDayOfWeek(localDate),
        );

        for (const hours of dayWorkingHours) {
          const window: TimeInterval = {
            startsAt: localDateTimeToUtc(localDate, hours.startsAt),
            endsAt: localDateTimeToUtc(localDate, hours.endsAt),
          };

          for (
            let startsAt = firstSlotBoundaryAtOrAfter(window.startsAt);
            startsAt < window.endsAt;
            startsAt = addMinutesToInstant(startsAt, slotIntervalMinutes)
          ) {
            if (!alignsToSlotBoundary(startsAt)) {
              continue;
            }

            const serviceEndsAt = addMinutesToInstant(
              startsAt,
              selection.totalDurationMinutes,
            );
            const blockedUntil = addMinutesToInstant(
              startsAt,
              totalBlockedMinutes,
            );
            const slot: TimeInterval = { startsAt, endsAt: blockedUntil };

            if (
              blockedUntil > window.endsAt ||
              timeOff.some((entry) =>
                overlap(slot, {
                  startsAt: entry.startsAt,
                  endsAt: entry.endsAt,
                }),
              ) ||
              confirmedBlocks.some((block) =>
                overlap(slot, {
                  startsAt: block.startsAt,
                  endsAt: block.blockedUntil,
                }),
              )
            ) {
              continue;
            }

            slots.push({
              groomerId: groomer.id,
              startsAt,
              serviceEndsAt,
              blockedUntil,
            });
          }
        }
      }
    }

    return {
      timeZone: businessTimeZone,
      totalDurationMinutes: selection.totalDurationMinutes,
      subtotalCents: selection.subtotalCents,
      slots: slots.sort(
        (left, right) =>
          left.startsAt.getTime() - right.startsAt.getTime() ||
          left.groomerId.localeCompare(right.groomerId),
      ),
    };
  };

  /**
   * Delegates a create to the single authoritative database transaction. The
   * current server actor validates the request session here; the RPC derives
   * the same actor from `auth.uid()` rather than accepting a customer ID.
   */
  const createAppointment = async (input: unknown): Promise<Appointment> => {
    const normalizedInput = normalizeCreateAppointment(input);
    await getCurrentActor();

    return repository.createConfirmedAppointment(normalizedInput);
  };

  /** Revalidates a reschedule through the same database transaction boundary. */
  const rescheduleAppointment = async (
    input: unknown,
  ): Promise<Appointment> => {
    const normalizedInput = normalizeRescheduleAppointment(input);
    await getCurrentActor();

    return repository.rescheduleConfirmedAppointment(normalizedInput);
  };

  /** Cancels only through the database policy that enforces ownership/cutoff. */
  const cancelAppointment = async (input: unknown): Promise<Appointment> => {
    const normalizedInput = normalizeCancelAppointment(input);
    await getCurrentActor();

    return repository.cancelConfirmedAppointment(normalizedInput);
  };

  const getGroomerSchedule = async (
    groomerId: string,
  ): Promise<GroomerSchedule | null> => {
    const groomers = await repository.listGroomers();
    const groomer = groomers.find(
      (candidate) => candidate.id === groomerId && candidate.isActive,
    );

    if (groomer === undefined) {
      return null;
    }

    const [workingHours, timeOff] = await Promise.all([
      repository.listGroomerWorkingHours(groomer.id),
      repository.listGroomerTimeOff(groomer.id),
    ]);

    return { groomer, workingHours, timeOff };
  };

  /** Lists appointments scoped to the verified current customer. */
  const listMyAppointments = async (): Promise<ReadonlyArray<Appointment>> => {
    const actor = await getCurrentActor();
    const appointments = await repository.listAppointmentsByCustomer(actor.id);

    return appointments.filter((appointment) => appointment.customerId === actor.id);
  };

  const listMyPets = async (): Promise<ReadonlyArray<Pet>> => {
    const actor = await getCurrentActor();
    const pets = await repository.listPetsByOwner(actor.id);

    return pets.filter((pet) => pet.ownerId === actor.id);
  };

  const getMyPet = async (petId: string): Promise<Pet | null> => {
    const actor = await getCurrentActor();
    const pet = await repository.getPetByOwner(petId, actor.id);

    return pet?.ownerId === actor.id ? pet : null;
  };

  const createMyPet = async (input: unknown): Promise<Pet> => {
    const actor = await getCurrentActor();
    const pet = await repository.createPet(normalizeCreatePet(input, actor.id));

    if (pet.ownerId !== actor.id) {
      throw new Error("Pet persistence returned an unexpected owner.");
    }

    return pet;
  };

  const updateMyPet = async (
    petId: string,
    input: unknown,
  ): Promise<Pet | null> => {
    const actor = await getCurrentActor();
    const pet = await repository.updatePetByOwner(
      petId,
      actor.id,
      normalizeUpdatePet(input),
    );

    return pet?.ownerId === actor.id ? pet : null;
  };

  const deleteMyPet = async (petId: string): Promise<boolean> => {
    const actor = await getCurrentActor();

    return repository.deletePetByOwner(petId, actor.id);
  };

  return {
    listActiveServices,
    resolveServiceSelection,
    listActiveGroomers,
    listQualifiedGroomers,
    searchAvailability,
    createAppointment,
    rescheduleAppointment,
    cancelAppointment,
    getGroomerSchedule,
    listMyAppointments,
    listMyPets,
    getMyPet,
    createMyPet,
    updateMyPet,
    deleteMyPet,
  };
};
