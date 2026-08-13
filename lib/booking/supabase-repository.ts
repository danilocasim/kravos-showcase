import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { AuthenticationRequiredError } from "../auth/guards";
import {
  AppointmentCutoffError,
  AppointmentLifecycleValidationError,
  AppointmentStateError,
  AppointmentUnavailableError,
  IdempotencyKeyError,
  PetUnavailableError,
  SlotUnavailableError,
} from "./use-cases";
import type {
  Appointment,
  BookingRepository,
  ConfirmedAppointmentBlock,
  CreateAppointmentInput,
  CreatePetRecord,
  Groomer,
  GroomerServiceQualification,
  GroomerTimeOff,
  GroomerWorkingHours,
  Pet,
  RescheduleAppointmentInput,
  Service,
  ServiceCompatibility,
  UpdatePetRecord,
} from "./use-cases";

const serviceSchema = z.object({
  id: z.guid(),
  name: z.string(),
  description: z.string(),
  kind: z.enum(["BASE", "ADD_ON"]),
  is_standalone_eligible: z.boolean(),
  duration_minutes: z.number().int(),
  price_cents: z.number().int(),
  is_active: z.boolean(),
});

const serviceCompatibilitySchema = z.object({
  base_service_id: z.guid(),
  add_on_service_id: z.guid(),
});

const groomerSchema = z.object({
  id: z.guid(),
  display_name: z.string(),
  bio: z.string().nullable(),
  is_active: z.boolean(),
});

const qualificationSchema = z.object({
  groomer_id: z.guid(),
  service_id: z.guid(),
});

const workingHoursSchema = z.object({
  id: z.guid(),
  groomer_id: z.guid(),
  iso_day_of_week: z.number().int(),
  starts_at: z.string(),
  ends_at: z.string(),
});

const timeOffSchema = z.object({
  id: z.guid(),
  groomer_id: z.guid(),
  starts_at: z.string().datetime({ offset: true }),
  ends_at: z.string().datetime({ offset: true }),
  reason: z.string().nullable(),
});

const confirmedAppointmentBlockSchema = z.object({
  groomer_id: z.guid(),
  starts_at: z.string().datetime({ offset: true }),
  blocked_until: z.string().datetime({ offset: true }),
});

const appointmentSchema = z.object({
  id: z.guid(),
  customer_id: z.guid(),
  pet_id: z.guid(),
  groomer_id: z.guid(),
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]),
  starts_at: z.string().datetime({ offset: true }),
  service_ends_at: z.string().datetime({ offset: true }),
  blocked_until: z.string().datetime({ offset: true }),
  subtotal_cents: z.number().int(),
  applied_buffer_minutes: z.number().int(),
  cancelled_at: z.string().datetime({ offset: true }).nullable(),
});

const petSchema = z.object({
  id: z.guid(),
  owner_id: z.guid(),
  name: z.string(),
  breed: z.string(),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]),
  age_years: z.number().int(),
  temperament: z.string().nullable(),
  coat_condition: z.string().nullable(),
  allergies: z.string().nullable(),
  notes: z.string().nullable(),
});

const databaseOperationError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  const parsed = z.object({ message: z.string().min(1) }).safeParse(error);
  return new Error(parsed.success ? parsed.data.message : "Database operation failed.");
};

const parseRows = <T>(
  data: unknown,
  error: unknown | null,
  schema: z.ZodType<T>,
): T => {
  if (error !== null) {
    throw databaseOperationError(error);
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Database returned an invalid booking record.");
  }

  return parsed.data;
};

const toService = (row: z.infer<typeof serviceSchema>): Service => ({
  id: row.id,
  name: row.name,
  description: row.description,
  kind: row.kind,
  isStandaloneEligible: row.is_standalone_eligible,
  durationMinutes: row.duration_minutes,
  priceCents: row.price_cents,
  isActive: row.is_active,
});

