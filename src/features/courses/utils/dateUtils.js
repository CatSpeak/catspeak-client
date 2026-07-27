export const toLocalDateString = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export const parseLocalDateString = (value) => {
  if (typeof value !== "string") return null
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null
  }

  return date
}

export const toDueDateIso = (dateValue, timeValue) => {
  const date = parseLocalDateString(dateValue)
  if (!date || !timeValue) return null

  if (typeof timeValue !== "string") return null
  const timeMatch = timeValue.match(/^([01]\d|2[0-3]):([0-5]\d)$/)
  if (!timeMatch) return null
  const hours = Number(timeMatch[1])
  const minutes = Number(timeMatch[2])

  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}
