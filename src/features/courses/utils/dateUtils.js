export const toLocalDateString = (date) => {
  if (!date) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export const parseLocalDateString = (value) => {
  if (!value) return null

  const [year, month, day] = value.split("-").map(Number)
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null

  return new Date(year, month - 1, day)
}

export const toDueDateIso = (dateValue, timeValue) => {
  const date = parseLocalDateString(dateValue)
  if (!date || !timeValue) return null

  const [hours, minutes] = timeValue.split(":").map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null

  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}
