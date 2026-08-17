import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getRequestProfile } from "../../../../../lib/auth/profile";
import { createSupabaseBookingUseCases } from "../../../../../lib/booking/server";
import { formatAppointmentInstant } from "../../../../../lib/ui/format/datetime";
import { formatMoney } from "../../../../../lib/ui/format/money";
import { AppointmentCard } from "../../../../../components/booking/appointment-card";
import { Alert } from "../../../../../components/core/alert";

export default async function BookingConfirmedPage({ params }: { readonly params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params;
  if (await getRequestProfile() === null) {
    const next = `/book/confirmed/${encodeURIComponent(appointmentId)}`;
    redirect(`/sign-in?${new URLSearchParams({ next })}`);
  }
  const useCases = await createSupabaseBookingUseCases();
  const [appointments, snapshots, pets, groomers] = await Promise.all([
    useCases.listMyAppointments(), useCases.listMyAppointmentServices(), useCases.listMyPets(), useCases.listActiveGroomers(),
  ]);
  const appointment = appointments.find((entry) => entry.id === appointmentId);
  if (appointment === undefined) notFound();
  const instant = formatAppointmentInstant(appointment.startsAt.toISOString());
  const end = formatAppointmentInstant(appointment.serviceEndsAt.toISOString());
  const pet = pets.find((entry) => entry.id === appointment.petId);
  const groomer = groomers.find((entry) => entry.id === appointment.groomerId);
  const services = snapshots.filter((entry) => entry.appointmentId === appointment.id).map((entry) => entry.serviceName);

  return (
    <div className="mx-auto max-w-(--container-narrow) px-4 py-10 sm:px-6">
      <Alert tone="success" title="Your visit is confirmed" className="mb-6">We saved the appointment and its price. You can manage it from My appointments.</Alert>
      <AppointmentCard petName={pet?.name ?? "Your pet"} services={services} groomerName={groomer?.displayName ?? "Assigned groomer"} dateLabel={{ weekday: instant.weekday, day: instant.day, month: instant.month }} timeLabel={instant.timeLabel} endTimeLabel={end.timeLabel} subtotalLabel={formatMoney(appointment.subtotalCents)} status={appointment.status} reference={appointment.id} />
      <Link href="/appointments" className="mt-6 inline-flex h-11 items-center rounded-md bg-action px-5 font-semibold text-on-primary">View My appointments</Link>
    </div>
  );
}
