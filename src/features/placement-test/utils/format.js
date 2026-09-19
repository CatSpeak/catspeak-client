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
