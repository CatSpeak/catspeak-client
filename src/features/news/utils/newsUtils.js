export const getTranslatedTimeAgo = (dateString, timeAgo) => {
  if (!timeAgo || !dateString) return ""
  const normalizedStr = typeof dateString === "string" && dateString.includes("T") && !dateString.endsWith("Z") && !dateString.includes("+")
    ? `${dateString}Z`
    : dateString
  const now = new Date()
  const past = new Date(normalizedStr)
  const diffMs = now - past
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  const interpolate = (template, count) =>
    template?.replace("{{count}}", count) ?? ""

  if (diffYears >= 1)
    return interpolate(
      diffYears === 1 ? timeAgo.yearAgo : timeAgo.yearsAgo,
      diffYears
    )
  if (diffMonths >= 1)
    return interpolate(
      diffMonths === 1 ? timeAgo.monthAgo : timeAgo.monthsAgo,
      diffMonths
    )
  if (diffWeeks >= 1)
    return interpolate(
      diffWeeks === 1 ? timeAgo.weekAgo : timeAgo.weeksAgo,
      diffWeeks
    )
  if (diffDays >= 1)
    return interpolate(
      diffDays === 1 ? timeAgo.dayAgo : timeAgo.daysAgo,
      diffDays
    )
  if (diffHours >= 1)
    return interpolate(
      diffHours === 1 ? timeAgo.hourAgo : timeAgo.hoursAgo,
      diffHours
    )
  if (diffMinutes >= 1)
    return interpolate(
      diffMinutes === 1 ? timeAgo.minuteAgo : timeAgo.minutesAgo,
      diffMinutes
    )
  return timeAgo.justNow ?? ""
}

export const getPreviewText = (html) => {
  if (!html) return ""
  const div = document.createElement("div")
  div.innerHTML = html
  return div.textContent?.replace(/\s+/g, " ").trim() || ""
}

/**
 * Backend Language enum mapping (`catspeak_data_social.Enum.Language`):
 * 0: All, 1: English, 2: Chinese, 3: Japanese
 */
export const POST_COMMUNITY_LANGUAGES = Object.freeze({
  All: 0,
  English: 1,
  Chinese: 2,
  Japanese: 3,
})

export const COMMUNITY_LANGUAGE_IDS = POST_COMMUNITY_LANGUAGES

export const COMMUNITY_LANGUAGE_CODES = Object.freeze({
  [COMMUNITY_LANGUAGE_IDS.All]: "all",
  [COMMUNITY_LANGUAGE_IDS.English]: "en",
  [COMMUNITY_LANGUAGE_IDS.Chinese]: "zh",
  [COMMUNITY_LANGUAGE_IDS.Japanese]: "ja",
})

export const COMMUNITY_LANGUAGE_NAMES = Object.freeze({
  [COMMUNITY_LANGUAGE_IDS.All]: "All",
  [COMMUNITY_LANGUAGE_IDS.English]: "English",
  [COMMUNITY_LANGUAGE_IDS.Chinese]: "Chinese",
  [COMMUNITY_LANGUAGE_IDS.Japanese]: "Japanese",
})

/**
 * Backend PostType enum mapping (`catspeak_data_social.Enum.PostType`):
 * 1: CommunityArticle, 2: SocialPost
 */
export const POST_TYPES = Object.freeze({
  CommunityArticle: 1,
  SocialPost: 2,
})

/**
 * Backend PrivacyType enum mapping (`catspeak_data_social.Enum.PrivacyType`):
 * 1: Public, 2: FriendsOnly, 3: Private
 */
export const PRIVACY_TYPES = Object.freeze({
  Public: 1,
  FriendsOnly: 2,
  Private: 3,
})

/**
 * Maps community name, numeric enum, or route code to canonical community name:
 * "All" | "English" | "Chinese" | "Japanese" | "Vietnamese"
 *
 * @param {string|number} [codeOrId]
 * @returns {string}
 */
export const getCommunityName = (codeOrId) => {
  if (codeOrId === undefined || codeOrId === null || codeOrId === "") {
    return "English"
  }
  const c = String(codeOrId).trim().toLowerCase()
  if (c === "2" || c === "zh" || c === "cn" || c === "china" || c === "chinese") {
    return "Chinese"
  }
  if (c === "3" || c === "ja" || c === "jp" || c === "japan" || c === "japanese") {
    return "Japanese"
  }
  if (c === "1" || c === "en" || c === "eng" || c === "uk" || c === "english") {
    return "English"
  }
  if (c === "0" || c === "all") {
    return "All"
  }
  if (c === "vi" || c === "vn" || c === "vietnam" || c === "vietnamese") {
    return "Vietnamese"
  }
  return String(codeOrId)
}

/**
 * Maps community name, route code, or numeric ID to numeric Language enum:
 * 0: All, 1: English, 2: Chinese, 3: Japanese
 *
 * @param {string|number} [codeOrName]
 * @returns {number}
 */
export const getCommunityLanguageId = (codeOrName) => {
  if (typeof codeOrName === "number") return codeOrName
  if (codeOrName === undefined || codeOrName === null || codeOrName === "") return 1
  const c = String(codeOrName).trim().toLowerCase()
  if (c === "2" || c === "zh" || c === "cn" || c === "china" || c === "chinese") {
    return COMMUNITY_LANGUAGE_IDS.Chinese
  }
  if (c === "3" || c === "ja" || c === "jp" || c === "japan" || c === "japanese") {
    return COMMUNITY_LANGUAGE_IDS.Japanese
  }
  if (c === "1" || c === "en" || c === "eng" || c === "uk" || c === "english") {
    return COMMUNITY_LANGUAGE_IDS.English
  }
  if (c === "0" || c === "all") {
    return COMMUNITY_LANGUAGE_IDS.All
  }
  return 1
}

