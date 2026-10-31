// 403 payload produced by catspeak-ai when the caller's plan lacks Placement
// Test (api/routes/placement.py:94-103). The gate must key off the same codes
// the API enforces, so an account whose plan denies the feature gets the
// upgrade screen instead of a generic failure toast.
const PLAN_FORBIDDEN_CODES = new Set([
  "AI_PLACEMENT_TEST_FORBIDDEN",
  "FEATURE_NOT_IN_PLAN",
])

export const isPlanForbiddenError = (error) => {
  if (error?.status !== 403) return false
  const detail = error?.data?.detail
  return (
    PLAN_FORBIDDEN_CODES.has(detail?.errorCode) ||
    PLAN_FORBIDDEN_CODES.has(detail?.error_code) ||
    PLAN_FORBIDDEN_CODES.has(detail?.code)
  )
}
