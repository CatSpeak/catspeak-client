export const NOTICE_SEVERITY_INFO = "info"
export const NOTICE_SEVERITY_ERROR = "error"

const ERROR_LEVEL_ACTIONS = new Set(["KICK_PARTICIPANT", "ROOM_ENDED"])

export function moderationNoticeSeverity(action) {
  return ERROR_LEVEL_ACTIONS.has(action)
    ? NOTICE_SEVERITY_ERROR
    : NOTICE_SEVERITY_INFO
}

export function resolveBlockAllMicsNotice(restrictedAccountIds, accountId) {
  if (accountId == null || accountId === "") return null
  const ids = Array.isArray(restrictedAccountIds) ? restrictedAccountIds : []
  const isRestricted = ids.some((id) => String(id) === String(accountId))
  if (!isRestricted) return null
  return {
    severity: NOTICE_SEVERITY_INFO,
    messageKey: "hostRestrictedVoiceAll",
  }
}

export function resolveRestrictionNotice(previous, next) {
  if (!next) return null
  if (!previous) return null
  if (!!previous.isVoiceRestricted !== !!next.isVoiceRestricted) {
    return {
      severity: NOTICE_SEVERITY_INFO,
      messageKey: next.isVoiceRestricted
        ? "hostRestrictedVoice"
        : "hostUnrestrictedVoice",
    }
  }
  if (!!previous.isChatRestricted !== !!next.isChatRestricted) {
    return {
      severity: NOTICE_SEVERITY_INFO,
      messageKey: next.isChatRestricted
        ? "hostRestrictedChat"
        : "hostUnrestrictedChat",
    }
  }
  return null
}
