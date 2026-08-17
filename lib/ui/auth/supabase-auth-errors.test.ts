import { describe, expect, it } from "vitest";

import {
  classifySignInError,
  classifySignUpOutcome,
} from "./supabase-auth-errors";

describe("classifySignInError", () => {
  it("maps invalid_credentials to EMAIL_OR_PASSWORD_INCORRECT", () => {
    expect(classifySignInError({ code: "invalid_credentials" })).toBe(
      "EMAIL_OR_PASSWORD_INCORRECT",
    );
  });

  it("maps email_not_confirmed to EMAIL_CONFIRMATION_REQUIRED", () => {
    expect(classifySignInError({ code: "email_not_confirmed" })).toBe(
      "EMAIL_CONFIRMATION_REQUIRED",
    );
  });

  it("maps over_request_rate_limit to TOO_MANY_ATTEMPTS", () => {
    expect(classifySignInError({ code: "over_request_rate_limit" })).toBe(
      "TOO_MANY_ATTEMPTS",
    );
  });

  it("maps an unrecognised error to SIGN_IN_FAILED without leaking the provider message", () => {
    expect(
      classifySignInError({
        code: "some_internal_code",
        message: "pg: relation auth.users does not exist",
      }),
    ).toBe("SIGN_IN_FAILED");
  });

  it("maps a null error to SIGN_IN_FAILED so callers cannot treat it as success", () => {
    expect(classifySignInError(null)).toBe("SIGN_IN_FAILED");
  });
});

describe("classifySignUpOutcome", () => {
  it("maps user_already_exists to EMAIL_ALREADY_REGISTERED", () => {
    expect(
      classifySignUpOutcome({
        error: { code: "user_already_exists" },
        session: null,
      }),
    ).toBe("EMAIL_ALREADY_REGISTERED");
  });

  it("maps weak_password to PASSWORD_TOO_WEAK", () => {
    expect(
      classifySignUpOutcome({ error: { code: "weak_password" }, session: null }),
    ).toBe("PASSWORD_TOO_WEAK");
  });

  it("treats a sign-up result without a session as EMAIL_CONFIRMATION_REQUIRED", () => {
    expect(classifySignUpOutcome({ error: null, session: null })).toBe(
      "EMAIL_CONFIRMATION_REQUIRED",
    );
  });

  it("reports a signed-in result when the provider returned a session", () => {
    expect(
      classifySignUpOutcome({ error: null, session: { access_token: "t" } }),
    ).toBe("SIGNED_IN");
  });

  it("maps an unrecognised error to SIGN_UP_FAILED without leaking the provider message", () => {
    expect(
      classifySignUpOutcome({
        error: { code: "unexpected_failure", message: "smtp host unreachable" },
        session: null,
      }),
    ).toBe("SIGN_UP_FAILED");
  });
});
