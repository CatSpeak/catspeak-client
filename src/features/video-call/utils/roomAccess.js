/**
 * Room access helpers for the participant panel.
 *
 * Mirrors the server contract in catspeak-api `RoomService`:
 * - banned-participants (GET) and unban (POST) allow the host/admin plus a
 *   co-host holding `remove_student` OR `mute_all`.
 *
 * The co-host constants are imported via a relative path (not the '@' alias)
 * so this module stays runnable under `node --test`.
 */
import { CO_HOST_PERMISSIONS } from "../../co-host/constants.js"

export const BANNED_LIST_PERMISSIONS = [
  CO_HOST_PERMISSIONS.REMOVE_STUDENT,
  CO_HOST_PERMISSIONS.MUTE_ALL,
]

export const canViewBannedList = ({ isHost = false, coHost = null, accountId = null } = {}) => {
  if (isHost) return true
  if (!coHost?.coHostAccountId || accountId == null) return false
  if (String(coHost.coHostAccountId) !== String(accountId)) return false
  const permissions = coHost.permissions ?? []
  return BANNED_LIST_PERMISSIONS.some((code) => permissions.includes(code))
}
