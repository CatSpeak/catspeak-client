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

export const getCommunityName = (code) => {
  if (!code) return "English"
  const c = code.toLowerCase()
  if (c === "zh" || c === "cn" || c === "china" || c === "chinese")
    return "Chinese"
  if (c === "en" || c === "eng" || c === "uk" || c === "english")
    return "English"
  if (c === "vi" || c === "vn" || c === "vietnam" || c === "vietnamese")
    return "Vietnamese"
  if (c === "ja" || c === "jp" || c === "japan" || c === "japanese")
    return "Japanese"
  return code
}

