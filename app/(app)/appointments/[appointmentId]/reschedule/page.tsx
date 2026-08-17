import { randomUUID } from "node:crypto";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getRequestProfile } from "../../../../../lib/auth/profile";
import { createSupabaseBookingUseCases } from "../../../../../lib/booking/server";
import { canChangeAppointment } from "../../../../../lib/ui/booking/change-window";
import { nextBookableWeek } from "../../../../../lib/ui/booking/date-range";
import { groupSlotsIntoDays } from "../../../../../lib/ui/booking/slot-days";
import { Alert } from "../../../../../components/core/alert";
import { salonPhoneNumber } from "../../../../../lib/ui/error-messages";
import { RescheduleForm } from "./reschedule-form";

export default async function ReschedulePage({ params, searchParams }: { readonly params: Promise<{ appointmentId: string }>; readonly searchParams: Promise<{ readonly intent?: string | string[]; readonly startsOn?: string | string[]; readonly endsOn?: string | string[] }> }) {
  const { appointmentId } = await params;
  const query = await searchParams;
  if (await getRequestProfile() === null) {
    const nextQuery = new URLSearchParams();
    if (typeof query.intent === "string") nextQuery.set("intent", query.intent);
    if (typeof query.startsOn === "string") nextQuery.set("startsOn", query.startsOn);
    if (typeof query.endsOn === "string") nextQuery.set("endsOn", query.endsOn);
    const suffix = nextQuery.size === 0 ? "" : `?${nextQuery}`;
    const next = `/appointments/${encodeURIComponent(appointmentId)}/reschedule${suffix}`;
    redirect(`/sign-in?${new URLSearchParams({ next })}`);
  }
  const useCases = await createSupabaseBookingUseCases();
  const [appointments, snapshots] = await Promise.all([useCases.listMyAppointments(), useCases.listMyAppointmentServices()]);
  const appointment = appointments.find((entry) => entry.id === appointmentId);
  if (appointment === undefined) notFound();
  if (!canChangeAppointment(appointment.startsAt.toISOString())) {
    return <div className="mx-auto max-w-(--container-narrow) px-4 py-10"><Alert tone="warning" title="This visit is inside the 24-hour window">Call the salon on {salonPhoneNumber} to change it.</Alert><Link href="/appointments" className="mt-5 inline-block text-link underline">Back to My appointments</Link></div>;
  }
  const serviceIds = snapshots.filter((entry) => entry.appointmentId === appointment.id).map((entry) => entry.serviceId);
  if (serviceIds.length === 0) notFound();
  const defaults = nextBookableWeek();
  const startsOn = typeof query.startsOn === "string" ? query.startsOn : defaults.startsOn;
  const endsOn = typeof query.endsOn === "string" ? query.endsOn : defaults.endsOn;
  const intent = typeof query.intent === "string" ? query.intent : randomUUID();
  let days = [] as ReturnType<typeof groupSlotsIntoDays>;
  let rangeIsInvalid = false;
  try {
    const result = await useCases.searchAvailability({ petId: appointment.petId, selectedServiceIds: serviceIds, groomerId: appointment.groomerId, startsOn, endsOn });
    days = groupSlotsIntoDays(result.slots.map((slot) => ({ groomerId: slot.groomerId, startsAt: slot.startsAt.toISOString(), serviceEndsAt: slot.serviceEndsAt.toISOString(), blockedUntil: slot.blockedUntil.toISOString() })));
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "INVALID_AVAILABILITY_SEARCH") throw error;
    rangeIsInvalid = true;
  }

  return (
    <div className="mx-auto max-w-(--container-narrow) px-4 py-8 sm:px-6">
      <h1 className="[font:var(--type-h1)] tracking-tight text-heading">Reschedule appointment</h1><p className="mt-1 mb-5 text-muted">Choose another server-verified time with the same groomer and services.</p>
      <form method="get" className="mb-6 grid gap-3 rounded-lg border border-subtle-border bg-card p-4 sm:grid-cols-[1fr_1fr_auto]"><input type="hidden" name="intent" value={intent} /><label className="grid gap-1 text-sm font-semibold">From<input type="date" name="startsOn" defaultValue={startsOn} className="h-11 rounded-md border px-3" /></label><label className="grid gap-1 text-sm font-semibold">Through<input type="date" name="endsOn" defaultValue={endsOn} className="h-11 rounded-md border px-3" /></label><button type="submit" className="self-end h-11 rounded-md border bg-card px-4 font-semibold">Refresh times</button></form>
      {rangeIsInvalid ? <Alert tone="warning" title="Check the date range" code="INVALID_AVAILABILITY_SEARCH">Choose a valid start and end date within the booking window.</Alert> : days.length === 0 ? <Alert tone="info" title="No times in this range">Try another week.</Alert> : <RescheduleForm appointmentId={appointment.id} intent={intent} groomerId={appointment.groomerId} selectedServiceIds={serviceIds} days={days} />}
    </div>
  );
}
