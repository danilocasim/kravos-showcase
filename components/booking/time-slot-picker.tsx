import { Icon } from "../core/icon";

export interface TimeSlotOptionViewModel {
  /** Submitted server-owned instant or other stable slot identifier. */
  readonly value: string;
  readonly timeLabel: string;
  readonly groomerLabel?: string;
  readonly accessibleLabel?: string;
  readonly unavailable?: boolean;
}

export interface TimeSlotDayViewModel {
  readonly key: string;
  readonly label: string;
  readonly slots: ReadonlyArray<TimeSlotOptionViewModel>;
  readonly emptyReason?: string;
}

export interface TimeSlotPickerProps {
  readonly days: ReadonlyArray<TimeSlotDayViewModel>;
  readonly name: string;
  readonly selectedValue?: string;
  readonly onSelect?: (value: string) => void;
  readonly note?: string;
  readonly legend?: string;
  readonly required?: boolean;
  readonly className?: string;
}

/** Renders server-grouped availability as one native radio group. */
export const TimeSlotPicker = ({
  days,
  name,
  selectedValue,
  onSelect,
  note,
  legend = "Available appointment times",
  required = false,
  className = "",
}: TimeSlotPickerProps) => (
  <fieldset className={`flex min-w-0 flex-col gap-5 ${className}`}>
    <legend className="sr-only">{legend}</legend>
    {days.map((day) => (
      <section key={day.key} className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="[font:var(--type-label)] text-heading">{day.label}</h3>
          <span className="[font:var(--type-caption)] text-subtle">
            {day.slots.length === 0
              ? "Fully booked"
              : `${day.slots.length} ${day.slots.length === 1 ? "time" : "times"}`}
          </span>
        </div>
        {day.slots.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:[grid-template-columns:repeat(auto-fill,minmax(104px,1fr))]">
            {day.slots.map((slot) => (
              <label
                key={slot.value}
                className="relative flex min-h-(--hit-target-min) cursor-pointer flex-col items-center justify-center gap-px rounded-md border border-slot-free-border bg-card px-2 text-center [font:var(--type-body-strong)] text-heading [transition:var(--transition-control)] hover:border-strong-border hover:bg-sand-50 has-[:checked]:border-slot-selected has-[:checked]:bg-slot-selected has-[:checked]:text-on-primary has-[:focus-visible]:border-focus has-[:focus-visible]:shadow-[var(--focus-ring)] has-[:disabled]:cursor-not-allowed has-[:disabled]:border-subtle-border has-[:disabled]:bg-sunken has-[:disabled]:text-slot-unavailable"
              >
                <input
                  type="radio"
                  name={name}
                  value={slot.value}
                  defaultChecked={slot.value === selectedValue}
                  disabled={slot.unavailable}
                  required={required}
                  aria-label={
                    slot.accessibleLabel ??
                    `${day.label}, ${slot.timeLabel}${
                      slot.groomerLabel === undefined ? "" : `, with ${slot.groomerLabel}`
                    }`
                  }
                  onChange={
                    onSelect === undefined
                      ? undefined
                      : () => {
                          onSelect(slot.value);
                        }
                  }
                  className="peer sr-only"
                />
                <span className="peer-disabled:line-through">{slot.timeLabel}</span>
                {slot.groomerLabel !== undefined ? (
                  <span className="text-2xs font-medium text-subtle peer-checked:text-spruce-200 peer-disabled:no-underline">
                    {slot.groomerLabel}
                  </span>
                ) : null}
              </label>
            ))}
          </div>
        ) : (
          <p className="m-0 inline-flex items-start gap-2 rounded-md bg-sunken p-3 [font:var(--type-small)] text-muted">
            <Icon name="calendar-x" size={15} className="mt-0.5 flex-none" />
            {day.emptyReason ?? "No times available on this day."}
          </p>
        )}
      </section>
    ))}
    {note !== undefined ? (
      <p className="m-0 inline-flex items-start gap-1.5 [font:var(--type-caption)] text-muted">
        <Icon name="info" size={13} className="mt-0.5 flex-none" />
        {note}
      </p>
    ) : null}
  </fieldset>
);
