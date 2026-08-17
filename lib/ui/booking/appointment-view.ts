import { canChangeAppointment } from "./change-window";

export interface AppointmentViewInput {
  readonly id: string;
  readonly petId: string;
  readonly groomerId: string;
  readonly status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  readonly startsAt: string;
  readonly serviceEndsAt: string;
  readonly subtotalCents: number;
}

export interface AppointmentView {
  readonly appointment: AppointmentViewInput;
  readonly petName: string;
  readonly groomerName: string;
  readonly serviceNames: ReadonlyArray<string>;
  readonly changeable: boolean;
}

export const buildAppointmentViews = ({
  now,
  appointments,
  services,
  pets,
  groomers,
}: {
  readonly now: string;
  readonly appointments: ReadonlyArray<AppointmentViewInput>;
  readonly services: ReadonlyArray<{ readonly appointmentId: string; readonly serviceName: string }>;
  readonly pets: ReadonlyArray<{ readonly id: string; readonly name: string }>;
  readonly groomers: ReadonlyArray<{ readonly id: string; readonly displayName: string }>;
}): ReadonlyArray<AppointmentView> =>
  appointments.map((appointment) => ({
    appointment,
    petName: pets.find((pet) => pet.id === appointment.petId)?.name ?? "Your pet",
    groomerName:
      groomers.find((groomer) => groomer.id === appointment.groomerId)?.displayName ??
      "Assigned groomer",
    serviceNames: services
      .filter((service) => service.appointmentId === appointment.id)
      .map((service) => service.serviceName),
    changeable:
      appointment.status === "CONFIRMED" &&
      canChangeAppointment(appointment.startsAt, now),
  }));
