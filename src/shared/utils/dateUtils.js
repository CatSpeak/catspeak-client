import {
  DEFAULT_TIMEZONE,
  getBrowserTimeZone,
} from "@/shared/constants/timezones";
import dayjs from "dayjs";

/**
 * Get the user's locale from the browser (fallback to 'en-US')
 */
export const getUserLocale = () => {
  return navigator.language || navigator.userLanguage || "en-US";
};

/**
 * Resolve a short language code (e.g. "vi", "zh", "en") to a BCP-47 locale tag
 */
export const getDisplayLocale = (language) => {
  if (!language) return undefined;
  const l = String(language).toLowerCase();
  if (l.startsWith("vi")) return "vi-VN";
  if (l.startsWith("zh")) return "zh-CN";
  if (l.startsWith("en")) return "en-US";
  return undefined;
};

/**
 * Safely coerce a value to a Date, returning null if missing or invalid.
 * Handles ISO strings missing 'Z' suffix gracefully.
 */
export const ensureDate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    let str = value.trim();
    if (
      str.includes("T") &&
      !str.endsWith("Z") &&
      !/[+-]\d{2}:?\d{2}$/.test(str)
    ) {
      str += "Z";
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Convert ISO date/time string from server into a Date object suitable for DatePicker in user's TimeZone
 */
export const parseIsoToZoneDate = (isoString, userTimeZone = null) => {
  const d = ensureDate(isoString);
  if (!d) return null;
  const tz = userTimeZone || DEFAULT_TIMEZONE;
  const formattedInZone = dayjs(d).tz(tz).format("YYYY-MM-DDTHH:mm:ss");
  const [datePart, timePart] = formattedInZone.split("T");
  const [y, m, day] = datePart.split("-").map(Number);
  const [h, min, s] = timePart.split(":").map(Number);
  return new Date(y, m - 1, day, h, min, s);
};

/**
 * Core formatter: Format a date in a specific IANA TimeZone with Intl options
 */
export const formatInTimeZone = (
  date,
  timeZone,
  options = {},
  locale = getUserLocale(),
) => {
  const d = ensureDate(date);
  if (!d) return "";
  const tz = timeZone || getBrowserTimeZone();
  return new Intl.DateTimeFormat(locale, {
    ...(tz ? { timeZone: tz } : {}),
    ...options,
  }).format(d);
};

/**
 * Legacy alias for formatInTimeZone (backwards compatibility)
 */
export const formatInUserTimeZone = formatInTimeZone;

/**
 * Format a date to localized date string
 */
export const formatDate = (date, locale = getUserLocale(), timeZone = null) => {
  return formatInTimeZone(
    date,
    timeZone,
    { year: "numeric", month: "2-digit", day: "2-digit" },
    locale,
  );
};

/**
 * Format a date to localized time string (HH:mm)
 */
export const formatTime = (date, locale = getUserLocale(), timeZone = null) => {
  return formatInTimeZone(
    date,
    timeZone,
    { hour: "2-digit", minute: "2-digit", hour12: false },
    locale,
  );
};

/**
 * Format a date to localized date and time string
 */
export const formatDateTime = (
  date,
  locale = getUserLocale(),
  timeZone = null,
) => {
  return formatInTimeZone(
    date,
    timeZone,
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
    locale,
  );
};

/**
 * Format relative time string (e.g. Just now / Vừa xong, 5m, 2h, or formatted date)
 */
export const formatRelativeTime = (
  timestamp,
  userTimeZone = null,
  language = "en",
) => {
  const date = ensureDate(timestamp);
  if (!date) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  const loc = getDisplayLocale(language) || getUserLocale();

  if (diffMins < 1) {
    if (String(language).startsWith("vi")) return "Vừa xong";
    if (String(language).startsWith("zh")) return "刚刚";
    return "Just now";
  }
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) {
    return formatInTimeZone(date, userTimeZone, { weekday: "short" }, loc);
  }
  return formatInTimeZone(
    date,
    userTimeZone,
    { month: "short", day: "numeric" },
    loc,
  );
};

/**
 * Convert HH:mm time string to target TimeZone (e.g. "14:30" -> formatted HH:mm in target TZ)
 */
export const convertTimeStrToTz = (timeStr, userTimeZone = null) => {
  if (!timeStr) return "";
  const str = String(timeStr).trim();
  if (!str) return "";

  // If it's a full ISO timestamp string (e.g. "2026-08-10T11:00:00Z")
  if (str.includes("T") || (str.length >= 19 && str.includes("-"))) {
    const d = ensureDate(str);
    if (d) {
      return formatInTimeZone(d, userTimeZone, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  }

  const match = str.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return str;

  if (!userTimeZone) return str.slice(0, 5);

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const now = new Date();
  const utcDate = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hours,
      minutes,
    ),
  );

  return utcDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: userTimeZone,
  });
};

/**
 * Calculate end date based on start date and duration in minutes
 */
export const calculateEndDate = (startDate, durationMinutes) => {
  const start = ensureDate(startDate);
  if (!start) return new Date();
  return new Date(start.getTime() + durationMinutes * 60000);
};

/**
 * Format a date as YYYY-MM-DD in the specified TimeZone
 */
export const getDateKeyInTz = (date, userTimeZone = null) => {
  const d = ensureDate(date);
  if (!d) return "";
  const tz = userTimeZone || DEFAULT_TIMEZONE;
  return d.toLocaleDateString("en-CA", { timeZone: tz });
};

