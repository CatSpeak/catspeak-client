/**
 * Per-user (per-account) personal preferences.
 *
 * Stored in localStorage under `catspeak_pref_<accountId>_<key>` so two accounts
 * sharing a browser no longer leak preferences into each other. These are
 * personal, cross-room settings (reused in every room) as opposed to room-wide
 * policies handled by the room management panel.
 *
 * `legacyKey` migrates the old global keys (`receiveSystemMsgs`, ...) into the
 * scoped key the first time the scoped value is absent.
 */

const PREFIX = "catspeak_pref"

const getDefaultStorage = () => {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const userPrefKey = (accountId, key) =>
  `${PREFIX}_${accountId == null || accountId === "" ? "anon" : accountId}_${key}`

export const parsePrefValue = (raw) => raw !== null && raw !== "false"

/**
 * Read a personal preference.
 *
 * @param {number|string|null} accountId
 * @param {string} key
 * @param {object} [options]
 * @param {boolean} [options.defaultValue=false]
 * @param {string|null} [options.legacyKey=null]
 * @param {Storage|null} [options.storage]
 * @returns {boolean}
 */
export const getUserPref = (
  accountId,
  key,
  { defaultValue = false, legacyKey = null, storage = getDefaultStorage() } = {},
) => {
  if (!storage) return defaultValue

  const scoped = storage.getItem(userPrefKey(accountId, key))
  if (scoped !== null) return parsePrefValue(scoped)

  // Only migrate legacy globals once we know which account we belong to.
  // The legacy key is removed after the move so migration truly happens once.
  if (legacyKey && accountId != null && accountId !== "") {
    const legacy = storage.getItem(legacyKey)
    if (legacy !== null) {
      const value = parsePrefValue(legacy)
      storage.setItem(userPrefKey(accountId, key), value ? "true" : "false")
      storage.removeItem?.(legacyKey)
      return value
    }
  }

  return defaultValue
}

/**
 * Persist a personal preference. No-op without an account or storage.
 */
export const setUserPref = (
  accountId,
  key,
  value,
  { storage = getDefaultStorage() } = {},
) => {
  if (!storage || accountId == null || accountId === "") return
  storage.setItem(userPrefKey(accountId, key), value ? "true" : "false")
}
