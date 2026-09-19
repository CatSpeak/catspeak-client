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
