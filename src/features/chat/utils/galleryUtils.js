/**
 * Formatting utilities for shared media, files, voice recordings, and links.
 */

export const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return ""
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export const formatDuration = (seconds) => {
  if (!seconds || !Number.isFinite(seconds) || isNaN(seconds) || seconds < 0)
    return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? "0" : ""}${s}`
}

export const getDomain = (url) => {
  if (!url) return ""
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`)
    return parsed.hostname.replace(/^www\./, "")
  } catch {
    return ""
  }
}
