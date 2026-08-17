import { describe, expect, it } from "vitest";
import { parseWizardQuery, parseWizardState, wizardQuery } from "./wizard-state";

describe("wizard URL state", () => {
  it("normalizes repeated add-ons and rejects multi-valued scalar params", () => {
    const state = parseWizardState({
      intent: "00000000-0000-4000-8000-000000000001",
      step: "services",
      petId: ["00000000-0000-4000-8000-000000000002", "00000000-0000-4000-8000-000000000003"],
      baseServiceId: "10000000-0000-0000-0000-000000000001",
      addOnServiceId: ["10000000-0000-0000-0000-000000000004", "10000000-0000-0000-0000-000000000003"],
    });

    expect(state.petId).toBeNull();
    expect(state.addOnServiceIds).toEqual(["10000000-0000-0000-0000-000000000004", "10000000-0000-0000-0000-000000000003"]);
    expect(wizardQuery(state)).toContain("addOnServiceId=10000000-0000-0000-0000-000000000004");
  });
  it("preserves every repeated add-on when parsing serialized state", () => {
    const state = parseWizardQuery(
      "intent=00000000-0000-4000-8000-000000000001&step=time&" +
      "addOnServiceId=10000000-0000-0000-0000-000000000003&" +
      "addOnServiceId=10000000-0000-0000-0000-000000000004",
    );

    expect(state.addOnServiceIds).toEqual([
      "10000000-0000-0000-0000-000000000003",
      "10000000-0000-0000-0000-000000000004",
    ]);
  });

  it("drops malformed identifiers, dates, and instants at the URL boundary", () => {
    const state = parseWizardState({
      intent: "not-an-intent",
      petId: "../another-customer",
      baseServiceId: "base",
      addOnServiceId: ["bad", "10000000-0000-0000-0000-000000000004"],
      groomerId: "someone-else",
      startsOn: "2026-99-99",
      endsOn: "tomorrow",
      startsAt: "Monday morning",
    });

    expect(state).toMatchObject({
      intent: null,
      petId: null,
      baseServiceId: null,
      addOnServiceIds: ["10000000-0000-0000-0000-000000000004"],
      groomerId: null,
      startsOn: null,
      endsOn: null,
      startsAt: null,
    });
  });

});
