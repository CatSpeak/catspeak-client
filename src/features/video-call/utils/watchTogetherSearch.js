import { parseYouTubeUrl } from "@/shared/utils/linkUtils"

/**
 * Input that looks like a pasted link (with or without a scheme) must never be
 * sent to the YouTube keyword search — either it plays immediately or it
 * reports an inline error.
 */
const URL_LIKE_PATTERN =
  /^(?:[a-z][a-z0-9+.-]*:\/\/|www\.|(?:m\.)?youtube\.com\/|youtu\.be\/|youtube-nocookie\.com\/)/i

/**
 * Trims and collapses whitespace; the same normalized form is used by the API
 * for the 30-minute cache key.
 */
export const normalizeSearchQuery = (raw) =>
  typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : ""

/**
 * Classifies the unified watch-together input:
 * - `"empty"`       nothing to submit
 * - `"url"`         valid playable YouTube link → start playback
 * - `"invalid_url"` pasted link that is not a playable YouTube video
 * - `"search"`      keyword(s) → YouTube search
 */
export const classifyWatchInput = (raw) => {
  const value = typeof raw === "string" ? raw.trim() : ""
  if (!value) return "empty"
  if (!URL_LIKE_PATTERN.test(value)) return "search"

  const parsed = parseYouTubeUrl(value)
  return parsed.isYouTube && parsed.videoId ? "url" : "invalid_url"
}
