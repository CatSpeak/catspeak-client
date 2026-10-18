import dayjs from "dayjs"
import utc from "dayjs/plugin/utc.js"
import timezone from "dayjs/plugin/timezone.js"

dayjs.extend(utc)
dayjs.extend(timezone)

export const RECURRENCE_DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
export const MAX_CLASS_SESSIONS = 500
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/

export function parseCalendarDate(value) {
  if (!DATE_PATTERN.test(value || "")) throw new Error("Enter a valid calendar date.")
  const date = new Date(`${value}T00:00:00Z`)
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error("Enter a valid calendar date.")
  return date
}

// Resolve each wall-clock occurrence independently. Reject both missing and
// ambiguous DST times instead of silently moving a lesson or choosing an offset.
export function classTimeToIso(date, time, zone) {
  parseCalendarDate(date)
  if (!TIME_PATTERN.test(time || "")) throw new Error("Enter a valid teaching time.")
  const wall = `${date}T${time}:00`
  const parsed = dayjs.tz(wall, zone)
  if (parsed.format("YYYY-MM-DDTHH:mm:ss") !== wall) throw new Error(`Teaching time does not exist in ${zone} on ${date}.`)
  const offsets = new Set([-1, 0, 1].map(days => dayjs(parsed.valueOf() + days * 86400000).tz(zone).utcOffset()))
  const candidates = [...offsets].map(offset => Date.parse(`${wall}Z`) - offset * 60000)
    .filter(ms => dayjs(ms).tz(zone).format("YYYY-MM-DDTHH:mm:ss") === wall)
  if (candidates.length !== 1) throw new Error(`Teaching time is ambiguous in ${zone} on ${date}. Choose another time.`)
  return new Date(candidates[0]).toISOString()
}

export function generateClassRecurrence({ startDate, sessions, checkedDays, timeSlots, recurrence = {}, timeZone = "Asia/Ho_Chi_Minh" }) {
  const start = parseCalendarDate(startDate)
  new Intl.DateTimeFormat("en", { timeZone }).format(start)
  const frequency = recurrence.frequency || "weekly"
  const interval = Number(recurrence.interval ?? 1)
  const endCondition = recurrence.endCondition || "count"
  if (!["daily", "weekly"].includes(frequency) || !Number.isInteger(interval) || interval < 1 || interval > 52) throw new Error("Recurrence interval must be a whole number from 1 to 52.")
  if (!["count", "until"].includes(endCondition)) throw new Error("Choose a valid recurrence end condition.")
  const count = Number(sessions)
  if (endCondition === "count" && (!Number.isInteger(count) || count < 1 || count > MAX_CLASS_SESSIONS)) throw new Error(`Choose between 1 and ${MAX_CLASS_SESSIONS} sessions.`)
  const until = endCondition === "until" ? parseCalendarDate(recurrence.endDate) : null
  if (until && until < start) throw new Error("Recurrence end date must be on or after the start date.")
  if (until && (until - start) / 86400000 > 1826) throw new Error("Recurrence must end within five years.")
  const activeDays = RECURRENCE_DAYS.filter(day => checkedDays?.[day])
  if (!activeDays.length) throw new Error("Select at least one teaching day.")
  if (frequency === "daily" && activeDays.length !== 7) throw new Error("Daily recurrence requires all weekdays.")
  const startWeekday = (start.getUTCDay() + 6) % 7
  const dates = []
  for (let offset = 0; offset <= 1826; offset++) {
    const date = new Date(start.getTime() + offset * 86400000)
    if (until && date > until) break
    const dayKey = RECURRENCE_DAYS[date.getUTCDay()]
    const matches = frequency === "daily" ? offset % interval === 0 : Math.floor((offset + startWeekday) / 7) % interval === 0
    if (!matches || !checkedDays[dayKey]) continue
    const slot = timeSlots?.[dayKey]
    if (!TIME_PATTERN.test(slot?.start || "") || !TIME_PATTERN.test(slot?.end || "") || slot.start >= slot.end) throw new Error("Each class must end after it starts on the same local day.")
    const dateStr = date.toISOString().slice(0, 10)
    const startTime = classTimeToIso(dateStr, slot.start, timeZone)
    const endTime = classTimeToIso(dateStr, slot.end, timeZone)
    dates.push({ dateStr, dayKey, dayNum: date.getUTCDate(), monthNum: date.getUTCMonth() + 1, yearNum: date.getUTCFullYear(), startTime, endTime })
    if (dates.length > MAX_CLASS_SESSIONS) throw new Error(`A class can contain at most ${MAX_CLASS_SESSIONS} sessions.`)
    if (!until && dates.length === count) break
  }
  if (!dates.length || (!until && dates.length !== count)) throw new Error("The recurrence cannot produce the requested sessions within five years.")
  if (dates[0].dateStr !== startDate) throw new Error("Choose a start date that falls on a selected teaching weekday.")
  return dates
}

export function normalizeClassInvitees(ids, ownerId) {
  if (!Array.isArray(ids)) throw new Error("Choose valid student accounts.")
  const parsed = ids.map(Number)
  if (parsed.some(id => !Number.isSafeInteger(id) || id <= 0 || id === Number(ownerId))) throw new Error("Choose valid student accounts other than the class owner.")
  const unique = [...new Set(parsed)]
  if (unique.length > 50) throw new Error("You can invite at most 50 students during creation.")
  return unique
}

// The existing class API stores a weekly UTC template, without a recurrence
// interval or per-occurrence time zone. Block incompatible saves explicitly.
export function assertExistingScheduleSupport(recurrence, dates, timeZone) {
  if (Number(recurrence.interval ?? 1) !== 1) throw new Error("This recurrence interval is preview only. Choose an interval of one to create the class.")
  const offsets = new Set(dates.flatMap(date => [date.startTime, date.endTime].map(instant => dayjs(instant).tz(timeZone).utcOffset())))
  if (offsets.size > 1) throw new Error("The current class schedule cannot preserve local teaching times across a clock change. Choose dates within one time-zone offset.")
}
