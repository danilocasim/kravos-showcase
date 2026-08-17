/**
 * Customer-facing wording for the booking domain's error codes.
 *
 * The design system's voice rule for errors is: say what happened, what we kept,
 * and what to do next, and carry the machine code separately so it can be shown
 * in small mono type underneath rather than as the headline. Sentence case, no
 * exclamation marks, no emoji.
 *
 * This module only chooses words. Every rule that produces these codes lives in
 * `lib/booking`, and the server is what enforces it.
 */

/** The salon's phone number, used wherever a customer must call instead of self-serve. */
export const salonPhoneNumber = "(718) 555-0148";

/** One error rendered as an Alert: a heading, a body, and the raw code. */
export interface ErrorPresentation {
  readonly title: string;
  readonly body: string;
  readonly code: string;
}

const messages: Readonly<Record<string, { title: string; body: string }>> = {
  // Availability and appointment lifecycle
  SLOT_UNAVAILABLE: {
    title: "That time was just booked",
    body: "We kept your pet and services. Pick another time to finish booking.",
  },
  APPOINTMENT_NOT_CHANGEABLE: {
    title: "This visit can no longer be changed online",
    body: `Call the salon on ${salonPhoneNumber} and we will sort it out.`,
  },
  CANCELLATION_CUTOFF_PASSED: {
    title: "This visit is inside the 24-hour window",
    body: `Changes are free until 24 hours before. After that, call the salon on ${salonPhoneNumber}.`,
  },
  APPOINTMENT_NOT_FOUND: {
    title: "We could not find that visit",
    body: "It may already have been cancelled. Check My appointments for the current list.",
  },

  // Service selection
  NO_SERVICES_SELECTED: {
    title: "Pick a service first",
    body: "Choose one main service, then any add-ons that go with it.",
  },
  EXACTLY_ONE_BASE_SERVICE_REQUIRED: {
    title: "Choose one main service",
    body: "A visit has a single main service. Nail Trim can be booked on its own as an express visit.",
  },
  INVALID_STANDALONE_EXPRESS_SERVICE: {
    title: "That service needs a main service",
    body: "Only Nail Trim can be booked on its own. Add a main service to continue.",
  },
  INCOMPATIBLE_ADD_ON: {
    title: "Those services do not go together",
    body: "We kept your main service. Choose add-ons that are available with it.",
  },
  DUPLICATE_SERVICE_SELECTION: {
    title: "That service is already selected",
    body: "Each service can be added once. Review your selection and try again.",
  },
  UNKNOWN_OR_INACTIVE_SERVICE: {
    title: "That service is no longer offered",
    body: "Our catalogue has changed. Pick a service from the current list.",
  },

  // Pets
  PET_NOT_FOUND: {
    title: "We could not find that pet",
    body: "They may already have been removed. Check My pets for the current list.",
  },
  PET_IN_USE: {
    title: "This pet has appointment history",
    body: "We keep pets that have been booked so your visit records stay complete. You can cancel any upcoming visits and edit their details instead.",
  },
  INVALID_PET_INPUT: {
    title: "Check the pet details",
    body: "Some of what you entered did not look right. The highlighted fields explain what to change.",
  },

  // Session and authorization
  AUTHENTICATION_REQUIRED: {
    title: "Your session has ended",
    body: "Sign in again to pick up where you left off.",
  },
  ADMIN_REQUIRED: {
    title: "That is a salon-only action",
    body: `Call the salon on ${salonPhoneNumber} if you need it changed.`,
  },
  EMAIL_OR_PASSWORD_INCORRECT: {
    title: "That email and password do not match",
    body: "Check them and try again.",
  },
  EMAIL_ALREADY_REGISTERED: {
    title: "That email already has an account",
    body: "Sign in instead, or use a different email address.",
  },
  PASSWORD_TOO_WEAK: {
    title: "Choose a stronger password",
    body: "Use at least 8 characters, and avoid something easy to guess.",
  },
  EMAIL_CONFIRMATION_REQUIRED: {
    title: "Confirm your email to continue",
    body: "We sent you a link. Open it and you will be signed in.",
  },
  CONFIRMATION_LINK_INVALID: {
    title: "That confirmation link has expired",
    body: "Sign in again and we will send you a new one.",
  },
  TOO_MANY_ATTEMPTS: {
    title: "Too many attempts",
    body: "Wait a minute, then try again.",
  },
  SIGN_IN_FAILED: {
    title: "We could not sign you in",
    body: `Try again, and call the salon on ${salonPhoneNumber} if it keeps happening.`,
  },
  SIGN_UP_FAILED: {
    title: "We could not create your account",
    body: `Try again, and call the salon on ${salonPhoneNumber} if it keeps happening.`,
  },

  // Retries
  IDEMPOTENCY_KEY_EXPIRED: {
    title: "That took a while",
    body: "Start again so we can check the time is still free before booking it.",
  },
  IDEMPOTENCY_KEY_REUSED: {
    title: "That request changed while we were saving it",
    body: "Nothing was booked twice. Review your choices and confirm again.",
  },
  IDEMPOTENCY_RECORD_INCOMPLETE: {
    title: "We could not confirm whether that saved",
    body: "Check My appointments before trying again, so you do not book twice.",
  },

  // Input
  VALIDATION_ERROR: {
    title: "Check the highlighted fields",
    body: "Some of what you entered did not look right.",
  },
  INVALID_AVAILABILITY_SEARCH: {
    title: "Check the dates",
    body: "Choose a start and end date within the next month, with the start first.",
  },
  INVALID_APPOINTMENT_INPUT: {
    title: "Check your selection",
    body: "Something about that booking did not look right. Review your choices and try again.",
  },
};

const genericMessage = {
  title: "Something went wrong",
  body:
    "Nothing was changed. Try again, and call the salon on " +
    `${salonPhoneNumber} if it keeps happening.`,
};

/**
 * Chooses the customer-facing wording for a domain or authentication error code.
 *
 * @param code - A machine code from `lib/booking`, `lib/auth`, or this module.
 * @returns A title, a body, and the code to render in mono underneath.
 */
export const presentErrorCode = (code: string): ErrorPresentation => ({
  ...(messages[code] ?? genericMessage),
  code,
});
