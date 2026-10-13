/**
 * Per-participant volume settings persisted across video calls in localStorage.
 *
 * Allows a user to adjust another participant's volume in any call, and have
 * that customized volume automatically remembered and applied in all future calls
 * with that same participant.
 */

const PREFIX = "catspeak_participant_volumes"

const getDefaultStorage = () => {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * Extracts accountId and identity from a LiveKit participant.
 */
export const getParticipantIdentifier = (participant) => {
  if (!participant) return { accountId: null, identity: null }

  let meta = participant.metadata
  if (typeof meta === "string") {
    try {
      meta = JSON.parse(meta)
    } catch {
      meta = {}
    }
  }

  const rawAccountId = meta?.accountId ?? participant?.accountId
  const accountId =
    rawAccountId != null && String(rawAccountId).trim() !== ""
      ? String(rawAccountId).trim()
      : null

  const rawIdentity = participant?.identity
  const identity =
    rawIdentity != null && String(rawIdentity).trim() !== ""
      ? String(rawIdentity).trim()
      : null

  return { accountId, identity }
}

export const getVolumeStorageKey = (myAccountId) => {
  const scope =
    myAccountId != null && String(myAccountId).trim() !== ""
      ? String(myAccountId).trim()
      : "global"
  return `${PREFIX}_${scope}`
}

const safeParseMap = (raw) => {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * Reads a saved volume for a participant (0 to 1), or null if not stored.
 */
export const getSavedParticipantVolume = (
  participant,
  myAccountId = null,
  { storage = getDefaultStorage() } = {},
) => {
  if (!participant || participant.isLocal || !storage) return null

  const { accountId, identity } = getParticipantIdentifier(participant)
  if (!accountId && !identity) return null

  const keysToCheck = [
    getVolumeStorageKey(myAccountId),
    `${PREFIX}_global`,
    PREFIX,
  ]

  for (const key of keysToCheck) {
    const raw = storage.getItem(key)
    if (raw) {
      const map = safeParseMap(raw)
      const targetVal =
        (accountId && map[accountId] !== undefined ? map[accountId] : null) ??
        (identity && map[identity] !== undefined ? map[identity] : null)

      if (typeof targetVal === "number" && !isNaN(targetVal)) {
        return Math.max(0, Math.min(1, targetVal))
      }
    }
  }

  return null
}

/**
 * Persists a customized volume (0 to 1) for a participant.
 */
export const saveParticipantVolume = (
  participant,
  volume,
  myAccountId = null,
  { storage = getDefaultStorage() } = {},
) => {
  if (!participant || participant.isLocal || !storage) return

  const { accountId, identity } = getParticipantIdentifier(participant)
  if (!accountId && !identity) return

  const numVol = Number(volume)
  if (isNaN(numVol)) return
  const clamped = Math.max(0, Math.min(1, numVol))

  const key = getVolumeStorageKey(myAccountId)
  try {
    const map = safeParseMap(storage.getItem(key))

    if (accountId) {
      map[accountId] = clamped
    }
    if (identity) {
      map[identity] = clamped
    }

    storage.setItem(key, JSON.stringify(map))
  } catch (err) {
    console.error("Failed to save participant volume to localStorage:", err)
  }
}

/**
 * Retrieves and immediately applies any saved volume to the participant.
 */
export const applySavedParticipantVolume = (
  participant,
  myAccountId = null,
  { storage = getDefaultStorage() } = {},
) => {
  if (!participant || participant.isLocal) return null

  const saved = getSavedParticipantVolume(participant, myAccountId, { storage })
  if (typeof saved === "number" && !isNaN(saved)) {
    if (typeof participant.setVolume === "function") {
      participant.setVolume(saved)
    }
    return saved
  }

  return null
}
