import { describe, expect, it } from "vitest";

import { parseCredentials, parseSignUpCredentials } from "./credentials";

const formDataOf = (entries: Record<string, string>): FormData => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
};

describe("parseCredentials", () => {
  it("parses an email and password from submitted form data", () => {
    const parsed = parseCredentials(
      formDataOf({ email: " customer@example.com ", password: "grooming123" }),
    );

    expect(parsed).toEqual({
      ok: true,
      value: { email: "customer@example.com", password: "grooming123" },
    });
  });

  it("rejects an email without an at sign", () => {
    const parsed = parseCredentials(
      formDataOf({ email: "customer.example.com", password: "grooming123" }),
    );

    expect(parsed.ok).toBe(false);
    expect(parsed.ok === false && parsed.fieldErrors.email).toBe(
      "Enter an email address, like you@example.com.",
    );
  });

  it("rejects a password shorter than eight characters", () => {
    const parsed = parseCredentials(
      formDataOf({ email: "customer@example.com", password: "short" }),
    );

    expect(parsed.ok).toBe(false);
    expect(parsed.ok === false && parsed.fieldErrors.password).toBe(
      "Use at least 8 characters.",
    );
  });

  it("returns field errors keyed by the input name", () => {
    const parsed = parseCredentials(formDataOf({ email: "", password: "" }));

    expect(parsed.ok).toBe(false);
    expect(parsed.ok === false && Object.keys(parsed.fieldErrors).sort()).toEqual([
      "email",
      "password",
    ]);
  });

  it("treats a missing field as blank rather than throwing", () => {
    const parsed = parseCredentials(new FormData());

    expect(parsed.ok).toBe(false);
  });
});

describe("parseSignUpCredentials", () => {
  it("parses a display name alongside the credentials", () => {
    const parsed = parseSignUpCredentials(
      formDataOf({
        displayName: " Danilo ",
        email: "customer@example.com",
        password: "grooming123",
      }),
    );

    expect(parsed).toEqual({
      ok: true,
      value: {
        displayName: "Danilo",
        email: "customer@example.com",
        password: "grooming123",
      },
    });
  });

  it("rejects a blank display name", () => {
    const parsed = parseSignUpCredentials(
      formDataOf({
        displayName: "  ",
        email: "customer@example.com",
        password: "grooming123",
      }),
    );

    expect(parsed.ok).toBe(false);
    expect(parsed.ok === false && parsed.fieldErrors.displayName).toBe(
      "Tell us what to call you.",
    );
  });
});
