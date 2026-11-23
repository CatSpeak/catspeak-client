import { buildDesktopDeepLink, getProtocolScheme } from "./desktopBridge.js"

export const HANDOFF_LANGUAGES = ["vi", "en", "ja", "zh"]

export const HANDOFF_ROOM_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/

export const HANDOFF_ERROR_KINDS = {
  invalid: "invalid",
  expired: "expired",
  used: "used",
  rateLimited: "rateLimited",
  network: "network",
  server: "server",
  unknown: "unknown",
}

const ERROR_META = {
  [HANDOFF_ERROR_KINDS.invalid]: {
    titleKey: "invalidTitle",
    messageKey: "invalidMessage",
  },
  [HANDOFF_ERROR_KINDS.expired]: {
    titleKey: "expiredTitle",
    messageKey: "expiredMessage",
  },
  [HANDOFF_ERROR_KINDS.used]: {
    titleKey: "usedTitle",
    messageKey: "usedMessage",
  },
  [HANDOFF_ERROR_KINDS.rateLimited]: {
    titleKey: "rateLimitedTitle",
    messageKey: "rateLimitedMessage",
  },
  [HANDOFF_ERROR_KINDS.network]: {
    titleKey: "networkTitle",
    messageKey: "networkMessage",
  },
  [HANDOFF_ERROR_KINDS.server]: {
    titleKey: "serverTitle",
    messageKey: "serverMessage",
  },
  [HANDOFF_ERROR_KINDS.unknown]: {
    titleKey: "unknownTitle",
    messageKey: "unknownMessage",
  },
}

const RETRYABLE_ERROR_KINDS = new Set([
  HANDOFF_ERROR_KINDS.rateLimited,
  HANDOFF_ERROR_KINDS.network,
  HANDOFF_ERROR_KINDS.server,
  HANDOFF_ERROR_KINDS.unknown,
])

const SERVER_ERROR_CODES = {
  AUTH_DESKTOP_LAUNCH_CODE_INVALID: HANDOFF_ERROR_KINDS.invalid,
  AUTH_DESKTOP_LAUNCH_CODE_EXPIRED: HANDOFF_ERROR_KINDS.expired,
  AUTH_DESKTOP_LAUNCH_CODE_ALREADY_USED: HANDOFF_ERROR_KINDS.used,
  AUTH_DESKTOP_LAUNCH_CODE_RATE_LIMITED: HANDOFF_ERROR_KINDS.rateLimited,
}

/**
 * Deep link for the desktop handoff. The scheme comes from the API release
 * payload so a staging web build always targets the staging app.
 */
export function buildHandoffDeepLink({ release, roomId, lang, code } = {}) {
  return buildDesktopDeepLink({
    scheme: getProtocolScheme(release),
    roomId,
    lang,
    code,
  })
}

/**
 * Parses `/desktop/handoff?code=...&roomId=...&lang=...`. The page validates
 * before calling the API so a broken link never burns a rate-limit slot.
 */
export function parseHandoffSearch(search) {
  const raw = String(search || "")
  const params = new URLSearchParams(raw.startsWith("?") ? raw.slice(1) : raw)

  const code = (params.get("code") || "").trim()
  const roomId = (params.get("roomId") || "").trim()
  const rawLang = (params.get("lang") || "").trim().toLowerCase()
  const lang = HANDOFF_LANGUAGES.includes(rawLang) ? rawLang : "vi"

  if (!code) return { code, roomId, lang, valid: false, error: "missingCode" }
  if (!roomId) return { code, roomId, lang, valid: false, error: "missingRoomId" }
  if (!HANDOFF_ROOM_ID_PATTERN.test(roomId))
    return { code, roomId, lang, valid: false, error: "invalidRoomId" }

  return { code, roomId, lang, valid: true, error: null }
}

export function classifyHandoffError(error) {
  const status = error?.status
  if (status === "FETCH_ERROR" || status === "TIMEOUT_ERROR")
    return HANDOFF_ERROR_KINDS.network

  const errorCode = error?.data?.errorCode || error?.data?.code
  if (SERVER_ERROR_CODES[errorCode]) return SERVER_ERROR_CODES[errorCode]

  if (status === 429) return HANDOFF_ERROR_KINDS.rateLimited
  if (status === 409) return HANDOFF_ERROR_KINDS.used
  if (typeof status === "number" && status >= 500)
    return HANDOFF_ERROR_KINDS.server

  return HANDOFF_ERROR_KINDS.unknown
}

export function getHandoffErrorMeta(kind) {
  return ERROR_META[kind] || ERROR_META[HANDOFF_ERROR_KINDS.unknown]
}

export function isRetryableHandoffError(kind) {
  return RETRYABLE_ERROR_KINDS.has(kind)
}

const inFlightExchanges = new Map()

/**
 * Single-flight guard for the one-time code: React StrictMode mounts the page
 * twice in development, but the same code must only reach the API once.
 */
export function runHandoffExchangeOnce(code, factory) {
  const key = String(code || "")
  if (!key) return Promise.resolve(undefined)

  const existing = inFlightExchanges.get(key)
  if (existing) return existing

  let promise
  try {
    promise = Promise.resolve(factory())
  } catch (error) {
    promise = Promise.reject(error)
  }
  inFlightExchanges.set(key, promise)
  const cleanup = () => {
    if (inFlightExchanges.get(key) === promise) inFlightExchanges.delete(key)
  }
  promise.then(cleanup, cleanup)
  return promise
}
