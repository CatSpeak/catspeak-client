import { TOPIC_SUGGESTIONS_DATASET } from "../data/meetingSuggestionsDataset.js"

const TOPIC_KEY_MAP = {
  psychology: "psychology",
  history: "history",
  science: "science",
  technology: "science",
  tech: "science",
  philosophy: "philosophy",
  politics: "politics",
  space: "space",
  movies: "movies",
  cinema: "movies",
  film: "movies",
  music: "music",
  art: "art",
  fashion: "fashion",
  culture: "culture",
  books: "books",
  reading: "books",
  food: "food",
  cooking: "food",
  nature: "nature",
  environment: "nature",
  relationships: "relationships",
  relationship: "relationships",
  dating: "relationships",
  sports: "sports",
  sport: "sports",
  fitness: "sports",
  finance: "finance",
  money: "finance",
  startups: "startups",
  startup: "startups",
  business: "startups",
  productivity: "productivity",
  travel: "travel",
  other: "other",
  general: "other",
}

/**
 * Normalizes input topic string or number from room context to dataset topic key.
 */
export function normalizeTopicKey(rawTopic) {
  if (!rawTopic) return null
  const str = String(rawTopic).trim().toLowerCase()
  return TOPIC_KEY_MAP[str] || (TOPIC_SUGGESTIONS_DATASET[str] ? str : null)
}

/**
 * Gets safe topics for default starters/fallbacks (excludes BR-001 "politics").
 */
function getSafeTopicKeys() {
  return Object.keys(TOPIC_SUGGESTIONS_DATASET).filter((k) => k !== "politics")
}

/**
 * Formats a question item into bilingual representation based on target language.
 */
export function formatSuggestionItem(questionItem, topicIcon, targetLang = "en") {
  const normLang = String(targetLang || "en").toLowerCase()
  let targetText = questionItem.en
  if (normLang.startsWith("zh") || normLang === "chinese") {
    targetText = questionItem.zh || questionItem.en
  } else if (normLang.startsWith("vi") || normLang === "vietnamese") {
    targetText = questionItem.vi
  } else {
    targetText = questionItem.en || questionItem.vi
  }

  const isViOnly = normLang.startsWith("vi") || normLang === "vietnamese"

  return {
    id: questionItem.id,
    level: questionItem.level,
    icon: questionItem.icon || topicIcon || "💬",
    vi: questionItem.vi,
    targetText: targetText,
    displayText: isViOnly ? questionItem.vi : `${questionItem.vi} / ${targetText}`,
  }
}

/**
 * Gets initial meeting starter suggestions (FR-001, FR-004).
 * Returns 3-5 suggestion items + topic info.
 */
export function getInitialMeetingSuggestions({
  roomTopic = null,
  targetLanguage = "en",
  usedIds = new Set(),
  chatCount = 0,
  count = 5,
} = {}) {
  let matchedKey = normalizeTopicKey(roomTopic)

  // BR-001: Do not use politics as default starter topic
  if (matchedKey === "politics") {
    matchedKey = null
  }

  // Priority 1: Use room topic if available. Priority 2: Fallback random safe topic.
  if (!matchedKey || !TOPIC_SUGGESTIONS_DATASET[matchedKey]) {
    const safeKeys = getSafeTopicKeys()
    matchedKey = safeKeys[Math.floor(Math.random() * safeKeys.length)]
  }

  const topicData = TOPIC_SUGGESTIONS_DATASET[matchedKey]
  const allQuestions = topicData?.questions || []

  // Filter out used IDs in session
  let available = allQuestions.filter((q) => !usedIds.has(q.id))
  if (available.length < count) {
    const safeKeys = getSafeTopicKeys()
    const otherPool = safeKeys
      .flatMap((k) => TOPIC_SUGGESTIONS_DATASET[k].questions)
      .filter((q) => !usedIds.has(q.id))
    available = [...available, ...otherPool]
  }
  if (available.length === 0) {
    available = [...allQuestions]
  }

  const allowComplex = chatCount >= 5
  let pool = []
  if (!allowComplex) {
    const simpleOnly = available.filter((q) => q.level === "simple")
    const complexOnly = available.filter((q) => q.level !== "simple")
    // Prioritize simple, but fill up with complex/others if simple count is insufficient
    pool = [...simpleOnly.sort(() => Math.random() - 0.5), ...complexOnly.sort(() => Math.random() - 0.5)]
  } else {
    pool = [...available].sort(() => Math.random() - 0.5)
  }

  const selected = pool.slice(0, Math.min(count, pool.length))

  return {
    topicKey: matchedKey,
    topicNameVi: topicData.nameVi,
    topicNameEn: topicData.nameEn,
    topicIcon: topicData.icon,
    suggestions: selected.map((item) =>
      formatSuggestionItem(item, topicData.icon, targetLanguage),
    ),
  }
}

/**
 * Loads more meeting suggestions from dataset in-place (FR-007).
 */
export function getMoreMeetingSuggestions({
  roomTopic = null,
  targetLanguage = "en",
  usedIds = new Set(),
  chatCount = 0,
  count = 3,
} = {}) {
  let matchedKey = normalizeTopicKey(roomTopic)
  if (matchedKey === "politics") matchedKey = null

  if (!matchedKey || !TOPIC_SUGGESTIONS_DATASET[matchedKey]) {
    const safeKeys = getSafeTopicKeys()
    matchedKey = safeKeys[Math.floor(Math.random() * safeKeys.length)]
  }

  const topicData = TOPIC_SUGGESTIONS_DATASET[matchedKey]
  const allQuestions = topicData?.questions || []

  let available = allQuestions.filter((q) => !usedIds.has(q.id))
  if (available.length < count) {
    // If running out in current topic, pull from other safe topics
    const safeKeys = getSafeTopicKeys()
    const otherPool = safeKeys
      .flatMap((k) => TOPIC_SUGGESTIONS_DATASET[k].questions)
      .filter((q) => !usedIds.has(q.id))
    available = [...available, ...otherPool]
  }

  if (available.length === 0) {
    // Shuffle reset
    available = [...allQuestions]
  }

  const allowComplex = chatCount >= 5
  let pool = []
  if (!allowComplex) {
    const simpleOnly = available.filter((q) => q.level === "simple")
    const complexOnly = available.filter((q) => q.level !== "simple")
    pool = [...simpleOnly.sort(() => Math.random() - 0.5), ...complexOnly.sort(() => Math.random() - 0.5)]
  } else {
    pool = [...available].sort(() => Math.random() - 0.5)
  }

  const selected = pool.slice(0, Math.min(count, pool.length))

  return selected.map((item) => {
    const parentTopic = TOPIC_SUGGESTIONS_DATASET[item.topicId] || topicData
    return formatSuggestionItem(item, parentTopic.icon, targetLanguage)
  })
}
