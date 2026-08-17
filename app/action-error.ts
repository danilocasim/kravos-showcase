import type { ActionResult } from "./action-result";
import { presentErrorCode } from "../lib/ui/error-messages";

const customerSafeCodes = new Set([
  "AUTHENTICATION_REQUIRED",
  "ADMIN_REQUIRED",
  "NO_SERVICES_SELECTED",
  "DUPLICATE_SERVICE_SELECTION",
  "UNKNOWN_OR_INACTIVE_SERVICE",
  "EXACTLY_ONE_BASE_SERVICE_REQUIRED",
  "INVALID_STANDALONE_EXPRESS_SERVICE",
  "INCOMPATIBLE_ADD_ON",
  "INVALID_PET_INPUT",
  "INVALID_AVAILABILITY_SEARCH",
  "PET_NOT_FOUND",
  "PET_IN_USE",
  "INVALID_APPOINTMENT_INPUT",
  "IDEMPOTENCY_KEY_REUSED",
  "IDEMPOTENCY_KEY_EXPIRED",
  "IDEMPOTENCY_RECORD_INCOMPLETE",
  "SLOT_UNAVAILABLE",
  "APPOINTMENT_NOT_FOUND",
  "CANCELLATION_CUTOFF_PASSED",
  "APPOINTMENT_NOT_CHANGEABLE",
]);

const isCustomerSafeError = (
  error: unknown,
): error is Error & { readonly code: string } => {
  if (!(error instanceof Error)) return false;

  const candidate = error as Error & { readonly code?: unknown };
  return (
    typeof candidate.code === "string" && customerSafeCodes.has(candidate.code)
  );
};

/** Maps a server/domain failure to non-sensitive copy for a Server Action. */
export const toActionError = (error: unknown): ActionResult => {
  const code = isCustomerSafeError(error) ? error.code : "INTERNAL_SERVER_ERROR";
  const presentation = presentErrorCode(code);

  return {
    status: "error",
    code,
    message: `${presentation.title}. ${presentation.body}`,
  };
};
