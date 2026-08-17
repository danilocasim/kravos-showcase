export type BookingStep = "pet" | "services" | "groomer" | "time" | "review";
export type RawSearchParams = Readonly<Record<string, string | string[] | undefined>>;

export interface WizardState {
  readonly intent: string | null;
  readonly step: BookingStep;
  readonly petId: string | null;
  readonly baseServiceId: string | null;
  readonly addOnServiceIds: ReadonlyArray<string>;
  readonly groomerId: string | null;
  readonly startsOn: string | null;
  readonly endsOn: string | null;
  readonly startsAt: string | null;
}

const steps = new Set<BookingStep>(["pet", "services", "groomer", "time", "review"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const offsetInstantPattern = /^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/;
const scalar = (value: string | string[] | undefined): string | null =>
  typeof value === "string" && value.trim() !== "" ? value : null;
const uuid = (value: string | string[] | undefined): string | null => {
  const parsed = scalar(value);
  return parsed !== null && uuidPattern.test(parsed) ? parsed : null;
};
const calendarDate = (value: string | string[] | undefined): string | null => {
  const parsed = scalar(value);
  if (parsed === null || !datePattern.test(parsed)) return null;
  const date = new Date(`${parsed}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === parsed
    ? parsed
    : null;
};
const offsetInstant = (value: string | string[] | undefined): string | null => {
  const parsed = scalar(value);
  return parsed !== null && offsetInstantPattern.test(parsed) && !Number.isNaN(Date.parse(parsed))
    ? parsed
    : null;
};

export const parseWizardState = (query: RawSearchParams): WizardState => {
  const rawStep = scalar(query.step);
  return {
    intent: uuid(query.intent),
    step: rawStep !== null && steps.has(rawStep as BookingStep)
      ? (rawStep as BookingStep)
      : "pet",
    petId: uuid(query.petId),
    baseServiceId: uuid(query.baseServiceId),
    addOnServiceIds: (Array.isArray(query.addOnServiceId)
      ? query.addOnServiceId
      : query.addOnServiceId === undefined
        ? []
        : [query.addOnServiceId]
    ).filter((value) => uuidPattern.test(value)),
    groomerId: scalar(query.groomerId) === "any" ? "any" : uuid(query.groomerId),
    startsOn: calendarDate(query.startsOn),
    endsOn: calendarDate(query.endsOn),
    startsAt: offsetInstant(query.startsAt),
  };
};

/** Parses serialized wizard state without collapsing repeated add-on keys. */
export const parseWizardQuery = (value: string): WizardState => {
  const params = new URLSearchParams(value);
  const query: Record<string, string | string[]> = {};
  for (const name of new Set(params.keys())) {
    const values = params.getAll(name);
    query[name] = values.length === 1 ? values[0]! : values;
  }
  return parseWizardState(query);
};

export const selectedServiceIds = (state: WizardState): ReadonlyArray<string> => [
  ...(state.baseServiceId === null ? [] : [state.baseServiceId]),
  ...state.addOnServiceIds,
];

export const wizardQuery = (
  state: WizardState,
  overrides: Partial<WizardState> = {},
): string => {
  const next = { ...state, ...overrides };
  const params = new URLSearchParams();
  const scalarEntries: ReadonlyArray<readonly [string, string | null]> = [
    ["intent", next.intent],
    ["step", next.step],
    ["petId", next.petId],
    ["baseServiceId", next.baseServiceId],
    ["groomerId", next.groomerId],
    ["startsOn", next.startsOn],
    ["endsOn", next.endsOn],
    ["startsAt", next.startsAt],
  ];
  for (const [name, value] of scalarEntries) if (value !== null) params.set(name, value);
  for (const id of next.addOnServiceIds) params.append("addOnServiceId", id);
  return params.toString();
};
