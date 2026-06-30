/**
 * Formatting utilities for the Video feature.
 * Pure functions — no side effects, easy to test.
 */

/**
 * Compact number display (e.g. 12.3K, 1.2M).
 * Supports i18n out of the box using Intl.NumberFormat.
 * @param {number} num
 * @param {string} [locale='en']
 * @returns {string}
 */
export const formatCompactNumber = (num, locale = 'en') => {
  if (num === null || num === undefined || isNaN(num)) return "0"
  
  // Use Intl.NumberFormat for native localized compact notation (12.3K, 12,3 N, etc.)
  return new Intl.NumberFormat(locale, { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 }).format(num)
}

/**
 * Format seconds into mm:ss display.
 * @param {number} seconds
 * @returns {string}
 */
export const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

/**
 * Relative time string (e.g. "2 days ago", "just now").
 * Automatically translates into any locale via Intl.RelativeTimeFormat.
 * @param {string} isoDate - ISO 8601 date string
 * @param {string} [locale='en']
 * @returns {string}
 */
export const formatRelativeTime = (isoDate, locale = 'en') => {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)

  // Handle "just now" logic across languages manually if needed, or fallback to 0 minutes
  if (seconds < 60) {
    if (locale === 'vi') return 'Vừa xong'
    if (locale === 'zh') return '刚刚'
    return 'Just now'
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), 'minute')
  if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), 'hour')
  if (seconds < 2592000) return rtf.format(-Math.floor(seconds / 86400), 'day')
  return rtf.format(-Math.floor(seconds / 2592000), 'month')
}

/**
 * Format score number with ceil logic.
 * @param {number|string} c
 * @returns {string}
 */
export const formatScore = (c) => {
  const num = Math.ceil(Number(c) || 0)
  return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : String(num)
}

/**
 * Format count to compact representation (e.g. 1.2K instead of 1200) consistently using K suffix.
 * @param {number|string} c
 * @returns {string}
 */
export const formatCompactCount = (c) => {
  const num = Number(c) || 0
  if (num === 0) return "0"
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return String(num)
}

/**
 * Calculate challenge time remaining.
 * @param {string} dateStr
 * @param {object} t - translations context
 * @returns {string}
 */
export const calculateTimeRemaining = (dateStr, t) => {
  if (!dateStr) return t?.catSpeak?.reels?.noLimit || "Không giới hạn"
  const end = new Date(dateStr)
  const now = new Date()
  const diff = end - now
  
  if (diff <= 0) return t?.catSpeak?.reels?.ended || "Đã kết thúc"
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) {
    const daysText = t?.catSpeak?.reels?.leaderboard?.daysLeft?.replace("{days}", days).replace("{hours}", hours > 0 ? hours : "") 
    return daysText || `Còn ${days} ngày ${hours > 0 ? `${hours} giờ` : ""}`
  }
  if (hours > 0) {
    const hoursText = t?.catSpeak?.reels?.leaderboard?.hoursLeft?.replace("{hours}", hours)
    return hoursText || `Còn ${hours} giờ`
  }
  return t?.catSpeak?.reels?.leaderboard?.endingSoon || "Sắp kết thúc"
}

/**
 * Format date to DD/MM/YYYY format.
 * @param {string|Date} dateString
 * @returns {string}
 */
export const formatChallengeDate = (dateString) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
}

/**
 * Format challenge days left.
 * @param {string} dateStr
 * @param {object} t - translations context
 * @returns {string}
 */
export const formatDaysLeft = (dateStr, t) => {
  if (!dateStr) return t?.catSpeak?.reels?.noLimit || "Không giới hạn"
  const end = new Date(dateStr)
  const now = new Date()
  const diff = end - now
  if (diff <= 0) return t?.catSpeak?.reels?.ended || "Đã kết thúc"
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  const formatStr = t?.catSpeak?.reels?.daysLeft || "Còn {{days}} ngày"
  return formatStr.replace("{{days}}", String(days))
}


