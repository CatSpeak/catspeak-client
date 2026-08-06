/**
 * Calendar-specific time formatters.
 *
 * These intentionally do NOT use the user's profile timezone (useTimezone hook) —
 * the Event form has its own timezone picker (`selectedTimezone`), and the time
 * the user is entering must match the timezone the event will be stored in.
 */

/**
 * Normalise a timezone prop into a string IANA id (or undefined for browser TZ).
 * The prop may be a string ("America/New_York"), an object
 * ({ id, label, offset }), null, or undefined. Anything else would make
 * Intl.DateTimeFormat throw "Invalid time zone specified: #<Object>".
 */
export const resolveTimeZone = (tz) => {
  if (!tz) return undefined
  if (typeof tz === "string") return tz
  if (typeof tz === "object") return tz.id || tz.value || tz.timeZone || undefined
  return undefined
}

/**
 * Format a Date (or Firestore Timestamp) as HH:MM (24-hour) in the given timezone.
 */
const toJsDate = (value) =>
  value && typeof value.toDate === "function" ? value.toDate() : value

export const formatTimeInZone = (date, timeZone) => {
  const d = toJsDate(date)
  if (!d) return ""
  return d.toLocaleTimeString("en-GB", {
    timeZone: resolveTimeZone(timeZone),
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}
