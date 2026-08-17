/**
 * Approved operating constants from `tasks/phase-0.md`.
 *
 * This module is deliberately free of a `server-only` marker and of any
 * dependency: the server booking domain derives availability and pricing from
 * these values, and browser formatters need the same timezone to render a
 * business-local day and time. Keeping one definition prevents the UI from
 * drifting away from the schedule the server actually enforces.
 */

/** IANA timezone the salon operates in; all customer-facing times use it. */
export const businessTimeZone = "America/New_York";

/** Minutes reserved after a service before the groomer is free again. */
export const cleanupBufferMinutes = 15;

/** Granularity of bookable appointment start times, in minutes. */
export const slotIntervalMinutes = 15;

/** Largest inclusive date range one availability search may cover, in days. */
export const maximumAvailabilitySearchDays = 31;
