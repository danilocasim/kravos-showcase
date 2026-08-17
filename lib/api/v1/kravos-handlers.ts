import "server-only";

import { formatInTimeZone } from "date-fns-tz";
import { z } from "zod";

import type { KravosBookingPrincipal } from "../../auth/kravos-tool-auth";
import { businessTimeZone } from "../../booking/business-time";
import type { createKravosBookingUseCases } from "../../booking/kravos-use-cases";
import type { Appointment, Pet } from "../../booking/use-cases";

const identifierSchema = z.guid();
const customerTargetSchema = { customerId: identifierSchema.optional() };
const idempotencyKeySchema = z.string().trim().min(1).max(255);
const appointmentStartSchema = z.string().datetime({ offset: true });
const serviceIdsSchema = z.array(identifierSchema).min(1).max(6);
const emptyRequestSchema = z.object({}).strict();

const resolveCustomerSchema = z
  .object({
    customerName: z.string().trim().min(1).max(100),
    petName: z.string().trim().min(1).max(80).optional(),
  })
  .strict();
const customerContextSchema = z.object(customerTargetSchema).strict();
const availabilitySchema = z
  .object({
    ...customerTargetSchema,
    petId: identifierSchema,
    selectedServiceIds: serviceIdsSchema,
    groomerId: identifierSchema.nullable().optional(),
    startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  .strict();
const createAppointmentSchema = z
  .object({
    ...customerTargetSchema,
    petId: identifierSchema,
    groomerId: identifierSchema,
    selectedServiceIds: serviceIdsSchema,
    startsAt: appointmentStartSchema,
    idempotencyKey: idempotencyKeySchema,
  })
  .strict();
const rescheduleAppointmentSchema = z
  .object({
    ...customerTargetSchema,
    appointmentId: identifierSchema,
    groomerId: identifierSchema,
    selectedServiceIds: serviceIdsSchema,
    startsAt: appointmentStartSchema,
    idempotencyKey: idempotencyKeySchema,
  })
  .strict();
const cancelAppointmentSchema = z
  .object({
    ...customerTargetSchema,
    appointmentId: identifierSchema,
    idempotencyKey: idempotencyKeySchema,
  })
  .strict();
const bookingOptionsSchema = z
  .object({
    customerName: z.string().trim().min(1).max(100),
    petName: z.string().trim().min(1).max(80),
    serviceName: z.string().trim().min(1).max(100),
    groomerName: z.string().trim().min(1).max(100).optional(),
    startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  .strict();
const confirmBookingSchema = z
  .object({
    customerName: z.string().trim().min(1).max(100),
    petName: z.string().trim().min(1).max(80),
    serviceName: z.string().trim().min(1).max(100),
    groomerName: z.string().trim().min(1).max(100),
    startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
    idempotencyKey: idempotencyKeySchema,
  })
  .strict();
const rescheduleBookingSchema = z
  .object({
    customerName: z.string().trim().min(1).max(100),
    petName: z.string().trim().min(1).max(80),
    currentStartsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    currentStartTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
    groomerName: z.string().trim().min(1).max(100),
    startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
    idempotencyKey: idempotencyKeySchema,
  })
  .strict();

interface ValidationDetail {
  readonly code: string;
  readonly message: string;
  readonly path: string;
}

class RequestValidationError extends Error {
  public readonly code = "VALIDATION_ERROR";
  public readonly status = 422;

  public constructor(public readonly details: ReadonlyArray<ValidationDetail>) {
    super("Request validation failed.");
    this.name = "RequestValidationError";
  }
}

export type KravosBookingApiUseCases = ReturnType<
  typeof createKravosBookingUseCases
>;

export interface KravosBookingApiDependencies {
  readonly useCases: KravosBookingApiUseCases;
  readonly resolvePrincipal: (request: Request) => Promise<KravosBookingPrincipal>;
}

const validationDetails = (error: z.ZodError): ReadonlyArray<ValidationDetail> =>
  error.issues.map((issue) => ({
    code: issue.code,
    message: issue.message,
    path: issue.path.length === 0 ? "body" : issue.path.join("."),
  }));

const parseBody = async <T>(request: Request, schema: z.ZodType<T>): Promise<T> => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new RequestValidationError([
      { code: "invalid_json", message: "Request body must be valid JSON.", path: "body" },
    ]);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new RequestValidationError(validationDetails(parsed.error));

  return parsed.data;
};

const effectiveCustomerId = (
  principal: KravosBookingPrincipal,
  requestedCustomerId: string | undefined,
): string => {
  if (principal.kind === "CUSTOMER_SESSION") return principal.actor.id;
  if (requestedCustomerId !== undefined) return requestedCustomerId;

  throw new RequestValidationError([
    {
      code: "invalid_type",
      message: "customerId is required for a Kravos tool request.",
      path: "customerId",
    },
  ]);
};

const toPet = (pet: Pet) => ({
  petId: pet.id,
  name: pet.name,
  breed: pet.breed,
  size: pet.size,
  ageYears: pet.ageYears,
  temperament: pet.temperament,
  coatCondition: pet.coatCondition,
  allergies: pet.allergies,
  notes: pet.notes,
});

const toEasternInstant = (instant: Date | string): string =>
  formatInTimeZone(instant, businessTimeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");

const toAppointment = (appointment: Appointment) => ({
  id: appointment.id,
  customerId: appointment.customerId,
  petId: appointment.petId,
  groomerId: appointment.groomerId,
  status: appointment.status,
  startsAt: appointment.startsAt.toISOString(),
  serviceEndsAt: appointment.serviceEndsAt.toISOString(),
  blockedUntil: appointment.blockedUntil.toISOString(),
  subtotalCents: appointment.subtotalCents,
  appliedBufferMinutes: appointment.appliedBufferMinutes,
  cancelledAt: appointment.cancelledAt?.toISOString() ?? null,
  timeZone: businessTimeZone,
  startsAtEastern: toEasternInstant(appointment.startsAt),
  serviceEndsAtEastern: toEasternInstant(appointment.serviceEndsAt),
  blockedUntilEastern: toEasternInstant(appointment.blockedUntil),
});

const publicErrorCodes = new Set([
  "AUTHENTICATION_REQUIRED",
  "BOOKING_SELECTION_NOT_FOUND",
  "CUSTOMER_NOT_FOUND",
  "NO_SERVICES_SELECTED",
  "DUPLICATE_SERVICE_SELECTION",
  "UNKNOWN_OR_INACTIVE_SERVICE",
  "EXACTLY_ONE_BASE_SERVICE_REQUIRED",
  "INVALID_STANDALONE_EXPRESS_SERVICE",
  "INCOMPATIBLE_ADD_ON",
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

const publicDomainError = (
  error: unknown,
): error is Error & { readonly code: string; readonly status: number } => {
  if (!(error instanceof Error)) return false;
  const candidate = error as Error & { readonly code?: unknown; readonly status?: unknown };

  return (
    typeof candidate.code === "string" &&
    publicErrorCodes.has(candidate.code) &&
    typeof candidate.status === "number" &&
    candidate.status >= 400 &&
    candidate.status < 500
  );
};

const errorResponse = (
  status: number,
  code: string,
  message: string,
  details: ReadonlyArray<ValidationDetail> = [],
): Response => Response.json({ error: { code, message, details } }, { status });

const toErrorResponse = (error: unknown): Response => {
  if (error instanceof RequestValidationError) {
    return errorResponse(error.status, error.code, error.message, error.details);
  }
  if (publicDomainError(error)) {
    return errorResponse(error.status, error.code, error.message);
  }

  return errorResponse(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred.");
};

const run = async <T>(
  request: Request,
  dependencies: KravosBookingApiDependencies,
  operation: (principal: KravosBookingPrincipal) => Promise<T>,
  response: (value: T) => unknown,
  status = 200,
): Promise<Response> => {
  try {
    const principal = await dependencies.resolvePrincipal(request);
    return Response.json({ data: response(await operation(principal)) }, { status });
  } catch (error) {
    return toErrorResponse(error);
  }
};

/** Adapts the privileged customer-delegated booking service to Kravos HTTP tools. */
export const createKravosBookingApiHandlers = (
  dependencies: KravosBookingApiDependencies,
) => ({
  catalog: async (request: Request): Promise<Response> =>
    run(
      request,
      dependencies,
      async () => {
        await parseBody(request, emptyRequestSchema);
        return dependencies.useCases.getCatalog();
      },
      (catalog) => ({
        services: catalog.services.map((service) => ({
          serviceId: service.id,
          name: service.name,
          description: service.description,
          kind: service.kind,
          isStandaloneEligible: service.isStandaloneEligible,
          durationMinutes: service.durationMinutes,
          priceCents: service.priceCents,
        })),
        groomers: catalog.groomers.map((groomer) => ({
          groomerId: groomer.id,
          displayName: groomer.displayName,
          bio: groomer.bio,
        })),
      }),
    ),
  resolveCustomer: async (request: Request): Promise<Response> =>
    run(
      request,
      dependencies,
      async () => {
        const input = await parseBody(request, resolveCustomerSchema);
        return dependencies.useCases.resolveCustomer({
          customerName: input.customerName,
          ...(input.petName === undefined ? {} : { petName: input.petName }),
        });
      },
      (result) =>
        result.status === "RESOLVED"
          ? {
              status: result.status,
              customer: {
                customerId: result.customer.id,
                displayName: result.customer.displayName,
              },
              pets: result.pets.map(toPet),
            }
          : {
              status: result.status,
              matches: result.matches.map((match) => ({
                customer: {
                  customerId: match.customer.id,
                  displayName: match.customer.displayName,
                },
                pets: match.pets.map(toPet),
              })),
            },
    ),
  customerContext: async (request: Request): Promise<Response> =>
    run(
      request,
      dependencies,
      async (principal) => {
        const input = await parseBody(request, customerContextSchema);
        return dependencies.useCases.getCustomerContext(
          effectiveCustomerId(principal, input.customerId),
        );
      },
      (context) => ({
        timeZone: context.timeZone,
        customer: {
          customerId: context.customer.id,
          displayName: context.customer.displayName,
        },
        pets: context.pets.map(toPet),
        appointmentCount: context.appointmentCount,
        appointmentsTruncated: context.appointmentsTruncated,
        appointments: context.appointments.map((appointment) => ({
          ...toAppointment(appointment),
          petName: appointment.petName,
          groomerName: appointment.groomerName,
          services: appointment.services.map((service) => ({
            serviceId: service.serviceId,
            serviceName: service.serviceName,
            serviceKind: service.serviceKind,
            durationMinutes: service.durationMinutes,
            priceCents: service.priceCents,
          })),
          canChange: appointment.canChange,
          changeCutoffAt: appointment.changeCutoffAt,
          changeCutoffAtEastern: toEasternInstant(appointment.changeCutoffAt),
        })),
      }),
    ),
  searchAvailability: async (request: Request): Promise<Response> =>
    run(
      request,
      dependencies,
      async (principal) => {
        const input = await parseBody(request, availabilitySchema);
        return dependencies.useCases.searchAvailability({
          customerId: effectiveCustomerId(principal, input.customerId),
          petId: input.petId,
          selectedServiceIds: input.selectedServiceIds,
          groomerId: input.groomerId ?? null,
          startsOn: input.startsOn,
          endsOn: input.endsOn ?? input.startsOn,
        });
      },
      (availability) => ({
        timeZone: availability.timeZone,
        totalDurationMinutes: availability.totalDurationMinutes,
        subtotalCents: availability.subtotalCents,
        slotCount: availability.slotCount,
        slotsTruncated: availability.slotsTruncated,
        slots: availability.slots.map((slot) => ({
          groomerId: slot.groomerId,
          groomerName: slot.groomerName,
          startsAt: slot.startsAt.toISOString(),
          serviceEndsAt: slot.serviceEndsAt.toISOString(),
          blockedUntil: slot.blockedUntil.toISOString(),
          startsAtEastern: toEasternInstant(slot.startsAt),
          serviceEndsAtEastern: toEasternInstant(slot.serviceEndsAt),
          blockedUntilEastern: toEasternInstant(slot.blockedUntil),
        })),
      }),
    ),
  bookingOptions: async (request: Request): Promise<Response> =>
    run(
      request,
      dependencies,
      async () => {
        const input = await parseBody(request, bookingOptionsSchema);
        return dependencies.useCases.searchBookingOptions({
          customerName: input.customerName,
          petName: input.petName,
          serviceNames: [input.serviceName],
          ...(input.groomerName === undefined
            ? {}
            : { groomerName: input.groomerName }),
          ...(input.startsOn === undefined ? {} : { startsOn: input.startsOn }),
          ...(input.endsOn === undefined ? {} : { endsOn: input.endsOn }),
        });
      },
      (availability) => ({
        timeZone: availability.timeZone,
        totalDurationMinutes: availability.totalDurationMinutes,
        subtotalCents: availability.subtotalCents,
        slotCount: availability.slotCount,
        slotsTruncated: availability.slotsTruncated,
        selection: availability.selection,
        slots: availability.slots.map((slot) => ({
          groomerName: slot.groomerName,
          startsAtEastern: toEasternInstant(slot.startsAt),
          serviceEndsAtEastern: toEasternInstant(slot.serviceEndsAt),
          blockedUntilEastern: toEasternInstant(slot.blockedUntil),
        })),
      }),
    ),
  confirmBooking: async (request: Request): Promise<Response> =>
    run(
      request,
      dependencies,
      async () => {
        const input = await parseBody(request, confirmBookingSchema);
        return dependencies.useCases.confirmBooking({
          customerName: input.customerName,
          petName: input.petName,
          serviceNames: [input.serviceName],
          groomerName: input.groomerName,
          startsOn: input.startsOn,
          startTime: input.startTime,
          idempotencyKey: input.idempotencyKey,
        });
      },
      toAppointment,
      201,
    ),
  rescheduleBooking: async (request: Request): Promise<Response> =>
    run(
      request,
      dependencies,
      async () => {
        const input = await parseBody(request, rescheduleBookingSchema);
        return dependencies.useCases.rescheduleBooking(input);
      },
      toAppointment,
    ),
  createAppointment: async (request: Request): Promise<Response> =>
    run(
      request,
      dependencies,
      async (principal) => {
        const input = await parseBody(request, createAppointmentSchema);
        return dependencies.useCases.createAppointment({
          ...input,
          customerId: effectiveCustomerId(principal, input.customerId),
        });
      },
      toAppointment,
      201,
    ),
  rescheduleAppointment: async (request: Request): Promise<Response> =>
    run(
      request,
      dependencies,
      async (principal) => {
        const input = await parseBody(request, rescheduleAppointmentSchema);
        return dependencies.useCases.rescheduleAppointment({
          ...input,
          customerId: effectiveCustomerId(principal, input.customerId),
        });
      },
      toAppointment,
    ),
  cancelAppointment: async (request: Request): Promise<Response> =>
    run(
      request,
      dependencies,
      async (principal) => {
        const input = await parseBody(request, cancelAppointmentSchema);
        return dependencies.useCases.cancelAppointment({
          ...input,
          customerId: effectiveCustomerId(principal, input.customerId),
        });
      },
      toAppointment,
    ),
});
