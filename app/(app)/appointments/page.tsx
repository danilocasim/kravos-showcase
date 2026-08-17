import { randomUUID } from "node:crypto";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getRequestProfile } from "../../../lib/auth/profile";
import { createSupabaseBookingUseCases } from "../../../lib/booking/server";
import { buildAppointmentViews } from "../../../lib/ui/booking/appointment-view";
import { formatAppointmentInstant } from "../../../lib/ui/format/datetime";
import { formatMoney } from "../../../lib/ui/format/money";
import { AppointmentCard } from "../../../components/booking/appointment-card";
import { EmptyState } from "../../../components/core/empty-state";
import { Icon } from "../../../components/core/icon";
import { TabLinks } from "../../../components/navigation/tab-links";
import { salonPhoneNumber } from "../../../lib/ui/error-messages";
import { CancelDialog } from "./cancel-dialog";

export default async function AppointmentsPage({ searchParams }: { readonly searchParams: Promise<{ readonly tab?: string | string[] }> }) {
  const query = await searchParams;
  if (await getRequestProfile() === null) {
    const next = typeof query.tab === "string" ? `/appointments?tab=${encodeURIComponent(query.tab)}` : "/appointments";
    redirect(`/sign-in?${new URLSearchParams({ next })}`);
  }
  const tab = query.tab === "past" ? "past" : "upcoming";
  const useCases = await createSupabaseBookingUseCases();
  const [appointments, services, pets, groomers] = await Promise.all([
    useCases.listMyAppointments(), useCases.listMyAppointmentServices(), useCases.listMyPets(), useCases.listActiveGroomers(),
  ]);
  const views = buildAppointmentViews({
    now: new Date().toISOString(),
    appointments: appointments.map((appointment) => ({
      id: appointment.id, petId: appointment.petId, groomerId: appointment.groomerId,
      status: appointment.status, startsAt: appointment.startsAt.toISOString(),
      serviceEndsAt: appointment.serviceEndsAt.toISOString(), subtotalCents: appointment.subtotalCents,
    })),
    services, pets, groomers,
  });
  const upcoming = views.filter((view) => view.appointment.status === "CONFIRMED");
  const past = views.filter((view) => view.appointment.status !== "CONFIRMED");
  const visible = tab === "upcoming" ? upcoming : past;

  return (
    <div className="mx-auto max-w-(--container-app) px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div><h1 className="[font:var(--type-h1)] tracking-tight text-heading">My appointments</h1><p className="mt-1 text-muted">All times are Eastern, the way the salon runs them.</p></div>
        <Link href="/book" className="inline-flex h-11 items-center gap-2 rounded-md bg-action px-4 font-semibold text-on-primary"><Icon name="plus" size={16} />Book a visit</Link>
      </div>
      <TabLinks ariaLabel="Appointment filters" activeValue={tab} className="mb-5" items={[{ value: "upcoming", label: "Upcoming", href: "/appointments?tab=upcoming", count: upcoming.length }, { value: "past", label: "Past & cancelled", href: "/appointments?tab=past", count: past.length }]} />
      {visible.length === 0 ? <EmptyState icon="calendar-days" title={tab === "upcoming" ? "Nothing booked yet" : "No past appointments"} description={tab === "upcoming" ? "Pick a service and a time that suits you — it takes about a minute." : "Completed and cancelled visits will appear here."} action={tab === "upcoming" ? <Link href="/book" className="text-link underline">Book a visit</Link> : undefined} /> : (
        <div className="grid gap-3">{visible.map((view) => {
          const start = formatAppointmentInstant(view.appointment.startsAt);
          const end = formatAppointmentInstant(view.appointment.serviceEndsAt);
          const description = `${view.groomerName} · ${start.dateLabel}, ${start.timeLabel}. The slot is released straight away.`;
          return <AppointmentCard key={view.appointment.id} petName={view.petName} services={view.serviceNames} groomerName={view.groomerName} dateLabel={{ weekday: start.weekday, day: start.day, month: start.month }} timeLabel={start.timeLabel} endTimeLabel={end.timeLabel} subtotalLabel={formatMoney(view.appointment.subtotalCents)} status={view.appointment.status} reference={view.appointment.id} {...(view.appointment.status === "CONFIRMED" && !view.changeable ? { lockedNote: `Inside the 24-hour window — call the salon on ${salonPhoneNumber} to change this visit.` } : {})} {...(view.changeable ? { actions: <><Link href={`/appointments/${view.appointment.id}/reschedule?intent=${randomUUID()}`} className="inline-flex items-center rounded-md border border-default-border bg-card px-3 text-sm font-semibold">Reschedule</Link><CancelDialog appointmentId={view.appointment.id} description={description} /></> } : {})} />;
        })}</div>
      )}
    </div>
  );
}
