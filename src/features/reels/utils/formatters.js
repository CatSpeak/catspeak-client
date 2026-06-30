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
