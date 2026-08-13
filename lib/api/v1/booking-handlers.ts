import "server-only";

import { z } from "zod";

import type { AuthenticatedActor } from "../../auth/guards";
import type {
  Appointment,
  AvailabilitySearchResult,
  Groomer,
  Pet,
  Service,
} from "../../booking/use-cases";

const identifierSchema = z.guid();
const idempotencyKeySchema = z.string().trim().min(1).max(255);
const appointmentStartSchema = z
  .string()
  .datetime({ offset: true })
  .refine((value) => !Number.isNaN(new Date(value).getTime()));

const petFieldSchema = {
  name: z.string().trim().min(1).max(80),
  breed: z.string().trim().min(1).max(100),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]),
  ageYears: z.number().int().min(0).max(30),
  temperament: z.string().trim().max(500).nullable().optional(),
  coatCondition: z.string().trim().max(500).nullable().optional(),
  allergies: z.string().trim().max(2_000).nullable().optional(),
  notes: z.string().trim().max(2_000).nullable().optional(),
};

const createPetSchema = z.object(petFieldSchema).strict();
const updatePetSchema = z
  .object(petFieldSchema)
  .partial()
  .strict()
  .refine((input) => Object.keys(input).length > 0);
const availabilitySearchSchema = z
  .object({
    petId: identifierSchema,
    selectedServiceIds: z.array(identifierSchema).min(1).max(6),
    groomerId: identifierSchema.nullable(),
    startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict();
const createAppointmentSchema = z
  .object({
    petId: identifierSchema,
    groomerId: identifierSchema,
    selectedServiceIds: z.array(identifierSchema).min(1).max(6),
    startsAt: appointmentStartSchema,
  })
  .strict();
const rescheduleAppointmentSchema = z
  .object({
    groomerId: identifierSchema,
    selectedServiceIds: z.array(identifierSchema).min(1).max(6),
    startsAt: appointmentStartSchema,
  })
  .strict();

/** A stable field-level validation detail exposed by every `/api/v1` route. */
export interface ApiValidationDetail {
  readonly code: string;
  readonly message: string;
  readonly path: string;
}

/** Shared error response shape for every `/api/v1` Route Handler. */
export interface ApiErrorResponse {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details: ReadonlyArray<ApiValidationDetail>;
  };
}

/** Narrow API-facing use cases needed by the Task 9 Route Handlers. */
export interface BookingApiUseCases {
  /** Explicit per-request API auth gate; all endpoints use it before domain work. */
  readonly requireAuthenticatedActor: () => Promise<AuthenticatedActor>;
  readonly listActiveServices: () => Promise<ReadonlyArray<Service>>;
  readonly listActiveGroomers: () => Promise<ReadonlyArray<Groomer>>;
  readonly listMyPets: () => Promise<ReadonlyArray<Pet>>;
  readonly createMyPet: (input: unknown) => Promise<Pet>;
  readonly updateMyPet: (petId: string, input: unknown) => Promise<Pet | null>;
  readonly deleteMyPet: (petId: string) => Promise<boolean>;
  readonly searchAvailability: (input: unknown) => Promise<AvailabilitySearchResult>;
  readonly listMyAppointments: () => Promise<ReadonlyArray<Appointment>>;
  readonly createAppointment: (input: unknown) => Promise<Appointment>;
  readonly rescheduleAppointment: (input: unknown) => Promise<Appointment>;
  readonly cancelAppointment: (input: unknown) => Promise<Appointment>;
}

/** Typed dynamic route parameters accepted by the Route Handler adapter. */
export interface ResourceRouteParameters {
  readonly petId?: string;
  readonly appointmentId?: string;
}

class RequestValidationError extends Error {
  public readonly code = "VALIDATION_ERROR";
  public readonly status = 422;

  public constructor(public readonly details: ReadonlyArray<ApiValidationDetail>) {
    super("Request validation failed.");
    this.name = "RequestValidationError";
  }
}

class ApiNotFoundError extends Error {
  public readonly code = "PET_NOT_FOUND";
  public readonly status = 404;

  public constructor() {
    super("The selected pet was not found.");
    this.name = "ApiNotFoundError";
  }
}

const validationDetails = (error: z.ZodError): ReadonlyArray<ApiValidationDetail> =>
  error.issues.map((issue) => ({
    code: issue.code,
    message: issue.message,
    path: issue.path.length === 0 ? "body" : issue.path.join("."),
  }));

const parseValue = <T>(schema: z.ZodType<T>, value: unknown): T => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new RequestValidationError(validationDetails(parsed.error));
  }

  return parsed.data;
};

