/**
 * Utility to extract normalized error details from RTK Query error objects.
 * Safely extracts backend response fields (statusCode, errorCode, message, validationErrors, traceId)
 * while providing network error fallbacks.
 *
 * @param {object} err - The error object caught from an RTK Query mutation/query
 * @returns {{ res: object|undefined, statusCode: number|string|undefined, errorCode: string|undefined, message: string|undefined, validationErrors: Array|object|undefined, traceId: string|undefined }}
 */
export function parseApiError(err) {
  const res = err?.data
  return {
    res,
    statusCode: res?.statusCode || err?.status,
    errorCode: res?.errorCode,
    message: res?.message || err?.message,
    validationErrors: res?.validationErrors || res?.errors,
    traceId: res?.traceId,
  }
}

/**
 * Resolves a localized error message when the backend returned a machine-readable
 * errorCode, falling back to a localized default when it did not.
 * `resolve` maps an errorCode to a localized message; `fallback` is used when there
 * is no errorCode (e.g. a plain server message or a network failure).
 */
export function resolveLocalizedError(err, resolve, fallback) {
  const { errorCode } = parseApiError(err)
  if (errorCode) return resolve(err, errorCode) || fallback
  return fallback
}
