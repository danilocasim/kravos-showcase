import "server-only";

import { fromZonedTime } from "date-fns-tz";
import { z } from "zod";

import { AuthorizationRequiredError, type AuthenticatedActor } from "../auth/guards";
import { businessTimeZone } from "./business-time";
import { AppointmentLifecycleValidationError, type AppointmentServiceSnapshot, type CancelAppointmentInput, type Pet } from "./use-cases";

export interface AdminAppointmentRecord {
  readonly id: string;
  readonly customerId: string;
  readonly customerDisplayName: string;
  readonly petId: string;
  readonly petName: string;
  readonly petBreed: string;
  readonly petSize: Pet["size"];
  readonly groomerId: string;
  readonly groomerDisplayName: string;
  readonly status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  readonly startsAt: Date;
  readonly serviceEndsAt: Date;
  readonly blockedUntil: Date;
  readonly subtotalCents: number;
  readonly services: ReadonlyArray<AppointmentServiceSnapshot>;
  readonly completedAt: Date | null;
  readonly cancelledAt: Date | null;
  readonly statusChangedAt: Date;
  readonly statusChangedBy: string | null;
}

export interface AdminLifecycleMutationResult {
  readonly id: string;
  readonly status: "CANCELLED" | "COMPLETED";
}

export interface AdminStatusMutationResult extends AdminLifecycleMutationResult {
  readonly id: string;
  readonly status: "COMPLETED";
  readonly completedAt: Date;
  readonly statusChangedAt: Date;
  readonly statusChangedBy: string;
}

export interface AdminScheduleRange {
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly groomerId: string | null;
}

export interface AdminBookingRepository {
  readonly listAppointmentsInRange: (range: AdminScheduleRange) => Promise<ReadonlyArray<AdminAppointmentRecord>>;
  readonly completeConfirmedAppointment: (appointmentId: string) => Promise<AdminStatusMutationResult>;
  readonly cancelConfirmedAppointment: (input: CancelAppointmentInput) => Promise<AdminLifecycleMutationResult>;
}

export interface AdminBookingUseCaseDependencies {
  readonly repository: AdminBookingRepository;
  readonly getCurrentActor: () => Promise<AuthenticatedActor>;
}

const dayInputSchema = z.object({
  date: z.string().date(),
  groomerId: z.guid().nullable().optional(),
}).strict();
const appointmentIdSchema = z.guid();
const cancelInputSchema = z.object({
  appointmentId: z.guid(),
  idempotencyKey: z.string().trim().min(1).max(255),
}).strict();

const requireAdminActor = async (
  getCurrentActor: () => Promise<AuthenticatedActor>,
): Promise<AuthenticatedActor> => {
  const actor = await getCurrentActor();
  if (actor.role !== "ADMIN") throw new AuthorizationRequiredError();
  return actor;
};

const nextCalendarDate = (date: string): string =>
  new Date(Date.parse(`${date}T00:00:00.000Z`) + 86_400_000).toISOString().slice(0, 10);

/** Admin-only appointment schedule and lifecycle operations. */
export const createAdminBookingUseCases = ({
  repository,
  getCurrentActor,
}: AdminBookingUseCaseDependencies) => ({
  listDay: async (input: unknown): Promise<ReadonlyArray<AdminAppointmentRecord>> => {
    await requireAdminActor(getCurrentActor);
    const parsed = dayInputSchema.safeParse(input);
    if (!parsed.success) throw new AppointmentLifecycleValidationError();

    return repository.listAppointmentsInRange({
      startsAt: fromZonedTime(`${parsed.data.date}T00:00:00`, businessTimeZone),
      endsAt: fromZonedTime(`${nextCalendarDate(parsed.data.date)}T00:00:00`, businessTimeZone),
      groomerId: parsed.data.groomerId ?? null,
    });
  },
  completeAppointment: async (appointmentId: unknown): Promise<AdminStatusMutationResult> => {
    await requireAdminActor(getCurrentActor);
    const parsed = appointmentIdSchema.safeParse(appointmentId);
    if (!parsed.success) throw new AppointmentLifecycleValidationError();
    return repository.completeConfirmedAppointment(parsed.data);
  },
  cancelAppointment: async (input: unknown): Promise<AdminLifecycleMutationResult> => {
    await requireAdminActor(getCurrentActor);
    const parsed = cancelInputSchema.safeParse(input);
    if (!parsed.success) throw new AppointmentLifecycleValidationError();
    return repository.cancelConfirmedAppointment(parsed.data);
  },
});
