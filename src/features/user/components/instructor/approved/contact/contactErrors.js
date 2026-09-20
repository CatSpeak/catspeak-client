import { parseApiError } from "@/shared/utils/apiError"

/**
 * Maps a contact-change API error to the UI slot it belongs to.
 * `target` is "otp" (render under the code input) or "value" (render under the
 * new email/phone field — e.g. the inherited one-phone-per-30-days rule).
 */
export const resolveContactError = (err, ins, { field, fallback }) => {
  const { errorCode, message } = parseApiError(err)
  const isPhone = field === "phone"

  const withCode = (result) => ({ ...result, errorCode })

  switch (errorCode) {
    case "ACCOUNT_EMAIL_EXISTS":
      return withCode({
        target: "value",
        message: ins.contactEmailExists || message,
      })
    case "ACCOUNT_PHONE_EXISTS":
      return withCode({
        target: "value",
        message: ins.contactPhoneExists || message,
      })
    case "ACCOUNT_INVALID_PHONE_NUMBER":
      return withCode({
        target: "value",
        message: ins.contactPhoneInvalid || message,
      })
    case "ACCOUNT_RATE_LIMIT_EXCEEDED":
      return withCode({
        target: "value",
        message:
          (isPhone ? ins.contactPhoneRateLimit : ins.contactRequestError) ||
          message,
      })
    case "ACCOUNT_OTP_REQUIRED":
      return withCode({
        target: "otp",
        message: ins.contactOtpRequired || message,
      })
    case "ACCOUNT_INVALID_OTP":
      return withCode({
        target: "otp",
        message: ins.contactOtpInvalid || message,
      })
    case "ACCOUNT_OTP_TOO_MANY_ATTEMPTS":
      return withCode({
        target: "otp",
        message: ins.contactOtpAttemptsExceeded || message,
      })
    default:
      return withCode({ target: "value", message: message || fallback })
  }
}
