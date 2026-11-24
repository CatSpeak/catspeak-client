import { CO_HOST_PERMISSIONS } from "@/features/co-host/constants"
import { parseParticipantMetadata } from "./participantIdentity"
import { isRoomHost } from "./roomTypeHelpers"

/**
 * Extract the LiveKit-authenticated account ID from the remote/local Participant
 * object provided by LiveKit's DataReceived event (never trusting client-mutable
 * participant metadata before server-signed participant identity).
 *
 * @param {object|null|undefined} participant
 * @returns {string|null}
 */
export function extractParticipantAccountId(participant) {
  if (!participant) return null
  const identity =
    participant.identity != null ? String(participant.identity).trim() : ""
  if (identity) {
    const match = identity.match(/^(?:user[_-])?(\d+)$/i)
    return match ? match[1] : identity
  }
  if (participant.accountId != null && participant.accountId !== "") {
    return String(participant.accountId)
  }
  if (participant.attributes?.accountId != null && participant.attributes.accountId !== "") {
    return String(participant.attributes.accountId)
  }
  const meta = parseParticipantMetadata(participant.metadata)
  if (meta?.accountId != null && meta.accountId !== "") {
    return String(meta.accountId)
  }
  return null
}

function getRequiredCoHostPermission(action, data = {}) {
  switch (action) {
    case "MUTE_ALL":
      return CO_HOST_PERMISSIONS.MUTE_ALL
    case "CAMERA_OFF_ALL":
      return CO_HOST_PERMISSIONS.CAMERA_OFF_ALL
    case "SELF_UNMUTE_POLICY":
      return CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE
    case "SELF_CAMERA_POLICY":
      return CO_HOST_PERMISSIONS.ALLOW_SELF_CAMERA
    case "STUDENT_SHARE_POLICY":
      return CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE
    case "MEMBER_RECORDING_POLICY":
    case "TOGGLE_MEMBER_RECORDING":
      return CO_HOST_PERMISSIONS.ALLOW_MEMBER_RECORDING
    case "ROOM_LOCK_CHANGED":
      return CO_HOST_PERMISSIONS.LOCK_CLASS
    case "ROOM_ENDED":
      return CO_HOST_PERMISSIONS.END_CLASS
    case "LOWER_ALL_HANDS":
      return CO_HOST_PERMISSIONS.LOWER_ALL_HANDS
    case "KICK_PARTICIPANT":
      return CO_HOST_PERMISSIONS.REMOVE_STUDENT
    case "MUTE_PARTICIPANT": {
      if (data?.trackKind === "video") return CO_HOST_PERMISSIONS.CAMERA_TOGGLE
      if (data?.trackKind === "screen" || data?.trackKind === "screen_share") {
        return CO_HOST_PERMISSIONS.STOP_MEMBER_SHARE
      }
      return CO_HOST_PERMISSIONS.MIC_TOGGLE
    }
    case "HIGH_QUALITY_POLICY":
    case "TOGGLE_MEMBER_PRIVATE_AI":
    default:
      return null // Host-only unless explicitly listed above
  }
}

/**
 * Authorize an incoming LiveKit DataChannel `"moderation"` event using the
 * LiveKit-authenticated `participant` identity against host & co-host roles.
 *
 * @param {object} params
 * @param {object|null|undefined} params.participant
 * @param {object} params.data
 * @param {object|null|undefined} params.roomData
 * @param {object|null|undefined} params.liveCoHost
 * @returns {boolean}
 */
export function isAuthorizedModerationSender({
  participant,
  data,
  roomData,
  liveCoHost,
}) {
  const senderAccountId = extractParticipantAccountId(participant)
  if (!senderAccountId || !data?.action) return false

  if (isRoomHost(roomData, senderAccountId)) {
    return true
  }

  if (
    liveCoHost?.coHostAccountId != null &&
    String(liveCoHost.coHostAccountId) === String(senderAccountId)
  ) {
    const requiredPerm = getRequiredCoHostPermission(data.action, data)
    if (!requiredPerm) return false
    const perms = Array.isArray(liveCoHost.permissions)
      ? liveCoHost.permissions
      : []
    return perms.includes(requiredPerm)
  }

  return false
}
