import type { ZodError } from "zod";

import {
  createPetSchema,
  updatePetSchema,
} from "../booking/pet-schema";
import type { FieldErrors, ParseResult } from "./form-result";
import { readTextField } from "./form-result";

/**
 * Maps the pet form onto the booking domain's pet schema.
 *
 * This module states no validation rule of its own. It converts `FormData` into
 * the shape `lib/booking/pet-schema.ts` expects, then converts that schema's
 * issues into per-input messages. The single definition of what a valid pet is
 * stays in the domain, which is also what the server enforces.
 */

const optionalFieldNames = [
  "temperament",
  "coatCondition",
  "allergies",
  "notes",
] as const;

const fieldMessages: Readonly<Record<string, string>> = {
  name: "Enter your pet's name.",
  breed: "Enter a breed. Put “Mixed” if you are not sure.",
  size: "Choose a size.",
  ageYears: "Enter a whole number of years, from 0 to 30.",
  temperament: "Use 500 characters or fewer.",
  coatCondition: "Use 500 characters or fewer.",
  allergies: "Use 2000 characters or fewer.",
  notes: "Use 2000 characters or fewer.",
};

const toFieldErrors = (error: ZodError): FieldErrors => {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const name = issue.path[0];

    if (typeof name === "string" && fieldErrors[name] === undefined) {
      fieldErrors[name] = fieldMessages[name] ?? issue.message;
    }
  }

  return fieldErrors;
};

/**
 * Reads the age field, keeping a non-numeric entry as an invalid value.
 *
 * Returning the raw string rather than NaN lets the domain schema reject it and
 * report the issue against `ageYears`, which keeps the message on the right input.
 */
const readAgeField = (formData: FormData): unknown => {
  const raw = readTextField(formData, "ageYears");

  if (raw === "") {
    return raw;
  }

  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : raw;
};

export interface ParsePetFormOptions {
  /** Parse only the fields present, for editing an existing pet. */
  readonly partial?: boolean;
}

/**
 * Parses the add-a-pet and edit-a-pet forms.
 *
 * @param formData - The submitted form.
 * @param options - Set `partial` when editing, so absent fields are left alone.
 * @returns The pet input, or per-field messages keyed by input name.
 */
export const parsePetForm = (
  formData: FormData,
  { partial = false }: ParsePetFormOptions = {},
): ParseResult<Record<string, unknown>> => {
  const candidate: Record<string, unknown> = {};

  for (const name of ["name", "breed", "size"] as const) {
    if (!partial || formData.has(name)) {
      candidate[name] = readTextField(formData, name);
    }
  }

  if (!partial || formData.has("ageYears")) {
    candidate.ageYears = readAgeField(formData);
  }

  for (const name of optionalFieldNames) {
    if (!partial || formData.has(name)) {
      candidate[name] = readTextField(formData, name);
    }
  }

  const parsed = partial
    ? updatePetSchema.safeParse(candidate)
    : createPetSchema.safeParse(candidate);

  return parsed.success
    ? { ok: true, value: parsed.data as Record<string, unknown> }
    : { ok: false, fieldErrors: toFieldErrors(parsed.error) };
};