/**
 * Maps community ID or code to route language code (e.g. 3 -> "ja", "Chinese" -> "zh")
 *
 * @param {string|number} [codeOrId]
 * @returns {string}
 */
export const getCommunityCode = (codeOrId) => {
  const id = getCommunityLanguageId(codeOrId)
  return COMMUNITY_LANGUAGE_CODES[id] || "en"
}

/**
 * Maps community name, route code, or numeric ID to localized label using current translation dictionary (t)
 *
 * @param {string|number} [codeOrName]
 * @param {Object} [t]
 * @returns {string}
 */
export const getLocalizedCommunityName = (codeOrName, t) => {
  const canonical = getCommunityName(codeOrName)
  if (canonical === "English") {
    return t?.header?.countries?.english || "Anh"
  }
  if (canonical === "Japanese") {
    return t?.header?.countries?.japan || "Nhật Bản"
  }
  if (canonical === "Chinese") {
    return t?.header?.countries?.china || "Trung Quốc"
  }
  return canonical
}

/** Japanese Hiragana range [\u3040-\u309F] or Katakana range [\u30A0-\u30FF] */
export const HAS_JAPANESE_KANA_REGEX = /[\u3040-\u309f\u30a0-\u30ff]/

/** CJK Unified Ideographs range [\u4E00-\u9FFF] */
export const HAS_CJK_IDEOGRAPHS_REGEX = /[\u4e00-\u9fff]/

export const hasJapaneseKana = (text) => {
  if (!text) return false
  return HAS_JAPANESE_KANA_REGEX.test(text)
}

export const hasCjkIdeographs = (text) => {
  if (!text) return false
  return HAS_CJK_IDEOGRAPHS_REGEX.test(text)
}

/**
 * Checks whether text contains CJK Hanzi characters without Japanese Kana.
 * True for pure Chinese content.
 */
export const isLikelyChineseText = (text) => {
  if (!text) return false
  return hasCjkIdeographs(text) && !hasJapaneseKana(text)
}

/**
 * Evaluates whether a post matches the target community language.
 *
 * Adheres to backend schemas:
 * - `catspeak_data_social.Enum.Language`: 0: All, 1: English, 2: Chinese, 3: Japanese
 * - `catspeak_data_social.Enum.PrivacyType`: 1: Public, 2: FriendsOnly, 3: Private
 *
 * Prevents foreign community posts (e.g. Chinese posts when target is Japanese) from leaking in.
 *
 * @param {Object} post - Post object from PostDto
 * @param {string|number} targetCommunityCodeOrId - e.g. "ja", "Japanese", 3
 * @returns {boolean}
 */
export const isPostInCommunity = (post, targetCommunityCodeOrId) => {
  if (!post) return false

  // 1. Privacy filter
  if (post.privacy !== undefined && post.privacy !== null) {
    const priv = String(post.privacy).toLowerCase()
    if (priv !== "public" && priv !== "1") {
      return false
    }
  }

  const targetId = getCommunityLanguageId(targetCommunityCodeOrId)

  // Community All (0) accepts any public post
  if (targetId === COMMUNITY_LANGUAGE_IDS.All) {
    return true
  }

  const topics = Array.isArray(post.topics) ? post.topics : []
  const combinedText = `${post.title || ""} ${post.excerpt || ""} ${post.content || ""}`.trim()

  // 2. Validate topics: if any topic belongs to another specific community, reject
  if (topics.length > 0) {
    const topicLangIds = topics
      .map((t) => {
        const raw = t.languageCommunity ?? t.LanguageCommunity
        return raw !== undefined && raw !== null ? getCommunityLanguageId(raw) : null
      })
      .filter((id) => id !== null)

    const hasConflictingTopic = topicLangIds.some(
      (id) => id !== COMMUNITY_LANGUAGE_IDS.All && id !== targetId,
    )
    if (hasConflictingTopic) {
      return false
    }

    const hasMatchingTopic = topicLangIds.some((id) => id === targetId)
    if (hasMatchingTopic) {
      return true
    }
  }

  // 3. Check explicit post.languageCommunity
  const rawPostLang = post.languageCommunity ?? post.LanguageCommunity
  const hasExplicitPostLang =
    rawPostLang !== undefined &&
    rawPostLang !== null &&
    String(rawPostLang).trim() !== ""

  if (hasExplicitPostLang) {
    const postLangId = getCommunityLanguageId(rawPostLang)

    if (postLangId === targetId) {
      return true
    }

    if (postLangId !== COMMUNITY_LANGUAGE_IDS.All) {
      return false
    }

    // Explicitly "All" post: ensure content doesn't belong to a conflicting script
    if (targetId === COMMUNITY_LANGUAGE_IDS.Japanese && isLikelyChineseText(combinedText)) {
      return false
    }
    if (targetId === COMMUNITY_LANGUAGE_IDS.Chinese && hasJapaneseKana(combinedText)) {
      return false
    }
    return true
  }

  // 4. Fallback for unassigned / null post.languageCommunity:
  if (targetId === COMMUNITY_LANGUAGE_IDS.Japanese) {
    if (hasJapaneseKana(combinedText)) return true
    if (isLikelyChineseText(combinedText)) return false
    return false
  }

  if (targetId === COMMUNITY_LANGUAGE_IDS.Chinese) {
    if (hasJapaneseKana(combinedText)) return false
    if (isLikelyChineseText(combinedText)) return true
    return false
  }

  if (targetId === COMMUNITY_LANGUAGE_IDS.English) {
    if (hasJapaneseKana(combinedText) || hasCjkIdeographs(combinedText)) return false
    return true
  }

  return false
}
