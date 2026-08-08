import { useSelector } from "react-redux"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { getBrowserTimeZone } from "@/shared/constants/timezones"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  getDisplayLocale,
  getUserLocale,
  formatInTimeZone,
  formatRelativeTime,
  convertTimeStrToTz,
  ensureDate,
  formatScheduleDays as formatScheduleDaysUtil,
  formatWeeklyScheduleText,
} from "@/shared/utils/dateUtils"

dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * Primary React hook for timezone-aware date & time operations.
 * Resolves user timezone from Redux auth state or browser fallback.
 */
export const useTimezone = () => {
  const user = useSelector((state) => state.auth?.user)
  const { language } = useLanguage()
  const userTimeZone = user?.timeZone || getBrowserTimeZone() || "Asia/Ho_Chi_Minh"
  const locale = getDisplayLocale(language) || getUserLocale()

  /** Format to date string e.g. "09/08/2026" */
  const formatDate = (date) =>
    formatInTimeZone(date, userTimeZone, { year: "numeric", month: "2-digit", day: "2-digit" }, locale)

  /** Format to 24-hour time string e.g. "17:15" */
  const formatTime = (date) =>
    formatInTimeZone(date, userTimeZone, { hour: "2-digit", minute: "2-digit", hour12: false }, locale)

  /** Format to date and time string e.g. "09/08/2026, 17:15" */
  const formatDateTime = (date) =>
    formatInTimeZone(date, userTimeZone, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }, locale)

  /** Format relative time e.g. "Just now", "5m", "2h" */
  const formatRelative = (date) =>
    formatRelativeTime(date, userTimeZone, language)

  /** Format short month and day e.g. "9 Aug" */
  const formatDateMonth = (date, fallback = "—") =>
    formatInTimeZone(date, userTimeZone, { day: "numeric", month: "short" }, locale) || fallback

  /** Convert HH:mm string to user timezone */
  const formatScheduleTime = (timeStr) =>
    convertTimeStrToTz(timeStr, userTimeZone)

  /** Format array of schedule days (e.g. ['MON', 'WED']) with timezone day-shifting */
  const formatScheduleDays = (days, fallback = "—", separator = " - ", startTime = null) =>
    formatScheduleDaysUtil(days, language, fallback, separator, userTimeZone, startTime)

  /** Format complete weekly schedule text (e.g. "Chủ nhật (03:00 - 06:30)") */
  const formatWeeklySchedule = (classData, fallback = "—") =>
    formatWeeklyScheduleText(classData, language, fallback, userTimeZone)

  /** Custom Intl.DateTimeFormat with custom options */
  const formatCustom = (date, options = {}) =>
    formatInTimeZone(date, userTimeZone, options, locale)

  /**
   * Safely build or update a JS Date object in the user's TimeZone.
   * Preserves existing date when changing time, and existing time when changing date.
   *
   * @param {Date|string|number} currentDate - The current Date value (if any)
   * @param {Date|string|number} [newDatePart] - New date selected from DatePicker
   * @param {string} [newTimeStr] - New time selected from TimeDropdown ("HH:mm")
   * @returns {Date} Clean JS Date object
   */
  const buildDateTimeInZone = (currentDate, newDatePart, newTimeStr) => {
    const tz = userTimeZone

    let dateStr = ""
    if (newDatePart) {
      const d = ensureDate(newDatePart)
      if (d) {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        dateStr = `${y}-${m}-${day}`
      } else {
        dateStr = dayjs().tz(tz).format("YYYY-MM-DD")
      }
    } else if (currentDate) {
      const d = ensureDate(currentDate)
      dateStr = d ? dayjs(d).tz(tz).format("YYYY-MM-DD") : dayjs().tz(tz).format("YYYY-MM-DD")
    } else {
      dateStr = dayjs().tz(tz).format("YYYY-MM-DD")
    }

    let timeStr = ""
    if (newTimeStr && typeof newTimeStr === "string" && newTimeStr.includes(":")) {
      timeStr = newTimeStr.trim()
    } else if (currentDate) {
      const d = ensureDate(currentDate)
      timeStr = d ? dayjs(d).tz(tz).format("HH:mm") : "00:00"
    } else {
      timeStr = "00:00"
    }

    return dayjs.tz(`${dateStr}T${timeStr}:00`, tz).toDate()
  }

  return {
    userTimeZone,
    locale,
    language,
    formatDate,
    formatTime,
    formatDateTime,
    formatRelative,
    formatDateMonth,
    formatScheduleTime,
    formatScheduleDays,
    formatWeeklySchedule,
    formatCustom,
    buildDateTimeInZone,
  }
}

export default useTimezone
