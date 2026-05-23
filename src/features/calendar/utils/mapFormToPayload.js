import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

/** Maps Vietnamese recurrence label → API frequency string */
const RECURRENCE_MAP = {
  "Hàng ngày": "DAILY",
  "Hàng tuần": "WEEKLY",
  "Hàng tháng": "MONTHLY",
  "Hàng năm": "YEARLY",
  "Tùy chỉnh...": "WEEKLY", // custom weekly by default
}

/** Maps Vietnamese visibility label → API visibilityScope string */
const VISIBILITY_MAP = {
  "Công khai": "PUBLIC",
  "Chỉ những người có link": "SHARED_LINK_ONLY",
  // "Cộng đồng": "COMMUNITY_ONLY",  // not yet supported by backend
}

/** Maps numeric weekday index (0=Mon) → API byWeekDay string */
const WEEKDAY_CODES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

/**
 * @param {object} form – shape returned from useEventForm
 * @returns {object} – API request body for POST /api/v1/Events
 */
export const mapFormToPayload = ({
  title,
  description,
  eventLocation,
  countryId,
  cityId,
  eventColor,
  maxParticipants,
  visibility,
  startTime,
  endTime,
  recurrenceOption,
  selectedDays,
  recurrenceEndDate,
  selectedTimezone,
  conditionsInput,
  recurrenceInterval,
}) => {
  /** Split "cond1, cond2" → [{ conditionType:'', category:'', title:'cond1', description:'' }, …] */
  const conditions = (conditionsInput || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((title) => ({
      conditionType: "",
      category: "",
      title,
      description: "",
    }))
  const isRecurring = recurrenceOption !== "Không lặp lại"
  const frequency = RECURRENCE_MAP[recurrenceOption] ?? null

  const timezoneId = selectedTimezone?.id || "Asia/Bangkok"

  // Helper to convert a local dayjs object to a UTC ISO string, assuming
  // the user's input time was meant for the selected timezone.
  const toUtcInTimezone = (dateObj) => {
    if (!dateObj) return null
    // Get the exact string the user meant (e.g. "2026-05-23T10:17:31")
    const dateString = dayjs(dateObj).format("YYYY-MM-DDTHH:mm:ss")
    // Parse that exact string into the selected timezone
    return dayjs.tz(dateString, timezoneId).toISOString()
  }

  const payload = {
    title,
    description,
    location: eventLocation,
    countryId: Number(countryId),
    cityId: Number(cityId),
    color: eventColor,
    maxParticipants: Number(maxParticipants),
    visibilityScope: VISIBILITY_MAP[visibility] ?? visibility,
    timezone: timezoneId,
    isRecurring,
    startTime: isRecurring ? null : toUtcInTimezone(startTime),
    endTime: isRecurring ? null : toUtcInTimezone(endTime),
    conditions,
  }

  if (isRecurring && frequency) {
    payload.recurrenceRule = {
      frequency,
      interval: Number(recurrenceInterval) || 1,
      byWeekDay:
        frequency === "WEEKLY"
          ? selectedDays.map((d) => WEEKDAY_CODES[d] ?? d)
          : [],
      ...(frequency === "MONTHLY" && {
        byMonthDay: [dayjs(startTime).date()],
      }),
      // Assuming backend wants local time string for rule bounds if timezone is provided
      startTime: dayjs(startTime).format("HH:mm:ss"),
      endTime: dayjs(endTime).format("HH:mm:ss"),
      recurrenceStartDate: toUtcInTimezone(startTime),
      recurrenceEndDate: recurrenceEndDate ? toUtcInTimezone(recurrenceEndDate) : null,
      endCondition: recurrenceEndDate ? "UNTIL_DATE" : "NEVER",
      timeZone: timezoneId,
    }
  }

  return payload
}
