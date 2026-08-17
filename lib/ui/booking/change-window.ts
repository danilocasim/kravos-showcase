const changeCutoffMilliseconds = 24 * 60 * 60 * 1000;

/** Mirrors the database cutoff: a visit is changeable only when start > now + 24h. */
export const canChangeAppointment = (
  startsAt: string,
  now: string | Date = new Date(),
): boolean =>
  new Date(startsAt).getTime() > new Date(now).getTime() + changeCutoffMilliseconds;