const DAY_NAMES_BY_LANGUAGE = {
  vi: {
    MON: "Thứ 2",
    TUE: "Thứ 3",
    WED: "Thứ 4",
    THU: "Thứ 5",
    FRI: "Thứ 6",
    SAT: "Thứ 7",
    SUN: "Chủ nhật",
  },
  zh: {
    MON: "周一",
    TUE: "周二",
    WED: "周三",
    THU: "周四",
    FRI: "周五",
    SAT: "周六",
    SUN: "周日",
  },
  en: {
    MON: "Mon",
    TUE: "Tue",
    WED: "Wed",
    THU: "Thu",
    FRI: "Fri",
    SAT: "Sat",
    SUN: "Sun",
  },
};

const normalizeDay = (day) => String(day || "").toUpperCase();

export const getLocalizedDayName = (day, language = "en") => {
  const languageKey = String(language || "en")
    .split("-")[0]
    .toLowerCase();
  const dayNames =
    DAY_NAMES_BY_LANGUAGE[languageKey] || DAY_NAMES_BY_LANGUAGE.en;
  const normalizedDay = normalizeDay(day);
  return dayNames[normalizedDay] || normalizedDay;
};

const REFERENCE_DATES = {
  SUN: "2026-08-02",
  MON: "2026-08-03",
  TUE: "2026-08-04",
  WED: "2026-08-05",
  THU: "2026-08-06",
  FRI: "2026-08-07",
  SAT: "2026-08-08",
};

const INDEX_DAY = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const getShiftedDayOfWeek = (
  dayOfWeek,
  startTime,
  userTimeZone,
  sourceTimeZone = "UTC",
) => {
  const normDay = normalizeDay(dayOfWeek);
  if (!normDay || !REFERENCE_DATES[normDay] || !startTime) return normDay;

  const targetTz = userTimeZone || DEFAULT_TIMEZONE;
  const sourceTz = sourceTimeZone || "UTC";

  if (targetTz === sourceTz) return normDay;

  const match = String(startTime).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return normDay;

  const hrs = String(match[1]).padStart(2, "0");
  const mins = String(match[2]).padStart(2, "0");
  const refDateStr = REFERENCE_DATES[normDay];

  const sourceDate = dayjs.tz(`${refDateStr}T${hrs}:${mins}:00`, sourceTz);
  const targetDate = sourceDate.tz(targetTz);
  const targetDayIdx = targetDate.day();
  return INDEX_DAY[targetDayIdx] || normDay;
};

export const formatScheduleDays = (
  days,
  language = "en",
  fallback = "—",
  separator = " - ",
  userTimeZone = null,
  startTime = null,
  sourceTimeZone = "UTC",
) => {
  if (!Array.isArray(days) || days.length === 0) return fallback;
  const formattedDays = days
    .map((day) => {
      const shifted = getShiftedDayOfWeek(
        day,
        startTime,
        userTimeZone,
        sourceTimeZone,
      );
      return getLocalizedDayName(shifted, language);
    })
    .filter(Boolean);
  return formattedDays.length > 0 ? formattedDays.join(separator) : fallback;
};

export const formatWeeklyScheduleText = (
  classData,
  language = "en",
  fallback = "—",
  userTimeZone = null,
) => {
  let scheduleItems = null;
  const classTz = "UTC";

  if (
    Array.isArray(classData?.rawSchedule) &&
    classData.rawSchedule.length > 0
  ) {
    scheduleItems = classData.rawSchedule;
  } else if (Array.isArray(classData?.schedule)) {
    scheduleItems = classData.schedule;
  }

  if (scheduleItems && scheduleItems.length > 0) {
    const groups = scheduleItems.reduce((acc, item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return acc;
      const rawStart = typeof item.startTime === "string" ? item.startTime : "";
      const rawEnd = typeof item.endTime === "string" ? item.endTime : "";
      const start = convertTimeStrToTz(rawStart, userTimeZone, classTz);
      const end = convertTimeStrToTz(rawEnd, userTimeZone, classTz);
      const timeKey = start && end ? `${start} - ${end}` : "";
      const shiftedDay = getShiftedDayOfWeek(
        item.dayOfWeek,
        rawStart,
        userTimeZone,
        classTz,
      );
      const dayLabel = getLocalizedDayName(shiftedDay, language);
      if (!dayLabel) return acc;

      if (!acc.has(timeKey)) {
        acc.set(timeKey, []);
      }
      acc.get(timeKey).push(dayLabel);

      return acc;
    }, new Map());

    const formattedGroups = [...groups.entries()]
      .map(([timeKey, days]) =>
        timeKey ? `${days.join(", ")} (${timeKey})` : days.join(", "),
      )
      .filter(Boolean)
      .join("; ");
    if (formattedGroups) return formattedGroups;
  }

  const schedule = classData?.schedule;
  if (!schedule || typeof schedule !== "object" || Array.isArray(schedule)) {
    return fallback;
  }

  const { days, startTime, endTime } = schedule;
  if (!Array.isArray(days) || days.length === 0) {
    return fallback;
  }

  const start = convertTimeStrToTz(startTime, userTimeZone, classTz);
  const end = convertTimeStrToTz(endTime, userTimeZone, classTz);
  const timeText = start && end ? `${start} - ${end}` : "";

  const formattedDays = days
    .map((day) => {
      const shiftedDay = getShiftedDayOfWeek(
        day,
        startTime,
        userTimeZone,
        classTz,
      );
      return getLocalizedDayName(shiftedDay, language);
    })
    .join(", ");

  return timeText ? `${formattedDays} (${timeText})` : formattedDays;
};
