import { DEFAULT_TIMEZONE, getBrowserTimeZone } from "@/shared/constants/timezones"

/**
 * Get the user's locale from the browser (fallback to 'en-US')
 */
export const getUserLocale = () => {
  return navigator.language || navigator.userLanguage || "en-US"
}

/**
 * Resolve a short language code (e.g. "vi", "zh", "en") to a BCP-47 locale tag
 */
export const getDisplayLocale = (language) => {
  if (!language) return undefined
  const l = String(language).toLowerCase()
  if (l.startsWith("vi")) return "vi-VN"
  if (l.startsWith("zh")) return "zh-CN"
  if (l.startsWith("en")) return "en-US"
  return undefined
}

/**
 * Safely coerce a value to a Date, returning null if missing or invalid.
 * Handles ISO strings missing 'Z' suffix gracefully.
 */
export const ensureDate = (value) => {
  if (value === null || value === undefined || value === "") return null
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value
  if (typeof value === "number") return new Date(value)
  if (typeof value === "string") {
    let str = value.trim()
    if (str.includes("T") && !str.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(str)) {
      str += "Z"
    }
    const d = new Date(str)
    return isNaN(d.getTime()) ? null : d
  }
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Core formatter: Format a date in a specific IANA TimeZone with Intl options
 */
export const formatInTimeZone = (date, timeZone, options = {}, locale = getUserLocale()) => {
  const d = ensureDate(date)
  if (!d) return ""
  const tz = timeZone || getBrowserTimeZone()
  return new Intl.DateTimeFormat(locale, { ...(tz ? { timeZone: tz } : {}), ...options }).format(d)
}

/**
 * Legacy alias for formatInTimeZone (backwards compatibility)
 */
export const formatInUserTimeZone = formatInTimeZone

/**
 * Format a date to localized date string
 */
export const formatDate = (date, locale = getUserLocale(), timeZone = null) => {
  return formatInTimeZone(date, timeZone, { year: "numeric", month: "2-digit", day: "2-digit" }, locale)
}

/**
 * Format a date to localized time string (HH:mm)
 */
export const formatTime = (date, locale = getUserLocale(), timeZone = null) => {
  return formatInTimeZone(date, timeZone, { hour: "2-digit", minute: "2-digit", hour12: false }, locale)
}

/**
 * Format a date to localized date and time string
 */
export const formatDateTime = (date, locale = getUserLocale(), timeZone = null) => {
  return formatInTimeZone(date, timeZone, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }, locale)
}

/**
 * Format relative time string (e.g. Just now / Vừa xong, 5m, 2h, or formatted date)
 */
export const formatRelativeTime = (timestamp, userTimeZone = null, language = "en") => {
  const date = ensureDate(timestamp)
  if (!date) return ""
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / (60 * 1000))
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000))
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  const loc = getDisplayLocale(language) || getUserLocale()

  if (diffMins < 1) {
    if (String(language).startsWith("vi")) return "Vừa xong"
    if (String(language).startsWith("zh")) return "刚刚"
    return "Just now"
  }
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) {
    return formatInTimeZone(date, userTimeZone, { weekday: "short" }, loc)
  }
  return formatInTimeZone(date, userTimeZone, { month: "short", day: "numeric" }, loc)
}

/**
 * Convert HH:mm time string to target TimeZone (e.g. "14:30" -> formatted HH:mm in target TZ)
 */
export const convertTimeStrToTz = (timeStr, userTimeZone = null) => {
  if (!timeStr || typeof timeStr !== "string") return timeStr
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})/)
  if (!match) return timeStr

  if (!userTimeZone) return timeStr.slice(0, 5)

  const hours = Number(match[1])
  const minutes = Number(match[2])
  const now = new Date()
  const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hours, minutes))

  return utcDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: userTimeZone,
  })
}

/**
 * Calculate end date based on start date and duration in minutes
 */
export const calculateEndDate = (startDate, durationMinutes) => {
  const start = ensureDate(startDate)
  if (!start) return new Date()
  return new Date(start.getTime() + durationMinutes * 60000)
}

/**
 * Format a date as YYYY-MM-DD in the specified TimeZone
 */
export const getDateKeyInTz = (date, userTimeZone = null) => {
  const d = ensureDate(date)
  if (!d) return ""
  const tz = userTimeZone || DEFAULT_TIMEZONE
  return d.toLocaleDateString("en-CA", { timeZone: tz })
}
