/**
 * Formatting utilities for the Video feature.
 * Pure functions — no side effects, easy to test.
 */

/**
 * Compact number display (e.g. 12.3K, 1.2M).
 * @param {number} num
 * @returns {string}
 */
export const formatCompactNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return String(num)
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
 * @param {string} isoDate - ISO 8601 date string
 * @returns {string}
 */
export const formatRelativeTime = (isoDate) => {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)

  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
  return `${Math.floor(seconds / 2592000)}mo ago`
}
