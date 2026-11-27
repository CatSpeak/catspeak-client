/**
 * CS-10: `registrationCorrectionToken` issued by the Core API when an account
 * is registered (or when login detects an unactivated account) must live ONLY
 * in JavaScript memory for the lifetime of the tab.
 *
 * Never persist this token in `localStorage` / `sessionStorage`: it authorises
 * changing the email of a not-yet-activated account and is short lived
 * (15–30 minutes) on the server side.
 */

let registrationCorrectionToken = null

export function getRegistrationCorrectionToken() {
  return registrationCorrectionToken
}

export function setRegistrationCorrectionToken(token) {
  registrationCorrectionToken =
    typeof token === "string" && token.trim() ? token.trim() : null
  return registrationCorrectionToken
}

export function clearRegistrationCorrectionToken() {
  registrationCorrectionToken = null
}
