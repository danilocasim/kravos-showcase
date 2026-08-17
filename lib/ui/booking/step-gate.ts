import type { BookingStep } from "./wizard-state";

export interface StepSelections {
  readonly hasPet: boolean;
  readonly hasServices: boolean;
  readonly hasGroomer: boolean;
  readonly hasTime: boolean;
}

export const canContinueFromStep = (
  step: BookingStep,
  selection: StepSelections,
): boolean => {
  if (step === "pet") return selection.hasPet;
  if (step === "services") return selection.hasPet && selection.hasServices;
  if (step === "groomer") return selection.hasPet && selection.hasServices && selection.hasGroomer;
  if (step === "time") return selection.hasPet && selection.hasServices && selection.hasGroomer && selection.hasTime;
  return selection.hasPet && selection.hasServices && selection.hasGroomer && selection.hasTime;
};