const toServiceCompatibility = (
  row: z.infer<typeof serviceCompatibilitySchema>,
): ServiceCompatibility => ({
  baseServiceId: row.base_service_id,
  addOnServiceId: row.add_on_service_id,
});

const toGroomer = (row: z.infer<typeof groomerSchema>): Groomer => ({
  id: row.id,
  displayName: row.display_name,
  bio: row.bio,
  isActive: row.is_active,
});

const toQualification = (
  row: z.infer<typeof qualificationSchema>,
): GroomerServiceQualification => ({
  groomerId: row.groomer_id,
  serviceId: row.service_id,
});

const toWorkingHours = (
  row: z.infer<typeof workingHoursSchema>,
): GroomerWorkingHours => ({
  id: row.id,
  groomerId: row.groomer_id,
  isoDayOfWeek: row.iso_day_of_week,
  startsAt: row.starts_at,
  endsAt: row.ends_at,
});

const toTimeOff = (row: z.infer<typeof timeOffSchema>): GroomerTimeOff => ({
  id: row.id,
  groomerId: row.groomer_id,
  startsAt: new Date(row.starts_at),
  endsAt: new Date(row.ends_at),
  reason: row.reason,
});

const toConfirmedAppointmentBlock = (
  row: z.infer<typeof confirmedAppointmentBlockSchema>,
): ConfirmedAppointmentBlock => ({
  groomerId: row.groomer_id,
  startsAt: new Date(row.starts_at),
  blockedUntil: new Date(row.blocked_until),
});

const toAppointment = (row: z.infer<typeof appointmentSchema>): Appointment => ({
  id: row.id,
  customerId: row.customer_id,
  petId: row.pet_id,
  groomerId: row.groomer_id,
  status: row.status,
  startsAt: new Date(row.starts_at),
  serviceEndsAt: new Date(row.service_ends_at),
  blockedUntil: new Date(row.blocked_until),
  subtotalCents: row.subtotal_cents,
  appliedBufferMinutes: row.applied_buffer_minutes,
  cancelledAt: row.cancelled_at === null ? null : new Date(row.cancelled_at),
});

const toPet = (row: z.infer<typeof petSchema>): Pet => ({
  id: row.id,
  ownerId: row.owner_id,
  name: row.name,
  breed: row.breed,
  size: row.size,
  ageYears: row.age_years,
  temperament: row.temperament,
  coatCondition: row.coat_condition,
  allergies: row.allergies,
  notes: row.notes,
});

const toPetInsert = (input: CreatePetRecord) => ({
  owner_id: input.ownerId,
  name: input.name,
  breed: input.breed,
  size: input.size,
  age_years: input.ageYears,
  temperament: input.temperament,
  coat_condition: input.coatCondition,
  allergies: input.allergies,
  notes: input.notes,
});

const lifecycleErrorSchema = z.object({ message: z.string() });

const translateLifecycleError = (error: unknown): Error => {
  const parsed = lifecycleErrorSchema.safeParse(error);
  if (!parsed.success) {
    return databaseOperationError(error);
  }

  switch (parsed.data.message) {
    case "APPOINTMENT_NOT_CHANGEABLE":
      return new AppointmentStateError();
    case "APPOINTMENT_NOT_FOUND":
      return new AppointmentUnavailableError();
    case "AUTHENTICATION_REQUIRED":
      return new AuthenticationRequiredError();
    case "CANCELLATION_CUTOFF_PASSED":
      return new AppointmentCutoffError();
    case "INVALID_APPOINTMENT_INPUT":
      return new AppointmentLifecycleValidationError();
    case "PET_NOT_FOUND":
      return new PetUnavailableError();
    case "IDEMPOTENCY_KEY_REUSED":
    case "IDEMPOTENCY_KEY_EXPIRED":
    case "IDEMPOTENCY_RECORD_INCOMPLETE":
      return new IdempotencyKeyError(parsed.data.message);
    case "SLOT_UNAVAILABLE":
      return new SlotUnavailableError();
    default:
      return databaseOperationError(error);
  }
};

