import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

export const toLocalDateString = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export const parseLocalDateString = (value, timeValue = "00:00") => {
  if (typeof value !== "string") return null
  const cleanDate = value.split("T")[0]
  const match = cleanDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  let hours = 0
  let minutes = 0
  if (typeof timeValue === "string") {
    const timeMatch = timeValue.match(/^([01]\d|2[0-3]):([0-5]\d)$/)
    if (timeMatch) {
      hours = Number(timeMatch[1])
      minutes = Number(timeMatch[2])
    }
  }

  const date = new Date(year, month - 1, day, hours, minutes, 0, 0)
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null
  }

  return date
}

export const toDueDateIso = (dateValue, timeValue, userTimeZone = null) => {
  if (!dateValue || !timeValue) return null
  const dateStr = typeof dateValue === "string" ? dateValue.split("T")[0] : toLocalDateString(dateValue)
  if (typeof timeValue !== "string") return null
  const timeMatch = timeValue.match(/^([01]\d|2[0-3]):([0-5]\d)$/)
  if (!dateStr || !timeMatch) return null

  const tz = userTimeZone || "Asia/Ho_Chi_Minh"
  return dayjs.tz(`${dateStr}T${timeMatch[1]}:${timeMatch[2]}:00`, tz).toISOString()
}
