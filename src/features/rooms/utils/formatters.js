/**
 * Helper utilities to format and translate room topics and levels.
 */

export const formatTopic = (topic, t) => {
  if (!topic) return ""
  const key = String(topic).toLowerCase()
  return (
    t?.rooms?.createRoom?.topics?.[key] ||
    t?.rooms?.filters?.topics?.[key] ||
    topic
  )
}

export const formatLevel = (level, t) => {
  if (!level) return ""
  const key = String(level).toLowerCase()
  return t?.rooms?.filters?.levels?.[key] || level
}
