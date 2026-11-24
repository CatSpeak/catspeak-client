const DEFAULT_RATE_LIMIT_MAX_SECONDS = 60

/**
 * Parse a `Retry-After` HTTP header (integer seconds or HTTP-date) or JSON body
 * field (`retryAfterSeconds` / `retryAfter`) into a positive integer number of seconds.
 *
 * @param {object} [source]
 * @param {Headers|Record<string, string>|null} [source.headers]
 * @param {object|null} [source.data]
 * @returns {number|null}
 */
export function parseRetryAfterSeconds({ headers, data } = {}) {
  let raw = null

  if (headers) {
    if (typeof headers.get === "function") {
      raw = headers.get("retry-after") ?? headers.get("Retry-After")
    } else if (typeof headers === "object") {
      raw = headers["retry-after"] ?? headers["Retry-After"]
    }
  }

  if (raw == null && data && typeof data === "object") {
    raw = data.retryAfterSeconds ?? data.retryAfter ?? data.RetryAfterSeconds
  }

  if (raw == null) return null

  const numeric = Number(raw)
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.min(Math.ceil(numeric), DEFAULT_RATE_LIMIT_MAX_SECONDS * 10)
  }

  const parsedMs = Date.parse(String(raw))
  if (Number.isFinite(parsedMs)) {
    const diffSeconds = Math.ceil((parsedMs - Date.now()) / 1000)
    if (diffSeconds > 0) {
      return Math.min(diffSeconds, DEFAULT_RATE_LIMIT_MAX_SECONDS * 10)
    }
  }

  return null
}

/**
 * Build a user-facing rate-limit payload for HTTP 429 responses.
 *
 * @param {number|null} retryAfterSeconds
 * @param {unknown} existingData
 * @returns {object}
 */
export function buildRateLimitErrorData(retryAfterSeconds, existingData) {
  const base =
    existingData && typeof existingData === "object" && !Array.isArray(existingData)
      ? existingData
      : {}
  const fallbackMessage = retryAfterSeconds
    ? `Too many requests. Please wait ${retryAfterSeconds}s and try again.`
    : "Too many requests. Please slow down and try again shortly."

  return {
    ...base,
    code: base.code || base.errorCode || "RATE_LIMITED",
    retryAfterSeconds: retryAfterSeconds ?? null,
    message:
      (typeof base.message === "string" && base.message.trim()) ||
      fallbackMessage,
  }
}

const FATAL_REVOCATION_CODES = new Set([
  "TOKEN_REVOKED",
  "TokenRevoked",
  "TOKEN_REUSE_DETECTED",
  "TokenReuseDetected",
  "AccountNotFound",
  "ACCOUNT_NOT_FOUND",
])

/**
 * Return true when an API/refresh error payload indicates token revocation,
 * reuse detection, or missing account requiring immediate logout.
 *
 * @param {unknown} data
 * @returns {boolean}
 */
export function isFatalTokenRevocationError(data) {
  if (!data || typeof data !== "object") return false
  const candidates = [
    data.code,
    data.errorCode,
    data.error,
    typeof data.message === "string" ? data.message : null,
    typeof data.detail === "string" ? data.detail : null,
  ]

  return candidates.some((value) => {
    if (typeof value !== "string" || !value) return false
    if (FATAL_REVOCATION_CODES.has(value)) return true
    for (const code of FATAL_REVOCATION_CODES) {
      if (value.includes(code)) return true
    }
    return false
  })
}