const parseRequestBody = async <T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new RequestValidationError([
      { code: "invalid_json", message: "Request body must be valid JSON.", path: "body" },
    ]);
  }

  return parseValue(schema, body);
};

const parseHeader = (request: Request, headerName: string): string => {
  const parsed = idempotencyKeySchema.safeParse(request.headers.get(headerName));
  if (!parsed.success) {
    throw new RequestValidationError([
      {
        code: "invalid_header",
        message: `${headerName} must be a nonblank value no longer than 255 characters.`,
        path: headerName,
      },
    ]);
  }

  return parsed.data;
};

const parseRouteParameter = (
  parameters: ResourceRouteParameters,
  key: "petId" | "appointmentId",
): string =>
  parseValue(identifierSchema, parameters[key]);

const toServiceResponse = (service: Service) => ({
  id: service.id,
  name: service.name,
  description: service.description,
  kind: service.kind,
  isStandaloneEligible: service.isStandaloneEligible,
  durationMinutes: service.durationMinutes,
  priceCents: service.priceCents,
});

const toGroomerResponse = (groomer: Groomer) => ({
  id: groomer.id,
  displayName: groomer.displayName,
  bio: groomer.bio,
});

const toPetResponse = (pet: Pet) => ({
  id: pet.id,
  name: pet.name,
  breed: pet.breed,
  size: pet.size,
  ageYears: pet.ageYears,
  temperament: pet.temperament,
  coatCondition: pet.coatCondition,
  allergies: pet.allergies,
  notes: pet.notes,
});

const toAvailabilityResponse = (result: AvailabilitySearchResult) => ({
  timeZone: result.timeZone,
  totalDurationMinutes: result.totalDurationMinutes,
  subtotalCents: result.subtotalCents,
  slots: result.slots.map((slot) => ({
    groomerId: slot.groomerId,
    startsAt: slot.startsAt.toISOString(),
    serviceEndsAt: slot.serviceEndsAt.toISOString(),
    blockedUntil: slot.blockedUntil.toISOString(),
  })),
});

const toAppointmentResponse = (appointment: Appointment) => ({
  id: appointment.id,
  petId: appointment.petId,
  groomerId: appointment.groomerId,
  status: appointment.status,
  startsAt: appointment.startsAt.toISOString(),
  serviceEndsAt: appointment.serviceEndsAt.toISOString(),
  blockedUntil: appointment.blockedUntil.toISOString(),
  subtotalCents: appointment.subtotalCents,
  appliedBufferMinutes: appointment.appliedBufferMinutes,
  cancelledAt: appointment.cancelledAt?.toISOString() ?? null,
});

const errorResponse = (
  status: number,
  code: string,
  message: string,
  details: ReadonlyArray<ApiValidationDetail> = [],
): Response =>
  Response.json(
    { error: { code, message, details } } satisfies ApiErrorResponse,
    { status },
  );

const publicErrorCodes = new Set([
  "AUTHENTICATION_REQUIRED",
  "ADMIN_REQUIRED",
  "NO_SERVICES_SELECTED",
  "DUPLICATE_SERVICE_SELECTION",
  "UNKNOWN_OR_INACTIVE_SERVICE",
  "EXACTLY_ONE_BASE_SERVICE_REQUIRED",
  "INVALID_STANDALONE_EXPRESS_SERVICE",
  "INCOMPATIBLE_ADD_ON",
  "INVALID_PET_INPUT",
  "INVALID_AVAILABILITY_SEARCH",
  "PET_NOT_FOUND",
  "INVALID_APPOINTMENT_INPUT",
  "IDEMPOTENCY_KEY_REUSED",
  "IDEMPOTENCY_KEY_EXPIRED",
  "IDEMPOTENCY_RECORD_INCOMPLETE",
  "SLOT_UNAVAILABLE",
  "APPOINTMENT_NOT_FOUND",
  "CANCELLATION_CUTOFF_PASSED",
  "APPOINTMENT_NOT_CHANGEABLE",
]);

const isPublicDomainError = (
  error: unknown,
): error is Error & { readonly code: string; readonly status: number } => {
  if (!(error instanceof Error)) {
    return false;
  }

  const candidate = error as unknown as {
    readonly code?: unknown;
    readonly status?: unknown;
  };
  return (
    typeof candidate.code === "string" &&
    publicErrorCodes.has(candidate.code) &&
    typeof candidate.status === "number" &&
    candidate.status >= 400 &&
    candidate.status < 500
  );
};

