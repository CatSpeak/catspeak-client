/**
 * CS-10: build the `resend-email-otp` payload for changing the email of a
 * not-yet-activated account.
 *
 * - Password confirmation ALWAYS wins when the user is in the password
 *   fallback state: a stale/expired correction token must never be resent in a
 *   loop.
 * - Otherwise send the in-memory correction token.
 */
export function buildEmailCorrectionPayload({
  email,
  newEmail,
  correctionToken,
  requiresPassword,
  password,
}) {
  const payload = { email, newEmail }
  if (requiresPassword && password) {
    payload.password = password
    return payload
  }
  if (correctionToken) {
    payload.registrationCorrectionToken = correctionToken
    return payload
  }
  if (password) payload.password = password
  return payload
}
