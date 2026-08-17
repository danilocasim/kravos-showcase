import { describe, expect, it } from "vitest";

import { presentErrorCode, salonPhoneNumber } from "./error-messages";

describe("presentErrorCode", () => {
  it("maps SLOT_UNAVAILABLE to the retained-selection recovery message", () => {
    const presented = presentErrorCode("SLOT_UNAVAILABLE");

    expect(presented.title).toBe("That time was just booked");
    expect(presented.body).toBe(
      "We kept your pet and services. Pick another time to finish booking.",
    );
    expect(presented.code).toBe("SLOT_UNAVAILABLE");
  });

  it("maps CANCELLATION_CUTOFF_PASSED to the salon-phone message", () => {
    const presented = presentErrorCode("CANCELLATION_CUTOFF_PASSED");

    expect(presented.title).toBe("This visit is inside the 24-hour window");
    expect(presented.body).toContain(salonPhoneNumber);
  });

  it("maps AUTHENTICATION_REQUIRED to a sign-in prompt", () => {
    const presented = presentErrorCode("AUTHENTICATION_REQUIRED");

    expect(presented.title).toBe("Your session has ended");
    expect(presented.body).toContain("Sign in again");
  });

  it("maps PET_IN_USE to the appointment-history explanation", () => {
    const presented = presentErrorCode("PET_IN_USE");

    expect(presented.title).toBe("This pet has appointment history");
    expect(presented.body).toContain("cancel");
  });

  it("maps IDEMPOTENCY_KEY_EXPIRED to a start-again message", () => {
    const presented = presentErrorCode("IDEMPOTENCY_KEY_EXPIRED");

    expect(presented.title).toBe("That took a while");
    expect(presented.body).toContain("Start again");
  });

  it("maps INCOMPATIBLE_ADD_ON to a change-your-services message", () => {
    const presented = presentErrorCode("INCOMPATIBLE_ADD_ON");

    expect(presented.title).toBe("Those services do not go together");
  });

  it("falls back to a generic message and keeps the machine code for an unknown code", () => {
    const presented = presentErrorCode("SOMETHING_NEW");

    expect(presented.title).toBe("Something went wrong");
    expect(presented.body).toBe(
      "Nothing was changed. Try again, and call the salon on " +
        `${salonPhoneNumber} if it keeps happening.`,
    );
    expect(presented.code).toBe("SOMETHING_NEW");
  });

  it("never renders an exclamation mark or an emoji", () => {
    const codes = [
      "SLOT_UNAVAILABLE",
      "CANCELLATION_CUTOFF_PASSED",
      "AUTHENTICATION_REQUIRED",
      "PET_IN_USE",
      "IDEMPOTENCY_KEY_EXPIRED",
      "INCOMPATIBLE_ADD_ON",
      "UNKNOWN",
    ];

    for (const code of codes) {
      const { title, body } = presentErrorCode(code);

      expect(`${title} ${body}`).not.toMatch(/[!\u{1F300}-\u{1FAFF}]/u);
    }
  });
});
