import { addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import { businessTimeZone } from "../../booking/business-time";

export interface BookingDateRange {
  readonly startsOn: string;
  readonly endsOn: string;
}

export const nextBookableWeek = (now: Date = new Date()): BookingDateRange => {
  let candidate = addDays(now, 14);
  while (formatInTimeZone(candidate, businessTimeZone, "i") !== "1") {
    candidate = addDays(candidate, 1);
  }

  return {
    startsOn: formatInTimeZone(candidate, businessTimeZone, "yyyy-MM-dd"),
    endsOn: formatInTimeZone(addDays(candidate, 5), businessTimeZone, "yyyy-MM-dd"),
  };
};
