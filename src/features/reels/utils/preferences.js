export const REEL_VOLUME_STORAGE_KEY = "reelVolume"
export const REEL_MUTED_STORAGE_KEY = "reelMuted"
const DEFAULT_REEL_VOLUME = 0.5
const DEFAULT_REEL_MUTED = false

const readReelPreference = (key) => {
  if (typeof window === "undefined") return null

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export const readStoredReelVolume = () => {
  const saved = readReelPreference(REEL_VOLUME_STORAGE_KEY)
  const parsed = saved !== null ? Number.parseFloat(saved) : DEFAULT_REEL_VOLUME

  return Number.isFinite(parsed)
    ? Math.min(Math.max(parsed, 0), 1)
    : DEFAULT_REEL_VOLUME
}

export const readStoredReelMuted = () => {
  const saved = readReelPreference(REEL_MUTED_STORAGE_KEY)
  if (saved === "false") return false
  if (saved === "true") return true

  return DEFAULT_REEL_MUTED
}

export const writeReelPreference = (key, value) => {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    // Storage can be unavailable in strict private/security modes.
  }
}