const toCreateAppointmentRpcInput = (input: CreateAppointmentInput) => ({
  requested_pet_id: input.petId,
  requested_groomer_id: input.groomerId,
  requested_starts_at: input.startsAt,
  requested_service_ids: [...input.selectedServiceIds],
  requested_idempotency_key: input.idempotencyKey,
});

const toRescheduleAppointmentRpcInput = (input: RescheduleAppointmentInput) => ({
  requested_appointment_id: input.appointmentId,
  requested_groomer_id: input.groomerId,
  requested_starts_at: input.startsAt,
  requested_service_ids: [...input.selectedServiceIds],
  requested_idempotency_key: input.idempotencyKey,
});

const toPetUpdate = (input: UpdatePetRecord) => ({
  ...(input.name === undefined ? {} : { name: input.name }),
  ...(input.breed === undefined ? {} : { breed: input.breed }),
  ...(input.size === undefined ? {} : { size: input.size }),
  ...(input.ageYears === undefined ? {} : { age_years: input.ageYears }),
  ...(input.temperament === undefined
    ? {}
    : { temperament: input.temperament }),
  ...(input.coatCondition === undefined
    ? {}
    : { coat_condition: input.coatCondition }),
  ...(input.allergies === undefined ? {} : { allergies: input.allergies }),
  ...(input.notes === undefined ? {} : { notes: input.notes }),
});

/**
 * Adapts a request-scoped Supabase client to the Task 5 booking repository.
 * All pet reads and writes include the verified actor's owner ID, providing a
 * domain guard in addition to database RLS.
 */
