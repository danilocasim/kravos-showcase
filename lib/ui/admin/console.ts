import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import type { AdminAppointmentRecord } from "../../booking/admin-use-cases";
import { businessTimeZone } from "../../booking/business-time";
import { formatMoney } from "../format/money";

export type RawAdminConsoleQuery = Readonly<Record<string, string | string[] | undefined>>;
export interface AdminConsoleQuery {
  readonly date: string;
  readonly groomerId: string | null;
  readonly showCancelled: boolean;
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const scalar = (value: string | string[] | undefined): string | null =>
  typeof value === "string" && value.trim() !== "" ? value : null;
const validDate = (value: string | null): value is string => {
  if (value === null || !datePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
};

export const parseAdminConsoleQuery = (
  query: RawAdminConsoleQuery,
  now: Date = new Date(),
): AdminConsoleQuery => {
  const requestedDate = scalar(query.date);
  const requestedGroomer = scalar(query.groomerId);
  return {
    date: validDate(requestedDate)
      ? requestedDate
      : formatInTimeZone(now, businessTimeZone, "yyyy-MM-dd"),
    groomerId:
      requestedGroomer !== null && uuidPattern.test(requestedGroomer)
        ? requestedGroomer
        : null,
    showCancelled: scalar(query.cancelled) !== "hide",
  };
};

export const adjacentBusinessDate = (date: string, days: number): string =>
  new Date(Date.parse(`${date}T00:00:00.000Z`) + days * 86_400_000)
    .toISOString()
    .slice(0, 10);

export interface AdminAppointmentView {
  readonly id: string;
  readonly reference: string;
  readonly customerDisplayName: string;
  readonly petName: string;
  readonly petMeta: string;
  readonly groomerId: string;
  readonly groomerDisplayName: string;
  readonly status: AdminAppointmentRecord["status"];
  readonly timeLabel: string;
  readonly endTimeLabel: string;
  readonly serviceNames: ReadonlyArray<string>;
  readonly subtotalLabel: string;
  readonly canTransition: boolean;
  readonly auditLabel: string;
}

export interface AdminConsoleView {
  readonly heading: string;
  readonly stats: {
    readonly confirmed: number;
    readonly completed: number;
    readonly cancelled: number;
    readonly scheduledSubtotalLabel: string;
  };
  readonly appointments: ReadonlyArray<AdminAppointmentView>;
}

const sizeLabels = { SMALL: "Small", MEDIUM: "Medium", LARGE: "Large" } as const;

export const buildAdminConsole = (
  appointments: ReadonlyArray<AdminAppointmentRecord>,
  date: string,
): AdminConsoleView => ({
  heading: formatInTimeZone(fromZonedTime(`${date}T12:00:00`, businessTimeZone), businessTimeZone, "EEEE d MMMM"),
  stats: {
    confirmed: appointments.filter((entry) => entry.status === "CONFIRMED").length,
    completed: appointments.filter((entry) => entry.status === "COMPLETED").length,
    cancelled: appointments.filter((entry) => entry.status === "CANCELLED").length,
    scheduledSubtotalLabel: formatMoney(
      appointments
        .filter((entry) => entry.status !== "CANCELLED")
        .reduce((total, entry) => total + entry.subtotalCents, 0),
    ),
  },
  appointments: appointments.map((entry) => ({
    id: entry.id,
    reference: `APT-${entry.id.replaceAll("-", "").slice(-6).toUpperCase()}`,
    customerDisplayName: entry.customerDisplayName,
    petName: entry.petName,
    petMeta: `${entry.petBreed} · ${sizeLabels[entry.petSize]}`,
    groomerId: entry.groomerId,
    groomerDisplayName: entry.groomerDisplayName,
    status: entry.status,
    timeLabel: formatInTimeZone(entry.startsAt, businessTimeZone, "h:mm a"),
    endTimeLabel: formatInTimeZone(entry.serviceEndsAt, businessTimeZone, "h:mm a"),
    serviceNames: entry.services.map((service) => service.serviceName),
    subtotalLabel: formatMoney(entry.subtotalCents),
    canTransition: entry.status === "CONFIRMED",
    auditLabel: `Status recorded ${formatInTimeZone(entry.statusChangedAt, businessTimeZone, "MMM d, h:mm a")}`,
  })),
});
