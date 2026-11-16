import { getTopicMeta } from "./getTopicIcon"

/**
 * Checks if a topic represents generic "Other" / "Khác" (case-insensitive).
 */
export const isOtherTopic = (topic) => {
  if (!topic) return true
  const trimmed = String(topic).trim().toLowerCase()
  const { topicKey } = getTopicMeta(trimmed)
  return (
    topicKey === "other" ||
    ["other", "others", "khác", "khac"].includes(trimmed)
  )
}

/**
 * Extracts and filters a room's topics, removing empty entries and "Other" / "Khác".
 * Handles both string (`room.topic`) and array (`room.topics`) formats.
 */
export const getValidRoomTopics = (room) => {
  if (!room) return []
  const rawTopics = Array.isArray(room.topics)
    ? room.topics
    : typeof room.topic === "string"
      ? room.topic.split(",")
      : []

  return rawTopics
    .map((t) => String(t || "").trim())
    .filter((trimmed) => trimmed && !isOtherTopic(trimmed))
}

/**
 * Helper utilities to format and translate room topics and levels.
 */
export const formatTopic = (topic, t) => {
  if (!topic) return ""
  const trimmed = String(topic).trim()
  const lower = trimmed.toLowerCase()
  const { topicKey } = getTopicMeta(trimmed)
  return (
    t?.rooms?.createRoom?.topics?.[lower] ||
    t?.rooms?.filters?.topics?.[topicKey] ||
    t?.rooms?.filters?.topics?.[lower] ||
    trimmed
  )
}

export const formatLevel = (level, t) => {
  if (!level) return ""
  const key = String(level).trim().toLowerCase()
  return t?.rooms?.filters?.levels?.[key] || level
}