const toErrorResponse = (error: unknown): Response => {
  if (error instanceof RequestValidationError) {
    return errorResponse(error.status, error.code, error.message, error.details);
  }
  if (isPublicDomainError(error)) {
    return errorResponse(error.status, error.code, error.message);
  }

  return errorResponse(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred.");
};

const run = async <T>(
  requireAuthenticatedActor: () => Promise<unknown>,
  operation: () => Promise<T>,
  response: (value: T) => unknown,
  status = 200,
): Promise<Response> => {
  try {
    await requireAuthenticatedActor();
    return Response.json({ data: response(await operation()) }, { status });
  } catch (error) {
    return toErrorResponse(error);
  }
};

/**
 * Adapts shared, authenticated booking use cases to stable HTTP responses.
 * Route files obtain production use cases per request; this factory keeps the
 * HTTP boundary deterministic and independently testable.
 */
export const createBookingApiHandlers = (useCases: BookingApiUseCases) => {
  const runAuthenticated = <T>(
    operation: () => Promise<T>,
    response: (value: T) => unknown,
    status = 200,
  ): Promise<Response> =>
    run(useCases.requireAuthenticatedActor, operation, response, status);

  return {
    listServices: async (request: Request): Promise<Response> => {
      void request;
      return runAuthenticated(useCases.listActiveServices, (services) => ({
        services: services.map(toServiceResponse),
      }));
    },
    listGroomers: async (request: Request): Promise<Response> => {
      void request;
      return runAuthenticated(useCases.listActiveGroomers, (groomers) => ({
        groomers: groomers.map(toGroomerResponse),
      }));
    },
    listPets: async (request: Request): Promise<Response> => {
      void request;
      return runAuthenticated(useCases.listMyPets, (pets) => ({
        pets: pets.map(toPetResponse),
      }));
    },
    createPet: async (request: Request): Promise<Response> =>
      runAuthenticated(
        async () => useCases.createMyPet(await parseRequestBody(request, createPetSchema)),
        toPetResponse,
        201,
      ),
    updatePet: async (
      request: Request,
      parameters: ResourceRouteParameters,
    ): Promise<Response> =>
      runAuthenticated(
        async () => {
          const petId = parseRouteParameter(parameters, "petId");
          const pet = await useCases.updateMyPet(
            petId,
            await parseRequestBody(request, updatePetSchema),
          );
          if (pet === null) {
            throw new ApiNotFoundError();
          }
          return pet;
        },
        toPetResponse,
      ),
    deletePet: async (
      request: Request,
      parameters: ResourceRouteParameters,
    ): Promise<Response> => {
      void request;
      return runAuthenticated(
        async () => {
          const deleted = await useCases.deleteMyPet(
            parseRouteParameter(parameters, "petId"),
          );
          if (!deleted) {
            throw new ApiNotFoundError();
          }
          return { deleted };
        },
        (result) => result,
      );
    },
    searchAvailability: async (request: Request): Promise<Response> =>
      runAuthenticated(
        async () =>
          useCases.searchAvailability(
            await parseRequestBody(request, availabilitySearchSchema),
          ),
        toAvailabilityResponse,
      ),
    listAppointments: async (request: Request): Promise<Response> => {
      void request;
      return runAuthenticated(useCases.listMyAppointments, (appointments) => ({
        appointments: appointments.map(toAppointmentResponse),
      }));
    },
    createAppointment: async (request: Request): Promise<Response> =>
      runAuthenticated(
        async () =>
          useCases.createAppointment({
            ...(await parseRequestBody(request, createAppointmentSchema)),
            idempotencyKey: parseHeader(request, "Idempotency-Key"),
          }),
        toAppointmentResponse,
        201,
      ),
    rescheduleAppointment: async (
      request: Request,
      parameters: ResourceRouteParameters,
    ): Promise<Response> =>
      runAuthenticated(
        async () =>
          useCases.rescheduleAppointment({
            appointmentId: parseRouteParameter(parameters, "appointmentId"),
            ...(await parseRequestBody(request, rescheduleAppointmentSchema)),
            idempotencyKey: parseHeader(request, "Idempotency-Key"),
          }),
        toAppointmentResponse,
      ),
    cancelAppointment: async (
      request: Request,
      parameters: ResourceRouteParameters,
    ): Promise<Response> =>
      runAuthenticated(
        async () =>
          useCases.cancelAppointment({
            appointmentId: parseRouteParameter(parameters, "appointmentId"),
            idempotencyKey: parseHeader(request, "Idempotency-Key"),
          }),
        toAppointmentResponse,
      ),
  };
};
