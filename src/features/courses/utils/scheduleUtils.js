import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

export {
  getLocalizedDayName,
  getShiftedDayOfWeek,
  formatScheduleDays,
  formatWeeklyScheduleText,
  convertTimeStrToTz,
} from "@/shared/utils/dateUtils"

export const DAY_MAP = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
}

export const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

/**
 * Computes all session dates for a class given a startDate, total session count, selected days of week, and user timezone.
 */
export const computeClassScheduleDates = (
  startDate,
  sessions = 0,
  checkedDays = {},
  userTimeZone = "Asia/Ho_Chi_Minh"
) => {
  const totalSessions = Math.max(0, parseInt(sessions, 10) || 0)
  if (!startDate || totalSessions <= 0) return []

  const activeDays = Object.keys(checkedDays || {}).filter((k) => checkedDays[k])
  if (activeDays.length === 0) return []

  const tz = userTimeZone || "Asia/Ho_Chi_Minh"
  const cleanDate = typeof startDate === "string" ? startDate.split("T")[0] : startDate
  let curr = dayjs.tz(cleanDate, tz).startOf("day")
  if (!curr.isValid()) return []

  const list = []
  let safety = 0

  while (list.length < totalSessions && safety < 1500) {
    safety++
    const dayKey = DAY_MAP[curr.day()]
    if (checkedDays[dayKey]) {
      list.push({
        dateStr: curr.format("YYYY-MM-DD"),
        dayKey,
        dayNum: curr.date(),
        monthNum: curr.month() + 1,
        yearNum: curr.year(),
      })
    }
    curr = curr.add(1, "day")
  }

  return list
}
