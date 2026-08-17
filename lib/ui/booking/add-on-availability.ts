import type { ServiceCompatibility } from "../../booking/use-cases";

export interface AddOnSummary {
  readonly id: string;
  readonly name: string;
}

export interface AddOnAvailability {
  readonly serviceId: string;
  readonly selectable: boolean;
  readonly reason: string | null;
}

const presentationOverrides: Readonly<Record<string, string>> = {
  "Nail Trim": "Already included in Full Groom",
};

/** Uses persisted compatibility as the only rule for whether an add-on is enabled. */
export const buildAddOnAvailability = (
  baseServiceId: string,
  addOns: ReadonlyArray<AddOnSummary>,
  compatibility: ReadonlyArray<ServiceCompatibility>,
): ReadonlyArray<AddOnAvailability> => {
  const allowed = new Set(
    compatibility
      .filter((pair) => pair.baseServiceId === baseServiceId)
      .map((pair) => pair.addOnServiceId),
  );

  return addOns.map((addOn) => {
    const selectable = allowed.has(addOn.id);
    return {
      serviceId: addOn.id,
      selectable,
      reason: selectable
        ? null
        : (presentationOverrides[addOn.name] ?? "Not available with this service"),
    };
  });
};
