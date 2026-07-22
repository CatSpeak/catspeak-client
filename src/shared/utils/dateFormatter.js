/**
 * Date and Time Formatting Utilities
 * Provides consistent date/time formatting across the application
 * Uses the user's browser locale for automatic localization
 */

/**
 * Get the user's locale from the browser
 * Falls back to 'en-US' if not available
 */
export const getUserLocale = () => {
  return navigator.language || navigator.userLanguage || "en-US"
}

/**
 * Format a date to localized date string
 * @param {Date|string} date - Date object or ISO string
 * @param {string} locale - Optional locale override (defaults to user's browser locale)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = getUserLocale()) => {
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return ""
  return dateObj.toLocaleDateString(locale)
}

/**
 * Format a date to localized time string
 * @param {Date|string|number} date - Date object, ISO string, or timestamp (ms)
 * @param {string} locale - Optional locale override (defaults to user's browser locale)
 * @returns {string} Formatted time string (HH:MM)
 */
export const formatTime = (date, locale = getUserLocale()) => {
  if (!date && date !== 0) return ""
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return ""
  return dateObj.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

/**
 * Format a date to localized date and time string
 * @param {Date|string|number} date - Date object, ISO string, or timestamp (ms)
 * @param {string} locale - Optional locale override (defaults to user's browser locale)
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date, locale = getUserLocale()) => {
  if (!date && date !== 0) return ""
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return ""
  return dateObj.toLocaleString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format a date to DD/MM/YYYY, HH:MM AM/PM
 * @param {Date|string|number} dateStr - Date string or object
 * @returns {string} Formatted date string
 */
export const formatDateTime12Hour = (dateStr) => {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ""
  
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  
  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  
  return `${dd}/${mm}/${yyyy}, ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`
}

/**
 * Format a time range (start - end)
 * @param {Date|string|number} startDate - Start date object, ISO string, or timestamp
 * @param {Date|string|number} endDate - End date object, ISO string, or timestamp
 * @param {string} locale - Optional locale override (defaults to user's browser locale)
 * @returns {string} Formatted time range string (HH:MM - HH:MM)
 */
export const formatTimeRange = (
  startDate,
  endDate,
  locale = getUserLocale(),
) => {
  if (!startDate || !endDate) return ""
  const start = startDate instanceof Date ? startDate : new Date(startDate)
  const end = endDate instanceof Date ? endDate : new Date(endDate)

  return `${formatTime(start, locale)} - ${formatTime(end, locale)}`
}

/**
 * Calculate end date based on start date and duration in minutes
 * @param {Date|string|number} startDate - Start date object, ISO string, or timestamp
 * @param {number} durationMinutes - Duration in minutes
 * @returns {Date} End date
 */
export const calculateEndDate = (startDate, durationMinutes) => {
  const start = startDate instanceof Date ? startDate : new Date(startDate)
  if (isNaN(start.getTime())) return new Date()
  return new Date(start.getTime() + durationMinutes * 60000)
}

/**
 * Format a date/timestamp to a short relative time string suitable for chat lists (e.g. Just now, 5m, 2h, Yesterday, Tue, Jul 18).
 * @param {Date|string|number} timestamp - Date object, ISO string, or timestamp
 * @returns {string} Formatted short relative time string
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return ""
  const date = new Date(timestamp)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / (60 * 1000))
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000))
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7)
    return date.toLocaleDateString(undefined, { weekday: "short" })
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

/**
 * Format a date to a full readable string containing weekday, month, day, and year.
 * @param {Date|string|number} timestamp - Date object, ISO string, or timestamp
 * @returns {string} Formatted date separator string
 */
export const formatDateSeparator = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Format lastSeen timestamp to relative "Last seen X ago" string.
 * @param {Date|string|number} lastSeen - Date object, ISO string, or timestamp
 * @returns {string} Formatted last seen string
 */
export const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "Offline"
  const date = new Date(lastSeen)
  if (isNaN(date.getTime())) return "Offline"

  const diffMs = Date.now() - date.getTime()

  // If timestamp is less than 1 minute ago (or slightly in future due to server clock skew), show "just now"
  if (diffMs < 60 * 1000) return "Last seen just now"

  const diffMins = Math.floor(diffMs / (60 * 1000))
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000))
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  if (diffMins < 60) return `Last seen ${diffMins}m ago`
  if (diffHours < 24) return `Last seen ${diffHours}h ago`
  if (diffDays === 1) return "Last seen yesterday"
  if (diffDays < 7)
    return `Last seen ${date.toLocaleDateString(undefined, { weekday: "short" })}`
  return `Last seen ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
}
