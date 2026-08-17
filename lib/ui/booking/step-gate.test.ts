import { describe, expect, it } from "vitest";
import { canContinueFromStep } from "./step-gate";

describe("booking step gate", () => {
  it("requires only the selection produced by each completed step", () => {
    expect(canContinueFromStep("pet", { hasPet: false, hasServices: false, hasGroomer: false, hasTime: false })).toBe(false);
    expect(canContinueFromStep("services", { hasPet: true, hasServices: true, hasGroomer: false, hasTime: false })).toBe(true);
    expect(canContinueFromStep("time", { hasPet: true, hasServices: true, hasGroomer: true, hasTime: false })).toBe(false);
  });
});
