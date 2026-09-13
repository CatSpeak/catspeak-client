/**
 * Pure helpers for restoring a previously chosen media device.
 *
 * Device ids are machine-specific, so persistence is machine-scoped (not
 * account-scoped). If a stored device is gone (unplugged), fall back to the
 * current/valid device and finally to the provided default.
 */

export const pickDeviceId = ({ current = "", stored = "", available = [], fallback = "" } = {}) => {
  const ids = (available ?? [])
    .map((d) => (typeof d === "string" ? d : d?.deviceId))
    .filter(Boolean)

  // Device list not ready yet (or empty) — can't validate, keep what we have.
  if (ids.length === 0) return current || stored || fallback

  if (current && ids.includes(current)) return current
  if (stored && ids.includes(stored)) return stored
  return fallback
}
