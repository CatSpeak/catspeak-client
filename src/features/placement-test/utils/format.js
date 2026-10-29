export const formatTemplate = (template, tokens = {}) =>
  Object.entries(tokens).reduce(
    (result, [key, value]) => result.split(`{{${key}}}`).join(String(value)),
    String(template || ""),
  )

export const formatClock = (ms = 0) => {
  const totalSeconds = Math.max(0, Math.round((Number(ms) || 0) / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export const formatDate = (value) => {
  const date = value instanceof Date ? value : new Date(Number(value))
  if (Number.isNaN(date.getTime())) return ""
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${day}/${month}/${date.getFullYear()}`
}

export const formatDurationShort = (ms) => {
  const totalMinutes = Math.max(0, Math.floor((Number(ms) || 0) / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`
  return `${minutes}m`
}

export const formatExpiryStamp = (value) => {
  const date = value instanceof Date ? value : new Date(Number(value))
  if (Number.isNaN(date.getTime())) return ""
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${hours}:${minutes} - ${day}/${month}/${date.getFullYear()}`
}
