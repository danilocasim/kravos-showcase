/**
 * Translates Supabase Auth outcomes into this application's own error codes.
 *
 * Provider messages are never surfaced: they change without notice and can leak
 * infrastructure detail. Only a recognised code becomes a specific message; every
 * other outcome collapses to a generic failure, which fails closed.
 */

/** The subset of a Supabase auth error this module inspects. */
export interface SupabaseAuthErrorLike {
  readonly code?: string | undefined;
  readonly message?: string | undefined;
}

/** What Supabase returned from `signUp`, reduced to what the decision needs. */
export interface SignUpOutcome {
  readonly error: SupabaseAuthErrorLike | null;
  readonly session: unknown | null;
}

const signInCodes: Readonly<Record<string, string>> = {
  invalid_credentials: "EMAIL_OR_PASSWORD_INCORRECT",
  email_not_confirmed: "EMAIL_CONFIRMATION_REQUIRED",
  over_request_rate_limit: "TOO_MANY_ATTEMPTS",
  over_email_send_rate_limit: "TOO_MANY_ATTEMPTS",
};

const signUpCodes: Readonly<Record<string, string>> = {
  user_already_exists: "EMAIL_ALREADY_REGISTERED",
  email_exists: "EMAIL_ALREADY_REGISTERED",
  weak_password: "PASSWORD_TOO_WEAK",
  over_request_rate_limit: "TOO_MANY_ATTEMPTS",
  over_email_send_rate_limit: "TOO_MANY_ATTEMPTS",
};

/**
 * Classifies a failed sign-in.
 *
 * @param error - The error Supabase returned, if any.
 * @returns An application error code; `SIGN_IN_FAILED` when unrecognised.
 */
export const classifySignInError = (
  error: SupabaseAuthErrorLike | null,
): string => {
  const code = error?.code;

  return (code === undefined ? undefined : signInCodes[code]) ?? "SIGN_IN_FAILED";
};

/**
 * Classifies the result of a sign-up attempt.
 *
 * A successful call with no session means the project requires email
 * confirmation, which is the hosted default but is switched off locally. Callers
 * must branch on this rather than assuming the customer is signed in.
 *
 * @param outcome - The error and session Supabase returned.
 * @returns `SIGNED_IN`, `EMAIL_CONFIRMATION_REQUIRED`, or an error code.
 */
export const classifySignUpOutcome = ({
  error,
  session,
}: SignUpOutcome): string => {
  if (error !== null) {
    const code = error.code;

    return (
      (code === undefined ? undefined : signUpCodes[code]) ?? "SIGN_UP_FAILED"
    );
  }

  return session === null ? "EMAIL_CONFIRMATION_REQUIRED" : "SIGNED_IN";
};
