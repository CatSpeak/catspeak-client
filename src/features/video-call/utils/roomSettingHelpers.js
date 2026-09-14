// Room-scoped, in-session policy store for client-only policies.
//
// Ticket 02: server-authoritative policies (member recording, student share,
// self-media gates, ...) now live in the room-state RTK cache. The only policy
// still kept client-side is the host-only private-AI gate, which is held in
// memory for the current session — it is no longer persisted to localStorage.
const memoryStore = new Map()

const storageKey = (roomId, keyName) => `${keyName}_${roomId}`

export const ROOM_SETTING_KEYS = {
  MEMBER_PRIVATE_AI: "member_private_ai_allowed",
}

/**
 * Get a room-scoped, in-session setting with fallback default.
 */
export const getRoomSetting = (roomId, keyName, defaultValue = true) => {
  if (roomId == null) return defaultValue
  const value = memoryStore.get(storageKey(roomId, keyName))
  return value === undefined ? defaultValue : value
}

/**
 * Set a room-scoped, in-session setting.
 */
export const setRoomSetting = (roomId, keyName, value) => {
  if (roomId == null) return
  memoryStore.set(storageKey(roomId, keyName), value === true)
}
