/**
 * Format seconds into MM:SS or HH:MM:SS
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "—"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

/**
 * Format bytes into human-readable size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) return "—"
  const mb = bytes / (1024 * 1024)
  if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`
  return `${mb.toFixed(1)} MB`
}

/**
 * Format ISO date string to a readable format
 */
export const formatDate = (isoString) => {
  if (!isoString) return "—"
  const date = new Date(isoString)
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
