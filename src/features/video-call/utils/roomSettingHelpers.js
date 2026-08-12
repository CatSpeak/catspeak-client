export const ROOM_SETTING_KEYS = {
  JOIN_LEAVE_SOUND: "catspeak_join_leave_sound",
  MEMBER_RECORDING: "catspeak_member_recording_allowed",
  MEMBER_PRIVATE_AI: "catspeak_member_private_ai_allowed",
}

/**
 * Get room-scoped setting from localStorage with fallback default.
 * Each room maintains its own independent settings.
 */
export const getRoomSetting = (roomId, keyName, defaultValue = true) => {
  if (typeof window === "undefined") return defaultValue
  if (roomId) {
    const roomVal = localStorage.getItem(`${keyName}_${roomId}`)
    if (roomVal !== null) return roomVal !== "false"
  }
  return defaultValue
}

/**
 * Set room-scoped setting in localStorage.
 */
export const setRoomSetting = (roomId, keyName, value) => {
  if (typeof window === "undefined") return
  const strVal = value ? "true" : "false"
  if (roomId) {
    localStorage.setItem(`${keyName}_${roomId}`, strVal)
  }
}
