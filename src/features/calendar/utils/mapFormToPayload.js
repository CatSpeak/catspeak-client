import dayjs from "dayjs"

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

  const payload = {
    title,
    description,
    location: eventLocation,
    countryId: Number(countryId),
    cityId: Number(cityId),
    color: eventColor,
    maxParticipants: Number(maxParticipants),
    visibilityScope: VISIBILITY_MAP[visibility] ?? visibility,
    isRecurring,
    startTime: dayjs(startTime).toISOString(),
    endTime: dayjs(endTime).toISOString(),
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
      startTime: dayjs(startTime).format("HH:mm:ss"),
      endTime: dayjs(endTime).format("HH:mm:ss"),
      recurrenceStartDate: dayjs(startTime).toISOString(),
      recurrenceEndDate: dayjs(recurrenceEndDate).toISOString(),
      timeZone: selectedTimezone?.id ?? "Asia/Bangkok",
    }
  }

  return payload
}
