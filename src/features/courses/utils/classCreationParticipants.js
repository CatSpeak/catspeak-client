import { CO_HOST_ALL } from "../../co-host/constants.js"

export function normalizeClassCreationParticipants(data = {}) {
  if (!Array.isArray(data.invitedAccountIds ?? [])) throw new Error("CLASS_INVITEES_INVALID")
  const invitedAccountIds = [...new Set((data.invitedAccountIds ?? []).map(Number))]
  if (invitedAccountIds.length > 50 || invitedAccountIds.some(id => !Number.isSafeInteger(id) || id <= 0)) {
    throw new Error("CLASS_INVITEES_INVALID")
  }
  const rawCoHost = data.coHostAccountId
  const coHostAccountId = rawCoHost == null || rawCoHost === "" ? null : Number(rawCoHost)
  if (coHostAccountId !== null && (!Number.isSafeInteger(coHostAccountId) || coHostAccountId <= 0)) {
    throw new Error("CLASS_COHOST_INVALID")
  }
  const sourcePermissions = data.coHostPermissions ?? ["share_screen"]
  if (coHostAccountId !== null && !Array.isArray(sourcePermissions)) throw new Error("COHOST_PERMISSION_INVALID")
  const coHostPermissions = coHostAccountId === null ? [] : [...new Set(sourcePermissions)]
  if (coHostAccountId !== null && (coHostPermissions.length === 0 || coHostPermissions.some(p => !CO_HOST_ALL.includes(p)))) {
    throw new Error("COHOST_PERMISSION_INVALID")
  }
  return { invitedAccountIds, coHostAccountId, coHostPermissions }
}
