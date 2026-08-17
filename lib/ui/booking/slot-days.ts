import { businessDate, formatAppointmentInstant } from "../format/datetime";

export interface SerializableAvailabilitySlot {
  readonly groomerId: string;
  readonly startsAt: string;
  readonly serviceEndsAt: string;
  readonly blockedUntil: string;
}

export interface PresentedAvailabilitySlot extends SerializableAvailabilitySlot {
  readonly timeLabel: string;
}

export interface AvailabilityDay {
  readonly date: string;
  readonly label: string;
  readonly slots: ReadonlyArray<PresentedAvailabilitySlot>;
}

/** Groups UTC slots by salon-local day and deduplicates any-available groomers. */
export const groupSlotsIntoDays = (
  slots: ReadonlyArray<SerializableAvailabilitySlot>,
): ReadonlyArray<AvailabilityDay> => {
  const byInstant = new Map<string, SerializableAvailabilitySlot>();

  for (const slot of [...slots].sort(
    (left, right) =>
      left.startsAt.localeCompare(right.startsAt) ||
      left.groomerId.localeCompare(right.groomerId),
  )) {
    if (!byInstant.has(slot.startsAt)) byInstant.set(slot.startsAt, slot);
  }

  const days = new Map<string, Array<PresentedAvailabilitySlot>>();
  for (const slot of byInstant.values()) {
    const date = businessDate(slot.startsAt);
    const presented = {
      ...slot,
      timeLabel: formatAppointmentInstant(slot.startsAt).timeLabel,
    };
    const entries = days.get(date) ?? [];
    entries.push(presented);
    days.set(date, entries);
  }

  return [...days.entries()].map(([date, daySlots]) => ({
    date,
    label: formatAppointmentInstant(daySlots[0]!.startsAt).dateLabel,
    slots: daySlots,
  }));
};
