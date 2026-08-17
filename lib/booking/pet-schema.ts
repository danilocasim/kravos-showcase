import { z } from "zod";

/**
 * Validation rules for customer-owned pet records.
 *
 * These live in one dependency-free module so the booking use cases and the
 * form-parsing layer share a single definition. The UI maps submitted fields
 * onto these schemas and renders their issues; it never restates a rule.
 */

const optionalPetText = (maximumLength: number) =>
  z
    .string()
    .trim()
    .max(maximumLength)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional();

/** Per-field rules, exposed so callers can validate one field at a time. */
export const petFieldSchemas = {
  name: z.string().trim().min(1).max(80),
  breed: z.string().trim().min(1).max(100),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]),
  ageYears: z.number().int().min(0).max(30),
  temperament: optionalPetText(500),
  coatCondition: optionalPetText(500),
  allergies: optionalPetText(2_000),
  notes: optionalPetText(2_000),
};

/** A complete new pet; unknown fields are rejected. */
export const createPetSchema = z.object(petFieldSchemas).strict();

/** A partial change to an existing pet; at least one field must be present. */
export const updatePetSchema = z
  .object(petFieldSchemas)
  .partial()
  .strict()
  .refine((input) => Object.keys(input).length > 0);
