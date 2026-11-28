import { parseApiError, resolveLocalizedError } from "@/shared/utils/apiError"

/**
 * Machine-readable error codes returned by co-host APIs
 * (cath ErrorCodes.CoHost + instructor ErrorCode.CoHost*).
 * API returns a code, the client maps code -> localized message
 * (`t.rooms.coHost.errors`).
 */
export const COHOST_ERROR_CODES = {
  PERMISSION_REQUIRED: "COHOST_PERMISSION_REQUIRED",
  PERMISSION_INVALID: "COHOST_PERMISSION_INVALID",
  ROOM_TYPE_UNSUPPORTED: "COHOST_ROOM_TYPE_UNSUPPORTED",
  NOT_HOST: "COHOST_NOT_HOST",
  CANNOT_ASSIGN_OWNER: "COHOST_CANNOT_ASSIGN_OWNER",
  TARGET_NOT_ONLINE: "COHOST_TARGET_NOT_ONLINE",
  TARGET_BANNED: "COHOST_TARGET_BANNED",
  TARGET_NOT_CONFIRMED: "COHOST_TARGET_NOT_CONFIRMED",
  NO_ASSIGNMENT: "COHOST_NO_ASSIGNMENT",
  FORBIDDEN: "COHOST_FORBIDDEN",
  ROOM_NOT_CREATED: "ROOM_NOT_CREATED",
}

/**
 * Map backend errorCode -> localized message. Every code is translated in all
 * four locales under `rooms.coHost.errors`; the caller-provided fallback is
 * used for unknown codes.
 * @param {object} err RTK Query error
 * @param {object} t language object (useLanguage().t)
 * @param {string} fallback message when no code matches
 * @param {string} roomType "room" | "class" — room uses member/room copy
 */
export function resolveCoHostErrorMessage(err, t, fallback, roomType) {
  const messages = t?.rooms?.coHost?.errors || {}
  const { errorCode } = parseApiError(err)
  // Room (Custom): prefer the *_ROOM key, then the shared code.
  if (roomType && roomType !== "class" && errorCode) {
    const roomKey = `${errorCode}_ROOM`
    if (messages[roomKey]) return messages[roomKey]
  }
  return resolveLocalizedError(
    err,
    (e, code) => messages[code] || fallback,
    fallback,
  )
}

/**
 * Get the raw errorCode from an API error (for logic comparisons).
 */
export function getCoHostErrorCode(err) {
  return parseApiError(err).errorCode
}
