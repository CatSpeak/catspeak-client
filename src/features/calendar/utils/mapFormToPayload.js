import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/** Maps numeric weekday index (0=Mon) → API byWeekDay string */
const WEEKDAY_CODES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

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
  isOnline,
  maxParticipants,
  visibility,
  startTime,
  endTime,
  recurrenceOption,
  selectedDays,
  recurrenceEndDate,
  recurrenceEndType,
  occurrenceCount,
  selectedTimezone,
  conditionsInput,
  recurrenceInterval,
  originalStartTime,
  originalEndTime,
}) => {
  /** Split "cond1, cond2" → [{ conditionType:'', category:'', title:'cond1', description:'' }, …] */
  const conditions = (conditionsInput || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((title) => ({
      conditionType: "GENERAL",
      category: "",
      title,
      description: "",
    }));
  const isRecurring = recurrenceOption !== "NONE";
  const frequency = recurrenceOption === "CUSTOM" ? "WEEKLY" : recurrenceOption;

  const timezoneId = selectedTimezone?.id || "Asia/Ho_Chi_Minh";

  // Helper to convert a local dayjs object to a UTC ISO string, assuming
  // the user's input time was meant for the selected timezone.
  const toUtcInTimezone = (dateObj) => {
    if (!dateObj) return null;
    // Get the exact string the user meant (e.g. "2026-05-23T10:17:31")
    const dateString = dayjs(dateObj).format("YYYY-MM-DDTHH:mm:ss");
    // Parse that exact string into the selected timezone
    return dayjs.tz(dateString, timezoneId).toISOString();
  };

  const payload = {
    title,
    description,
    location: eventLocation,
    countryId: Number(countryId),
    cityId: Number(cityId),
    color: eventColor,
    isOnline: !!isOnline,
    maxParticipants: Number(maxParticipants),
    visibilityScope: visibility,
    timezone: timezoneId,
    isRecurring,
    startTime: toUtcInTimezone(startTime),
    endTime: toUtcInTimezone(endTime),
    originalStartTime: toUtcInTimezone(originalStartTime || startTime),
    originalEndTime: toUtcInTimezone(originalEndTime || endTime),
    conditions,
  };

  if (isRecurring && frequency) {
    payload.recurrenceRule = {
      frequency,
      interval: Number(recurrenceInterval) || 1,
      byWeekDay:
        frequency === "WEEKLY"
          ? selectedDays.map((d) => WEEKDAY_CODES[d] ?? d)
          : [],
      ...(frequency === "MONTHLY" && {
        byMonthDay: dayjs(startTime).date(),
      }),
      // Convert the absolute UTC string into a UTC dayjs object and extract its HH:mm:ss
      startTime: toUtcInTimezone(startTime),
      endTime: toUtcInTimezone(endTime),
      recurrenceStartDate: toUtcInTimezone(startTime),
      recurrenceEndDate:
        recurrenceEndType === "DATE" && recurrenceEndDate
          ? toUtcInTimezone(recurrenceEndDate)
          : null,
      endCondition:
        recurrenceEndType === "COUNT"
          ? "OCCURRENCE_COUNT"
          : recurrenceEndDate
            ? "UNTIL_DATE"
            : "NEVER",
      occurrenceCount:
        recurrenceEndType === "COUNT" ? Number(occurrenceCount) : 0,
      timeZone: timezoneId,
    };
  }

  return payload;
};

export const objectToFormData = (obj, formData = new FormData(), parentKey = "") => {
  if (obj === null || obj === undefined) return formData;

  if (obj instanceof Date) {
    formData.append(parentKey, obj.toISOString());
  } else if (obj instanceof File || obj instanceof Blob) {
    formData.append(parentKey, obj);
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      objectToFormData(item, formData, `${parentKey}[${index}]`);
    });
  } else if (typeof obj === "object") {
    Object.keys(obj).forEach((key) => {
      // Don't capitalize if it's already a specific C# expectation? Wait, ASP.NET model binding is case-insensitive usually.
      // But standard is capitalize first letter just in case.
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      const formattedKey = parentKey ? `${parentKey}.${capitalizedKey}` : capitalizedKey;
      objectToFormData(obj[key], formData, formattedKey);
    });
  } else {
    formData.append(parentKey, obj.toString());
  }
  return formData;
};
