import React from "react"

export const DESCRIPTION_TRIGGER_REGEX = /(^|[\s([{])([@#])([\p{L}\p{N}_.-]{0,50})$/u
export const DESCRIPTION_LINK_REGEX = /([@#][\p{L}\p{N}_.-]+)/gu
export const DESCRIPTION_MAX_LENGTH = 2000

export const PRIVACY_OPTIONS = [
  { value: "Public", label: "Public" },
  { value: "FriendsOnly", label: "Friends Only" },
  { value: "Private", label: "Private" },
]

export const normalizeChallengeHashtag = (challenge) => {
  const rawHashtag = String(challenge?.hashtag || "").trim()
  if (!rawHashtag) return ""
  const hashtag = rawHashtag.replace(/^#+/, "").replace(/\s+/g, "")
  return hashtag ? `#${hashtag}` : ""
}

export const buildChallengeDescription = (lockedHashtag, value = "") => {
  const text = String(value || "").slice(0, DESCRIPTION_MAX_LENGTH)
  if (!lockedHashtag) return text
  if (text.includes(lockedHashtag)) return text
  if (!text.trim()) return `${lockedHashtag} `
  return `${text} ${lockedHashtag}`.slice(0, DESCRIPTION_MAX_LENGTH)
}

export const detectDescriptionTrigger = (value, caretPosition = value.length) => {
  const beforeCaret = value.slice(0, caretPosition)
  const match = beforeCaret.match(DESCRIPTION_TRIGGER_REGEX)
  if (!match) return null
  const marker = match[2]
  const query = match[3] || ""
  const start = beforeCaret.length - marker.length - query.length
  return { type: marker === "@" ? "mention" : "hashtag", marker, query, start, end: caretPosition }
}

export const getHashtagName = (item) => String(item?.hashtag || "").replace(/^#+/, "").trim()
export const getMentionUsername = (item) => String(item?.username || item?.nickname || "").replace(/^@+/, "").replace(/\s+/g, "").trim()

export const renderHighlightedDescription = (text, tokenClassName) => {
  if (!text) return null
  const parts = []
  let lastIndex = 0
  for (const match of text.matchAll(DESCRIPTION_LINK_REGEX)) {
    const token = match[0]
    const index = match.index || 0
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index))
    }
    parts.push(
      <span key={`${token}-${index}`} className={tokenClassName}>
        {token}
      </span>
    )
    lastIndex = index + token.length
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return parts
}
