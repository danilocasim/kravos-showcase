"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { ActionResult } from "../action-result";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { parseCredentials, parseSignUpCredentials } from "../../lib/ui/auth/credentials";
import {
  classifySignInError,
  classifySignUpOutcome,
} from "../../lib/ui/auth/supabase-auth-errors";
import { presentErrorCode } from "../../lib/ui/error-messages";
import { safeInternalNextPath } from "../../lib/ui/auth/next-path";

const errorResult = (
  code: string,
  fieldErrors?: Readonly<Record<string, string>>,
): ActionResult => {
  const presentation = presentErrorCode(code);

  return {
    status: "error",
    code,
    message: `${presentation.title}. ${presentation.body}`,
    ...(fieldErrors === undefined ? {} : { fieldErrors }),
  };
};

export async function signInAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseCredentials(formData);
  if (!parsed.ok) return errorResult("VALIDATION_ERROR", parsed.fieldErrors);
  const rawNext = formData.get("next");
  const next = safeInternalNextPath(typeof rawNext === "string" ? rawNext : null);

  let code: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.value);

    if (error !== null || data.user === null || data.session === null) {
      code = classifySignInError(error);
    }
  } catch {
    code = "SIGN_IN_FAILED";
  }

  if (code !== null) return errorResult(code);

  redirect(next);
}

export async function signUpAction(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseSignUpCredentials(formData);
  if (!parsed.ok) return errorResult("VALIDATION_ERROR", parsed.fieldErrors);

  let outcomeCode: string;
  try {
    const supabase = await createSupabaseServerClient();
    const requestHeaders = await headers();
    const origin = requestHeaders.get("origin");
    const emailRedirectTo =
      origin === null
        ? undefined
        : new URL("/auth/confirm?next=/appointments", origin).toString();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.value.email,
      password: parsed.value.password,
      options: {
        data: { display_name: parsed.value.displayName },
        ...(emailRedirectTo === undefined ? {} : { emailRedirectTo }),
      },
    });

    outcomeCode = classifySignUpOutcome({ error, session: data.session });
  } catch {
    outcomeCode = "SIGN_UP_FAILED";
  }

  if (outcomeCode === "SIGNED_IN") redirect("/appointments");
  if (outcomeCode === "EMAIL_CONFIRMATION_REQUIRED") {
    const presentation = presentErrorCode(outcomeCode);
    return {
      status: "pending",
      code: outcomeCode,
      message: `${presentation.title}. ${presentation.body}`,
    };
  }

  return errorResult(outcomeCode);
}
