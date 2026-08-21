import { useSelector } from "react-redux";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useLanguage } from "@/shared/context/LanguageContext";
import {
  getDisplayLocale,
  getUserLocale,
  formatInTimeZone,
  formatRelativeTime,
  convertTimeStrToTz,
  convertTimeStrToUtc,
  getShiftedDayOfWeek,
  ensureDate,
  formatScheduleDays as formatScheduleDaysUtil,
  formatWeeklyScheduleText,
  parseIsoToZoneDate as parseIsoToZoneDateUtil,
} from "@/shared/utils/dateUtils";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Primary React hook for timezone-aware date & time operations.
 * Resolves user timezone from Redux auth state or browser fallback.
 */
export const useTimezone = () => {
  const user = useSelector((state) => state.auth?.user);
  const { language } = useLanguage();
  const rawTz = user?.timeZone || user?.timezone;
  const userTimeZone = rawTz || "Asia/Ho_Chi_Minh";
  const locale = getDisplayLocale(language) || getUserLocale();

  /** Format to date string e.g. "09/08/2026" */
  const formatDate = (date) =>
    formatInTimeZone(
      date,
      userTimeZone,
      { year: "numeric", month: "2-digit", day: "2-digit" },
      locale,
    );

  /** Format to 24-hour time string e.g. "17:15" */
  const formatTime = (date) =>
    formatInTimeZone(
      date,
      userTimeZone,
      { hour: "2-digit", minute: "2-digit", hour12: false },
      locale,
    );

  /** Format to date and time string e.g. "12/08/2026, 22:21" */
  const formatDateTime = (date) => {
    const d = formatDate(date);
    if (!d) return "";
    const t = formatTime(date);
    return `${d}, ${t}`;
  };

  /** Format relative time e.g. "Just now", "5m", "2h" */
  const formatRelative = (date) =>
    formatRelativeTime(date, userTimeZone, language);

  /** Format short month and day e.g. "9 Aug", optionally combining date + time for timezone day-shifting */
  const formatDateMonth = (date, fallback = "—", timeStr = null) => {
    let dateTarget = date;
    if (
      typeof date === "string" &&
      date.match(/^\d{4}-\d{2}-\d{2}$/) &&
      typeof timeStr === "string" &&
      timeStr.match(/^\d{1,2}:\d{2}/)
    ) {
      dateTarget = `${date.trim()}T${timeStr.trim().slice(0, 5)}`;
    }
    return (
      formatInTimeZone(
        dateTarget,
        userTimeZone,
        { day: "numeric", month: "short" },
        locale,
      ) || fallback
    );
  };

  /** Convert HH:mm string to user timezone with optional date context */
  const formatScheduleTime = (timeStr, dateStr = null) => {
    if (!timeStr) return "";
    const str = String(timeStr).trim();
    if (str.includes("T")) {
      const d = ensureDate(str);
      if (d) {
        return formatInTimeZone(
          d,
          userTimeZone,
          { hour: "2-digit", minute: "2-digit", hour12: false },
          locale,
        );
      }
    }
    if (
      dateStr &&
      typeof dateStr === "string" &&
      dateStr.match(/^\d{4}-\d{2}-\d{2}$/) &&
      str.match(/^\d{1,2}:\d{2}/)
    ) {
      const timeMatch = str.match(/(\d{1,2}:\d{2})/);
      const timePart = timeMatch ? timeMatch[1].padStart(5, "0") : "00:00";
      const isoStr = `${dateStr.trim()}T${timePart}:00Z`;
      const d = ensureDate(isoStr);
      if (d) {
        return formatInTimeZone(
          d,
          userTimeZone,
          { hour: "2-digit", minute: "2-digit", hour12: false },
          locale,
        );
      }
    }
    return convertTimeStrToTz(timeStr, userTimeZone);
  };

  /** Format array of schedule days (e.g. ['MON', 'WED']) with timezone day-shifting */
  const formatScheduleDays = (
    days,
    fallback = "—",
    separator = " - ",
    startTime = null,
  ) =>
    formatScheduleDaysUtil(
      days,
      language,
      fallback,
      separator,
      userTimeZone,
      startTime,
    );

  /** Format complete weekly schedule text (e.g. "Chủ nhật (03:00 - 06:30)") */
  const formatWeeklySchedule = (classData, fallback = "—") =>
    formatWeeklyScheduleText(classData, language, fallback, userTimeZone);

  /** Custom Intl.DateTimeFormat with custom options */
  const formatCustom = (date, options = {}) =>
    formatInTimeZone(date, userTimeZone, options, locale);

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
    const tz = userTimeZone;

    let dateStr = "";
    if (newDatePart) {
      const d = ensureDate(newDatePart);
      if (d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        dateStr = `${y}-${m}-${day}`;
      } else {
        dateStr = dayjs().tz(tz).format("YYYY-MM-DD");
      }
    } else if (currentDate) {
      const d = ensureDate(currentDate);
      dateStr = d
        ? dayjs(d).tz(tz).format("YYYY-MM-DD")
        : dayjs().tz(tz).format("YYYY-MM-DD");
    } else {
      dateStr = dayjs().tz(tz).format("YYYY-MM-DD");
    }

    let timeStr = "";
    if (
      newTimeStr &&
      typeof newTimeStr === "string" &&
      newTimeStr.includes(":")
    ) {
      timeStr = newTimeStr.trim();
    } else if (currentDate) {
      const d = ensureDate(currentDate);
      timeStr = d ? dayjs(d).tz(tz).format("HH:mm") : "00:00";
    } else {
      timeStr = "00:00";
    }

    return dayjs.tz(`${dateStr}T${timeStr}:00`, tz).toDate();
  };

  /** Convert date (YYYY-MM-DD or Date) and optional time (HH:mm) to UTC ISO string interpreted in user's TimeZone */
  const toIsoInZone = (dateVal, timeVal = null) => {
    if (!dateVal) return null;
    let cleanDate = "";
    if (typeof dateVal === "string") {
      cleanDate = dateVal.split("T")[0];
    } else if (dateVal instanceof Date) {
      const d = ensureDate(dateVal);
      cleanDate = d ? dayjs(d).tz(userTimeZone).format("YYYY-MM-DD") : "";
    }
    if (!cleanDate || !cleanDate.match(/^\d{4}-\d{2}-\d{2}$/)) return null;

    let cleanTime = "00:00";
    if (typeof timeVal === "string" && timeVal.includes(":")) {
      const timeMatch = timeVal.match(/(\d{1,2}:\d{2})/);
      if (timeMatch) cleanTime = timeMatch[1].padStart(5, "0");
    } else if (typeof dateVal === "string" && dateVal.includes("T")) {
      const timeMatch = dateVal.split("T")[1]?.match(/(\d{1,2}:\d{2})/);
      if (timeMatch) cleanTime = timeMatch[1].padStart(5, "0");
    }

    return dayjs.tz(`${cleanDate}T${cleanTime}:00`, userTimeZone).toISOString();
  };

  /** Convert ISO date/time string from server into a Date object suitable for DatePicker in user's TimeZone */
  const parseIsoToZoneDate = (isoString) =>
    parseIsoToZoneDateUtil(isoString, userTimeZone);

  /** Get formatted YYYY-MM-DD date string in user's TimeZone for an ISO string or Date + Time */
  const getZoneDateStr = (isoOrDate, timeStr = null) => {
    if (!isoOrDate) return "";
    let rawIso = isoOrDate;
    if (
      typeof isoOrDate === "string" &&
      isoOrDate.match(/^\d{4}-\d{2}-\d{2}$/) &&
      typeof timeStr === "string" &&
      timeStr.match(/^\d{1,2}:\d{2}/)
    ) {
      const timeMatch = timeStr.match(/(\d{1,2}:\d{2})/);
      const timePart = timeMatch ? timeMatch[1].padStart(5, "0") : "00:00";
      rawIso = `${isoOrDate.trim()}T${timePart}:00Z`;
    }
    const d = parseIsoToZoneDateUtil(rawIso, userTimeZone);
    if (!d || isNaN(d.getTime())) {
      return typeof isoOrDate === "string" ? isoOrDate.slice(0, 10) : "";
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

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
    convertTimeToUtc: (timeStr) => convertTimeStrToUtc(timeStr, userTimeZone),
    getShiftedDayToUtc: (dayOfWeek, timeStr) =>
      getShiftedDayOfWeek(dayOfWeek, timeStr, "UTC", userTimeZone),
    buildDateTimeInZone,
    toIsoInZone,
    parseIsoToZoneDate,
    getZoneDateStr,
  };
};

export default useTimezone;
