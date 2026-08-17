import { formatInTimeZone } from "date-fns-tz";

import { businessTimeZone } from "../../booking/business-time";

export interface AppointmentInstantPresentation {
  readonly weekday: string;
  readonly day: string;
  readonly month: string;
  readonly dateLabel: string;
  readonly timeLabel: string;
}

export const formatAppointmentInstant = (
  isoInstant: string,
): AppointmentInstantPresentation => {
  const weekday = formatInTimeZone(isoInstant, businessTimeZone, "EEE");
  const day = formatInTimeZone(isoInstant, businessTimeZone, "d");
  const month = formatInTimeZone(isoInstant, businessTimeZone, "MMM");

  return {
    weekday,
    day,
    month,
    dateLabel: `${weekday} ${day} ${month}`,
    timeLabel: formatInTimeZone(isoInstant, businessTimeZone, "h:mm a"),
  };
};

export const formatBusinessOffset = (isoInstant: string): string =>
  formatInTimeZone(isoInstant, businessTimeZone, "XXX");

export const businessDate = (isoInstant: string): string =>
  formatInTimeZone(isoInstant, businessTimeZone, "yyyy-MM-dd");
