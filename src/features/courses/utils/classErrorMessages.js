import { parseApiError } from "@/shared/utils/apiError"

/**
 * Central code -> localized-message table for the create/update class flow.
 * The backend (catspeak-api-instructor via cath-api checkout) returns a
 * machine-readable `errorCode`; the client must map it instead of parsing
 * the human-readable English message or echoing `errMsg` raw.
 *
 * Returns a localized string. Never returns the raw server message, so an
 * unknown code falls back to the generic localized create/update failure.
 */
const START_DATE_MISMATCH_RE =
  /Class start date \((.*?)\) does not match the first scheduled session date \((.*?)\)/i

export function resolveClassErrorMessage(error, { cc = {}, isEditMode = false } = {}) {
  const { errorCode, message: errMsg, res } = parseApiError(error)
  const code = typeof errorCode === "string" && errorCode.trim() ? errorCode.trim() : ""
  const msg = typeof errMsg === "string" ? errMsg : ""
  const failDefault = isEditMode
    ? cc.toastUpdateFail || "Failed to update class!"
    : cc.toastCreateFail || "Failed to create class!"

  // Start-date mismatch carries the two dates inside the message template.
  // Match it (by code first, by template as fallback for old backends).
  if (
    code === "INVALID_DATE_RANGE" ||
    msg.includes("does not match the first scheduled session date")
  ) {
    const m = msg.match(START_DATE_MISMATCH_RE)
    if (m && cc.toastStartDateMismatchFirstSession) {
      return cc.toastStartDateMismatchFirstSession
        .replace("{{startDate}}", m[1])
        .replace("{{firstSessionDate}}", m[2])
    }
    if (code === "INVALID_DATE_RANGE" || m) {
      return cc.toastStartDateMismatchFirstSessionDefault || cc.toastInvalidDates || failDefault
    }
  }

  switch (code) {
    case "LANGUAGE_NOT_ALLOWED":
    case "LANGUAGE_MISMATCH":
      return cc.languageNotAllowed || failDefault
    case "LEVEL_NOT_ALLOWED":
      return cc.levelNotAllowed || failDefault
    case "SESSION_CONFLICT":
    case "SCHEDULE_CONFLICT": {
      const names = res?.conflictingClassNames || res?.conflicting_class_names
      if (Array.isArray(names) && names.length > 0 && cc.toastScheduleConflict) {
        return cc.toastScheduleConflict
          .replace("{{class}}", names.join(", "))
          .replace("{{start}}", "")
          .replace("{{end}}", "")
      }
      return cc.toastScheduleConflictDefault || failDefault
    }
    case "SCHEDULE_LOCKED":
      return cc.scheduleLocked || failDefault
    case "LEVELS_LOCKED":
      return cc.levelsLocked || failDefault
    case "INVALID_DATE_RANGE":
      // Admission/start ordering errors (no embedded dates to interpolate).
      if (/enrollment end/i.test(msg)) return cc.toastAdmissionEndLater || failDefault
      if (/enrollment start/i.test(msg)) return cc.toastAdmissionStartPast || failDefault
      if (/start date/i.test(msg)) return cc.toastStartPast || failDefault
      return cc.toastInvalidDates || failDefault
    case "INVALID_CAPACITY":
      return cc.toastEnterCapacity || failDefault
    case "INVALID_TOTAL_SESSIONS":
      return cc.toastEnterSessions || failDefault
    case "INVALID_TUITION_FEE":
    case "PRICE_LOCKED":
      return cc.minTuitionFeeNote
        ? cc.minTuitionFeeNote.replace("{{minFee}}", "")
        : cc.priceLocked || failDefault
    case "TEACHER_PROFILE_NOT_APPROVED":
    case "TEACHER_PROFILE_REQUIRED":
      return cc.toastVerifyProfile || failDefault
    case "VALIDATION_ERROR":
    case "COMMON_BAD_REQUEST":
    case "COMMON_VALIDATION_FAILED":
      return cc.toastInvalidDates || failDefault
    case "PAYMENT_TRANSACTION_FAILED":
    case "PAYMENT_LINK_FAILED":
    case "PAYOS_ERROR":
    case "COMMON_EXTERNAL_SERVICE_ERROR":
    case "COMMON_INTERNAL_SERVER_ERROR":
    case "":
      return failDefault
    default:
      return failDefault
  }
}
