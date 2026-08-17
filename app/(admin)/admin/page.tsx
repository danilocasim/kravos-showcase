import Link from "next/link";
import { redirect } from "next/navigation";

import { Alert } from "../../../components/core/alert";
import { Card } from "../../../components/core/card";
import { EmptyState } from "../../../components/core/empty-state";
import { Icon } from "../../../components/core/icon";
import { businessTimeZone, cleanupBufferMinutes } from "../../../lib/booking/business-time";
import { createSupabaseAdminBookingUseCases } from "../../../lib/booking/admin-server";
import { createSupabaseBookingUseCases } from "../../../lib/booking/server";
import { getRequestProfile } from "../../../lib/auth/profile";
import { adjacentBusinessDate, buildAdminConsole, parseAdminConsoleQuery, type RawAdminConsoleQuery } from "../../../lib/ui/admin/console";
import { AdminFilters } from "./admin-filters";
import { AdminAppointmentTable } from "./appointment-table";
import { StatTile } from "./stat-tile";

const scheduleHref = (
  date: string,
  groomerId: string | null,
  showCancelled: boolean,
): string => {
  const params = new URLSearchParams({ date, cancelled: showCancelled ? "show" : "hide" });
  if (groomerId !== null) params.set("groomerId", groomerId);
  return `/admin?${params}`;
};
const navLinkClass = "inline-flex min-h-11 items-center justify-center rounded-md border border-default-border bg-card px-3 font-semibold text-body hover:border-strong-border hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
const dateArrowClass = "inline-flex size-11 flex-none items-center justify-center rounded-md border border-default-border bg-card text-muted transition-colors hover:border-strong-border hover:bg-sunken hover:text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export default async function AdminSchedulePage({
  searchParams,
}: {
  readonly searchParams: Promise<RawAdminConsoleQuery>;
}) {
  const rawQuery = await searchParams;
  const query = parseAdminConsoleQuery(rawQuery);
  const profile = await getRequestProfile();
  if (profile === null) {
    const next = scheduleHref(query.date, query.groomerId, query.showCancelled);
    redirect(`/sign-in?${new URLSearchParams({ next })}`);
  }
  if (profile.role !== "ADMIN") redirect("/appointments");

  const adminUseCases = await createSupabaseAdminBookingUseCases();
  const appointments = await adminUseCases.listDay({ date: query.date });
  const bookingUseCases = await createSupabaseBookingUseCases();
  const groomers = await bookingUseCases.listActiveGroomers();
  const consoleView = buildAdminConsole(appointments, query.date);
  const visibleAppointments = consoleView.appointments.filter(
    (appointment) =>
      (query.groomerId === null || appointment.groomerId === query.groomerId) &&
      (query.showCancelled || appointment.status !== "CANCELLED"),
  );

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="[font:var(--type-overline)] tracking-(--tracking-caps) text-spruce-700 uppercase">Day schedule</p>
          <h1 className="mt-1 [font:var(--type-h1)] tracking-tight text-heading">{consoleView.heading}</h1>
          <p className="mt-1 [font:var(--type-small)] text-muted">{businessTimeZone.replace("America/", "").replace("_", " ")} time · {cleanupBufferMinutes}-minute cleanup buffer after every visit</p>
        </div>
        <div role="group" aria-label="Schedule date" className="flex w-full flex-wrap items-center gap-2 rounded-lg border border-subtle-border bg-card p-2 shadow-card xl:w-auto xl:flex-nowrap">
          <Link
            href={scheduleHref(adjacentBusinessDate(query.date, -1), query.groomerId, query.showCancelled)}
            aria-label="Previous day"
            title="Previous day"
            className={dateArrowClass}
          >
            <Icon name="chevron-left" size={18} />
          </Link>
          <form method="get" className="flex min-w-[220px] flex-1 items-center gap-2 xl:flex-none">
            {query.groomerId !== null ? <input type="hidden" name="groomerId" value={query.groomerId} /> : null}
            <input type="hidden" name="cancelled" value={query.showCancelled ? "show" : "hide"} />
            <label htmlFor="schedule-date" className="sr-only">Choose date</label>
            <input id="schedule-date" type="date" name="date" required defaultValue={query.date} className="h-11 min-w-0 flex-1 rounded-md border border-default-border bg-card px-3 text-body outline-none focus:border-focus focus:shadow-[var(--focus-ring)] xl:w-[158px] xl:flex-none" />
            <button type="submit" className="inline-flex h-11 items-center justify-center rounded-md bg-action px-4 font-semibold text-on-primary transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">View</button>
          </form>
          <Link
            href={scheduleHref(adjacentBusinessDate(query.date, 1), query.groomerId, query.showCancelled)}
            aria-label="Next day"
            title="Next day"
            className={dateArrowClass}
          >
            <Icon name="chevron-right" size={18} />
          </Link>
          <span aria-hidden="true" className="hidden h-7 w-px bg-subtle-border sm:block" />
          <Link href="/admin" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-primary-soft px-4 font-semibold text-spruce-800 transition-colors hover:bg-spruce-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:flex-none">Today</Link>
        </div>
      </div>

      <section aria-label="Whole-day appointment totals" className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Confirmed" value={consoleView.stats.confirmed} icon="calendar-check" />
        <StatTile label="Completed" value={consoleView.stats.completed} icon="badge-check" />
        <StatTile label="Cancelled" value={consoleView.stats.cancelled} icon="circle-x" />
        <StatTile label="Scheduled subtotal" value={consoleView.stats.scheduledSubtotalLabel} icon="credit-card" accent />
      </section>

      <Card padding="none" className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-subtle-border bg-card px-4 py-4 sm:px-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="[font:var(--type-h3)] tracking-tight text-heading">Appointments</h2>
            <p aria-live="polite" className="mt-1 [font:var(--type-caption)] text-subtle">{visibleAppointments.length} of {appointments.length} shown</p>
          </div>
          <div className="lg:ml-auto"><AdminFilters groomers={groomers} groomerId={query.groomerId} showCancelled={query.showCancelled} /></div>
        </div>
        {visibleAppointments.length > 0 ? (
          <AdminAppointmentTable appointments={visibleAppointments} />
        ) : appointments.length === 0 ? (
          <div className="p-6"><EmptyState compact icon="calendar-x" title="No appointments this day" description="Choose another date to review the salon schedule." /></div>
        ) : (
          <div className="p-6"><EmptyState compact icon="circle-alert" title="Nothing matches these filters" description="Clear the groomer filter and show cancelled visits to see the full day." action={<Link href={scheduleHref(query.date, null, true)} className={navLinkClass}>Clear filters</Link>} /></div>
        )}
      </Card>

      <Alert tone="info" title="Admin overrides are audited" className="mt-5">
        Admins can cancel inside the customer&apos;s 24-hour cutoff. Every status change records the verified actor and time against the appointment. Customers are not notified automatically.
      </Alert>
    </div>
  );
}
