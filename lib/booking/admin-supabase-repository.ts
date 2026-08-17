import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { AuthenticationRequiredError, AuthorizationRequiredError } from "../auth/guards";
import {
  AppointmentLifecycleValidationError,
  AppointmentStateError,
  AppointmentUnavailableError,
  IdempotencyKeyError,
  type AppointmentServiceSnapshot,
} from "./use-cases";
import type {
  AdminAppointmentRecord,
  AdminBookingRepository,
  AdminLifecycleMutationResult,
  AdminStatusMutationResult,
} from "./admin-use-cases";

const appointmentRowSchema = z.object({
  id: z.guid(),
  customer_id: z.guid(),
  pet_id: z.guid(),
  groomer_id: z.guid(),
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]),
  starts_at: z.string().datetime({ offset: true }),
  service_ends_at: z.string().datetime({ offset: true }),
  blocked_until: z.string().datetime({ offset: true }),
  subtotal_cents: z.number().int(),
  cancelled_at: z.string().datetime({ offset: true }).nullable(),
  completed_at: z.string().datetime({ offset: true }).nullable(),
  status_changed_at: z.string().datetime({ offset: true }),
  status_changed_by: z.guid().nullable(),
});
const profileRowSchema = z.object({ id: z.guid(), display_name: z.string().min(1) });
const petRowSchema = z.object({
  id: z.guid(),
  name: z.string(),
  breed: z.string(),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]),
});
const groomerRowSchema = z.object({ id: z.guid(), display_name: z.string() });
const serviceRowSchema = z.object({
  appointment_id: z.guid(),
  service_id: z.guid(),
  service_name: z.string(),
  service_kind: z.enum(["BASE", "ADD_ON"]),
  duration_minutes: z.number().int(),
  price_cents: z.number().int(),
});
const cancellationRowSchema = z.object({
  id: z.guid(),
  status: z.literal("CANCELLED"),
});
const completionRowSchema = z.object({
  id: z.guid(),
  status: z.literal("COMPLETED"),
  completed_at: z.string().datetime({ offset: true }),
  status_changed_at: z.string().datetime({ offset: true }),
  status_changed_by: z.guid(),
});

const databaseError = (error: unknown): Error => {
  const parsed = z.object({ message: z.string().min(1) }).safeParse(error);
  return new Error(parsed.success ? parsed.data.message : "Admin database operation failed.");
};

const parseRows = <T>(data: unknown, error: unknown | null, schema: z.ZodType<T>): T => {
  if (error !== null) throw databaseError(error);
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new Error("Database returned an invalid admin record.");
  return parsed.data;
};

const toService = (row: z.infer<typeof serviceRowSchema>): AppointmentServiceSnapshot => ({
  appointmentId: row.appointment_id,
  serviceId: row.service_id,
  serviceName: row.service_name,
  serviceKind: row.service_kind,
  durationMinutes: row.duration_minutes,
  priceCents: row.price_cents,
});

const translateCompletionError = (error: unknown): Error => {
  const parsed = z.object({ message: z.string() }).safeParse(error);
  const message = parsed.success ? parsed.data.message : null;
  switch (message) {
    case "AUTHENTICATION_REQUIRED": return new AuthenticationRequiredError();
    case "ADMIN_REQUIRED": return new AuthorizationRequiredError();
    case "APPOINTMENT_NOT_FOUND": return new AppointmentUnavailableError();
    case "APPOINTMENT_NOT_CHANGEABLE": return new AppointmentStateError();
    case "INVALID_APPOINTMENT_INPUT": return new AppointmentLifecycleValidationError();
    case "IDEMPOTENCY_KEY_REUSED":
    case "IDEMPOTENCY_KEY_EXPIRED":
    case "IDEMPOTENCY_RECORD_INCOMPLETE": return new IdempotencyKeyError(message);
    default: return databaseError(error);
  }
};

