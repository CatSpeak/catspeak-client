/**
 * Utility functions for sanitizing and setting LiveKit participant metadata safely.
 */

/**
 * Validates and sanitizes an avatar URL string.
 * Returns the URL if it is a valid HTTP/HTTPS URL or safe short string,
 * or null if it is missing, a base64 Data URL, or exceeds maximum metadata length (1024 chars).
 *
 * @param {string} url
 * @returns {string|null}
 */
export const sanitizeAvatarUrl = (url) => {
  if (!url || typeof url !== "string") return null
  const trimmed = url.trim()
  if (!trimmed) return null

  // Reject base64 data URLs or extremely long strings to prevent LiveKit frame overflow
  if (trimmed.startsWith("data:") || trimmed.length > 1024) {
    return null
  }

  return trimmed
}

/**
 * Safely updates local participant metadata in a LiveKit room.
 * Ensures metadata stays under payload size limits and strips unsafe base64 avatar URLs.
 *
 * @param {import("livekit-client").LocalParticipant} localParticipant
 * @param {Object} updateObj - Key/value pairs to update in metadata JSON
 */
export const safeSetLiveKitMetadata = async (localParticipant, updateObj) => {
  if (!localParticipant || typeof localParticipant.setMetadata !== "function") {
    return
  }

  try {
    let currentMeta = {}
    if (localParticipant.metadata) {
      try {
        currentMeta = JSON.parse(localParticipant.metadata)
      } catch {
        currentMeta = {}
      }
    }

    const merged = { ...currentMeta, ...updateObj }

    // Sanitize avatarImageUrl if present
    if ("avatarImageUrl" in merged) {
      const sanitized = sanitizeAvatarUrl(merged.avatarImageUrl)
      if (sanitized) {
        merged.avatarImageUrl = sanitized
      } else {
        delete merged.avatarImageUrl
      }
    }

    const metadataString = JSON.stringify(merged)
    if (metadataString.length > 2048) {
      console.warn("LiveKit metadata payload too large, skipping metadata update")
      return
    }

    await localParticipant.setMetadata(metadataString)
  } catch (err) {
    console.warn("Failed to set LiveKit participant metadata safely:", err)
  }
}
