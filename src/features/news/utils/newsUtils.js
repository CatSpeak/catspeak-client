export const getTranslatedTimeAgo = (dateString, timeAgo) => {
  if (!timeAgo) return ""
  const now = new Date()
  const past = new Date(dateString)
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



export const formatExactDate = (dateStr, locale = "en-GB") => {
  return new Date(dateStr).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