/** Request-scoped Supabase persistence for the guarded admin console. */
export const createSupabaseAdminBookingRepository = (
  supabase: SupabaseClient,
): AdminBookingRepository => ({
  listAppointmentsInRange: async (range) => {
    let query = supabase
      .from("appointments")
      .select("id, customer_id, pet_id, groomer_id, status, starts_at, service_ends_at, blocked_until, subtotal_cents, cancelled_at, completed_at, status_changed_at, status_changed_by")
      .gte("starts_at", range.startsAt.toISOString())
      .lt("starts_at", range.endsAt.toISOString());
    if (range.groomerId !== null) query = query.eq("groomer_id", range.groomerId);
    const { data, error } = await query.order("starts_at", { ascending: true });
    const appointments = parseRows(data, error, z.array(appointmentRowSchema));
    if (appointments.length === 0) return [];

    const customerIds = [...new Set(appointments.map((row) => row.customer_id))];
    const petIds = [...new Set(appointments.map((row) => row.pet_id))];
    const groomerIds = [...new Set(appointments.map((row) => row.groomer_id))];
    const appointmentIds = appointments.map((row) => row.id);
    const [profilesResult, petsResult, groomersResult, servicesResult] = await Promise.all([
      supabase.from("profiles").select("id, display_name").in("id", customerIds),
      supabase.from("pets").select("id, name, breed, size").in("id", petIds),
      supabase.from("groomers").select("id, display_name").in("id", groomerIds),
      supabase.from("appointment_services").select("appointment_id, service_id, service_name, service_kind, duration_minutes, price_cents").in("appointment_id", appointmentIds).order("created_at"),
    ]);
    const profiles = parseRows(profilesResult.data, profilesResult.error, z.array(profileRowSchema));
    const pets = parseRows(petsResult.data, petsResult.error, z.array(petRowSchema));
    const groomers = parseRows(groomersResult.data, groomersResult.error, z.array(groomerRowSchema));
    const services = parseRows(servicesResult.data, servicesResult.error, z.array(serviceRowSchema)).map(toService);
    const profileById = new Map(profiles.map((row) => [row.id, row]));
    const petById = new Map(pets.map((row) => [row.id, row]));
    const groomerById = new Map(groomers.map((row) => [row.id, row]));

    return appointments.map((row): AdminAppointmentRecord => {
      const profile = profileById.get(row.customer_id);
      const pet = petById.get(row.pet_id);
      const groomer = groomerById.get(row.groomer_id);
      if (profile === undefined || pet === undefined || groomer === undefined) {
        throw new Error("Admin appointment references missing display data.");
      }
      return {
        id: row.id,
        customerId: row.customer_id,
        customerDisplayName: profile.display_name,
        petId: row.pet_id,
        petName: pet.name,
        petBreed: pet.breed,
        petSize: pet.size,
        groomerId: row.groomer_id,
        groomerDisplayName: groomer.display_name,
        status: row.status,
        startsAt: new Date(row.starts_at),
        serviceEndsAt: new Date(row.service_ends_at),
        blockedUntil: new Date(row.blocked_until),
        subtotalCents: row.subtotal_cents,
        services: services.filter((service) => service.appointmentId === row.id),
        completedAt: row.completed_at === null ? null : new Date(row.completed_at),
        cancelledAt: row.cancelled_at === null ? null : new Date(row.cancelled_at),
        statusChangedAt: new Date(row.status_changed_at),
        statusChangedBy: row.status_changed_by,
      };
    });
  },
  cancelConfirmedAppointment: async (input): Promise<AdminLifecycleMutationResult> => {
    const { data, error } = await supabase.rpc("cancel_confirmed_appointment", {
      requested_appointment_id: input.appointmentId,
      requested_idempotency_key: input.idempotencyKey,
    });
    if (error !== null) throw translateCompletionError(error);
    const row = parseRows(data, null, z.array(cancellationRowSchema).length(1))[0]!;
    return { id: row.id, status: row.status };
  },
  completeConfirmedAppointment: async (appointmentId): Promise<AdminStatusMutationResult> => {
    const { data, error } = await supabase.rpc(
      "complete_confirmed_appointment_as_admin",
      { requested_appointment_id: appointmentId },
    );
    if (error !== null) throw translateCompletionError(error);
    const row = parseRows(data, null, z.array(completionRowSchema).length(1))[0]!;
    return {
      id: row.id,
      status: row.status,
      completedAt: new Date(row.completed_at),
      statusChangedAt: new Date(row.status_changed_at),
      statusChangedBy: row.status_changed_by,
    };
  },
});
