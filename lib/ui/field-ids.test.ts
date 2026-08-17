import { describe, expect, it } from "vitest";

import { fieldIds } from "./field-ids";

describe("fieldIds", () => {
  it("describes the control with the hint id when only a hint is present", () => {
    const ids = fieldIds("pet-notes", { hasHint: true });

    expect(ids).toEqual({
      controlId: "pet-notes",
      hintId: "pet-notes-hint",
      errorId: undefined,
      describedBy: "pet-notes-hint",
      invalid: false,
    });
  });

  it("describes the control with the error id and marks the control invalid", () => {
    const ids = fieldIds("pet-name", { hasError: true });

    expect(ids.errorId).toBe("pet-name-error");
    expect(ids.describedBy).toBe("pet-name-error");
    expect(ids.invalid).toBe(true);
  });

  it("describes the control with both ids when a hint and an error are present", () => {
    const ids = fieldIds("pet-age", { hasHint: true, hasError: true });

    expect(ids.describedBy).toBe("pet-age-error pet-age-hint");
    expect(ids.invalid).toBe(true);
  });

  it("returns no description when there is neither hint nor error", () => {
    const ids = fieldIds("email", {});

    expect(ids.describedBy).toBeUndefined();
    expect(ids.hintId).toBeUndefined();
    expect(ids.errorId).toBeUndefined();
    expect(ids.invalid).toBe(false);
  });
});
