import { z } from "zod";

import type { FieldErrors, ParseResult } from "../form-result";
import { readTextField } from "../form-result";

/**
 * Parses the sign-in and sign-up forms.
 *
 * Supabase enforces its own password policy; the minimum here only stops an
 * obviously-too-short password from making a network round trip, and the wording
 * matches what the sign-up form promises.
 */

const emailSchema = z
  .string()
  .min(1, "Enter your email address.")
  .refine(
    (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    "Enter an email address, like you@example.com.",
  );

const passwordSchema = z
  .string()
  .min(1, "Enter your password.")
  .min(8, "Use at least 8 characters.");

const displayNameSchema = z
  .string()
  .min(1, "Tell us what to call you.")
  .max(100, "Use 100 characters or fewer.");

const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const signUpSchema = credentialsSchema.extend({
  displayName: displayNameSchema,
});

export interface Credentials {
  readonly email: string;
  readonly password: string;
}

export interface SignUpCredentials extends Credentials {
  readonly displayName: string;
}

const toFieldErrors = (error: z.ZodError): FieldErrors => {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const name = issue.path[0];

    if (typeof name === "string" && fieldErrors[name] === undefined) {
      fieldErrors[name] = issue.message;
    }
  }

  return fieldErrors;
};

/**
 * Parses submitted sign-in credentials.
 *
 * @param formData - The submitted sign-in form.
 * @returns The credentials, or per-field messages keyed by input name.
 */
export const parseCredentials = (
  formData: FormData,
): ParseResult<Credentials> => {
  const parsed = credentialsSchema.safeParse({
    email: readTextField(formData, "email"),
    password: readTextField(formData, "password"),
  });

  return parsed.success
    ? { ok: true, value: parsed.data }
    : { ok: false, fieldErrors: toFieldErrors(parsed.error) };
};

/**
 * Parses submitted sign-up credentials, including the customer's display name.
 *
 * @param formData - The submitted sign-up form.
 * @returns The credentials, or per-field messages keyed by input name.
 */
export const parseSignUpCredentials = (
  formData: FormData,
): ParseResult<SignUpCredentials> => {
  const parsed = signUpSchema.safeParse({
    displayName: readTextField(formData, "displayName"),
    email: readTextField(formData, "email"),
    password: readTextField(formData, "password"),
  });

  return parsed.success
    ? { ok: true, value: parsed.data }
    : { ok: false, fieldErrors: toFieldErrors(parsed.error) };
};
