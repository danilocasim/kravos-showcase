import { createHash } from "node:crypto";

export interface AppointmentKeyPayload {
  readonly petId?: string;
  readonly groomerId?: string;
  readonly appointmentId?: string;
  readonly startsAt?: string;
  readonly selectedServiceIds?: ReadonlyArray<string>;
}

const canonicalPayload = (payload: AppointmentKeyPayload): string =>
  JSON.stringify({
    ...(payload.appointmentId === undefined ? {} : { appointmentId: payload.appointmentId }),
    ...(payload.groomerId === undefined ? {} : { groomerId: payload.groomerId }),
    ...(payload.petId === undefined ? {} : { petId: payload.petId }),
    ...(payload.selectedServiceIds === undefined
      ? {}
      : { selectedServiceIds: [...payload.selectedServiceIds].sort() }),
    ...(payload.startsAt === undefined ? {} : { startsAt: payload.startsAt }),
  });

/** Builds a stable, request-bound key while keeping the nonce visible for support. */
export const createIdempotencyKey = (
  operation: "create" | "reschedule" | "cancel",
  intentId: string,
  payload: AppointmentKeyPayload,
): string => {
  const digest = createHash("sha256").update(canonicalPayload(payload)).digest("hex");
  return `${operation}:${intentId}:${digest}`;
};