export const createSupabaseBookingRepository = (
  supabase: SupabaseClient,
): BookingRepository => ({
  listServices: async () => {
    const { data, error } = await supabase
      .from("services")
      .select(
        "id, name, description, kind, is_standalone_eligible, duration_minutes, price_cents, is_active",
      )
      .order("name");

    return parseRows(data, error, z.array(serviceSchema)).map(toService);
  },
  listServiceCompatibility: async () => {
    const { data, error } = await supabase
      .from("service_compatibility")
      .select("base_service_id, add_on_service_id");

    return parseRows(data, error, z.array(serviceCompatibilitySchema)).map(
      toServiceCompatibility,
    );
  },
  listGroomers: async () => {
    const { data, error } = await supabase
      .from("groomers")
      .select("id, display_name, bio, is_active")
      .order("display_name");

    return parseRows(data, error, z.array(groomerSchema)).map(toGroomer);
  },
  listGroomerServiceQualifications: async () => {
    const { data, error } = await supabase
      .from("groomer_services")
      .select("groomer_id, service_id");

    return parseRows(data, error, z.array(qualificationSchema)).map(
      toQualification,
    );
  },
  listGroomerWorkingHours: async (groomerId) => {
    const { data, error } = await supabase
      .from("groomer_working_hours")
      .select("id, groomer_id, iso_day_of_week, starts_at, ends_at")
      .eq("groomer_id", groomerId)
      .order("iso_day_of_week")
      .order("starts_at");

    return parseRows(data, error, z.array(workingHoursSchema)).map(
      toWorkingHours,
    );
  },
  listGroomerTimeOff: async (groomerId) => {
    const { data, error } = await supabase
      .from("groomer_time_off")
      .select("id, groomer_id, starts_at, ends_at, reason")
      .eq("groomer_id", groomerId)
      .order("starts_at");

    return parseRows(data, error, z.array(timeOffSchema)).map(toTimeOff);
  },
  listConfirmedAppointmentBlocks: async (groomerId, range) => {
    const { data, error } = await supabase.rpc(
      "list_confirmed_appointment_blocks",
      {
        target_groomer_id: groomerId,
        range_starts_at: range.startsAt.toISOString(),
        range_ends_at: range.endsAt.toISOString(),
      },
    );

    return parseRows(data, error, z.array(confirmedAppointmentBlockSchema)).map(
      toConfirmedAppointmentBlock,
    );
  },
  createConfirmedAppointment: async (input) => {
    const { data, error } = await supabase.rpc(
      "create_confirmed_appointment",
      toCreateAppointmentRpcInput(input),
    );

    if (error !== null) {
      throw translateLifecycleError(error);
    }

    return toAppointment(parseRows(data, null, z.array(appointmentSchema).length(1))[0]!);
  },
  rescheduleConfirmedAppointment: async (input) => {
    const { data, error } = await supabase.rpc(
      "reschedule_confirmed_appointment",
      toRescheduleAppointmentRpcInput(input),
    );

    if (error !== null) {
      throw translateLifecycleError(error);
    }

    return toAppointment(parseRows(data, null, z.array(appointmentSchema).length(1))[0]!);
  },
  cancelConfirmedAppointment: async (input) => {
    const { data, error } = await supabase.rpc("cancel_confirmed_appointment", {
      requested_appointment_id: input.appointmentId,
      requested_idempotency_key: input.idempotencyKey,
    });

    if (error !== null) {
      throw translateLifecycleError(error);
    }

    return toAppointment(parseRows(data, null, z.array(appointmentSchema).length(1))[0]!);
  },
  listAppointmentsByCustomer: async (customerId) => {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        "id, customer_id, pet_id, groomer_id, status, starts_at, service_ends_at, blocked_until, subtotal_cents, applied_buffer_minutes, cancelled_at",
      )
      .eq("customer_id", customerId)
      .order("starts_at", { ascending: false });

    return parseRows(data, error, z.array(appointmentSchema)).map(toAppointment);
  },
  listPetsByOwner: async (ownerId) => {
    const { data, error } = await supabase
      .from("pets")
      .select(
        "id, owner_id, name, breed, size, age_years, temperament, coat_condition, allergies, notes",
      )
      .eq("owner_id", ownerId)
      .order("name");

    return parseRows(data, error, z.array(petSchema)).map(toPet);
  },
  getPetByOwner: async (petId, ownerId) => {
    const { data, error } = await supabase
      .from("pets")
      .select(
        "id, owner_id, name, breed, size, age_years, temperament, coat_condition, allergies, notes",
      )
      .eq("id", petId)
      .eq("owner_id", ownerId)
      .maybeSingle();

    if (error !== null) {
      throw databaseOperationError(error);
    }
    if (data === null) {
      return null;
    }

    return toPet(parseRows(data, null, petSchema));
  },
  createPet: async (input) => {
    const { data, error } = await supabase
      .from("pets")
      .insert(toPetInsert(input))
      .select(
        "id, owner_id, name, breed, size, age_years, temperament, coat_condition, allergies, notes",
      )
      .single();

    return toPet(parseRows(data, error, petSchema));
  },
  updatePetByOwner: async (petId, ownerId, input) => {
    const { data, error } = await supabase
      .from("pets")
      .update(toPetUpdate(input))
      .eq("id", petId)
      .eq("owner_id", ownerId)
      .select(
        "id, owner_id, name, breed, size, age_years, temperament, coat_condition, allergies, notes",
      )
      .maybeSingle();

    if (error !== null) {
      throw databaseOperationError(error);
    }
    if (data === null) {
      return null;
    }

    return toPet(parseRows(data, null, petSchema));
  },
  deletePetByOwner: async (petId, ownerId) => {
    const { data, error } = await supabase
      .from("pets")
      .delete()
      .eq("id", petId)
      .eq("owner_id", ownerId)
      .select("id")
      .maybeSingle();

    if (error !== null) {
      throw databaseOperationError(error);
    }

    // An owner-scoped delete returns the deleted row; RLS or a missing pet yields null.
    return data !== null;
  },
});
