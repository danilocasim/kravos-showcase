import { describe, expect, it } from "vitest";

import { parsePetForm } from "./pet-form";

const formDataOf = (entries: Record<string, string>): FormData => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
};

const completeForm = {
  name: "Biscuit",
  breed: "Cockapoo",
  size: "MEDIUM",
  ageYears: "3",
  temperament: "Calm, nervous with clippers",
  coatCondition: "",
  allergies: "",
  notes: "",
};

describe("parsePetForm", () => {
  it("maps submitted form fields onto the pet input and coerces age to a number", () => {
    const parsed = parsePetForm(formDataOf(completeForm));

    expect(parsed.ok).toBe(true);
    expect(parsed.ok && parsed.value).toEqual({
      name: "Biscuit",
      breed: "Cockapoo",
      size: "MEDIUM",
      ageYears: 3,
      temperament: "Calm, nervous with clippers",
      coatCondition: null,
      allergies: null,
      notes: null,
    });
  });

  it("returns a field error keyed by the input name for a blank breed", () => {
    const parsed = parsePetForm(formDataOf({ ...completeForm, breed: "  " }));

    expect(parsed.ok).toBe(false);
    expect(parsed.ok === false && Object.keys(parsed.fieldErrors)).toEqual([
      "breed",
    ]);
  });

  it("returns a field error when the age is not a whole number", () => {
    const parsed = parsePetForm(formDataOf({ ...completeForm, ageYears: "2.5" }));

    expect(parsed.ok).toBe(false);
    expect(parsed.ok === false && parsed.fieldErrors.ageYears).toBe(
      "Enter a whole number of years, from 0 to 30.",
    );
  });

  it("returns a field error when the age is above thirty", () => {
    const parsed = parsePetForm(formDataOf({ ...completeForm, ageYears: "31" }));

    expect(parsed.ok).toBe(false);
    expect(parsed.ok === false && parsed.fieldErrors.ageYears).toBeDefined();
  });

  it("returns a field error when the age is not a number at all", () => {
    const parsed = parsePetForm(formDataOf({ ...completeForm, ageYears: "old" }));

    expect(parsed.ok).toBe(false);
    expect(parsed.ok === false && parsed.fieldErrors.ageYears).toBeDefined();
  });

  it("rejects a size outside the catalogue", () => {
    const parsed = parsePetForm(formDataOf({ ...completeForm, size: "GIANT" }));

    expect(parsed.ok).toBe(false);
    expect(parsed.ok === false && parsed.fieldErrors.size).toBe(
      "Choose a size.",
    );
  });

  it("turns blank optional notes into null", () => {
    const parsed = parsePetForm(
      formDataOf({ ...completeForm, notes: "   ", allergies: "" }),
    );

    expect(parsed.ok && parsed.value.notes).toBeNull();
    expect(parsed.ok && parsed.value.allergies).toBeNull();
  });

  it("produces a partial update containing only the submitted fields", () => {
    const formData = new FormData();
    formData.set("breed", "Labradoodle");

    const parsed = parsePetForm(formData, { partial: true });

    expect(parsed.ok).toBe(true);
    expect(parsed.ok && parsed.value).toEqual({ breed: "Labradoodle" });
  });

  it("rejects a partial update that submits nothing", () => {
    const parsed = parsePetForm(new FormData(), { partial: true });

    expect(parsed.ok).toBe(false);
  });

  it("reports every invalid field at once so the form can show them together", () => {
    const parsed = parsePetForm(
      formDataOf({ ...completeForm, name: "", breed: "", ageYears: "99" }),
    );

    expect(parsed.ok).toBe(false);
    expect(parsed.ok === false && Object.keys(parsed.fieldErrors).sort()).toEqual(
      ["ageYears", "breed", "name"],
    );
  });
});
