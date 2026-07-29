import { MessageSquare, FileText, Users, GraduationCap, PenSquare, BookOpen } from "lucide-react"
import { DEFAULT_CLASS_FEE_TIERS } from "../data/courseFormOptions.js"

const CARD_GRADIENTS = [
  "from-[#8B5CF6]/20 to-[#C084FC]/20 text-[#8B5CF6]",
  "from-[#F97316]/20 to-[#FDBA74]/20 text-[#F97316]",
  "from-[#10B981]/20 to-[#6EE7B7]/20 text-[#10B981]",
  "from-[#EC4899]/20 to-[#FBCFE8]/20 text-[#EC4899]",
  "from-[#3B82F6]/20 to-[#93C5FD]/20 text-[#3B82F6]",
]
const CARD_ICONS = [MessageSquare, FileText, Users, GraduationCap, PenSquare, BookOpen]

export function getCourseGradientAndIcon(index) {
  return {
    gradient: CARD_GRADIENTS[index % CARD_GRADIENTS.length],
    icon: CARD_ICONS[index % CARD_ICONS.length],
  }
}

export const getCourseLocale = (language) => (
  language === "vi" ? "vi-VN" : language === "zh" ? "zh-CN" : "en-US"
)

export function formatToYYYYMMDD(isoStr) {
  if (!isoStr) return ""
  try {
    // If the string contains timezone info (T, Z, +), parse as Date for local conversion
    if (isoStr.includes("T") || isoStr.includes("Z") || /[+-]\d{2}:?\d{2}$/.test(isoStr)) {
      return utcToLocalDateStr(isoStr)
    }
    // Plain date string (e.g. "2026-10-15") — return as-is
    return isoStr.split("T")[0]
  } catch {
    return ""
  }
}

/**
 * Convert a UTC ISO string from the backend into a YYYY-MM-DD string
 * in the user's local timezone. Used when populating date inputs from API data.
 *
 * Example (UTC+7): "2026-10-14T17:00:00Z" → "2026-10-15"
 *   (because 17:00 UTC = 00:00 next day in UTC+7)
 *
 * @param {string} isoStr - UTC ISO date string from the API
 * @returns {string} "YYYY-MM-DD" in local timezone, or "" if invalid
 */
export function utcToLocalDateStr(isoStr) {
  if (!isoStr) return ""
  try {
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return ""
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  } catch {
    return ""
  }
}

/**
 * Format a UTC ISO date string into a localized string without timezone shift.
 * Uses `timeZone: "UTC"` to avoid local timezone offset shifting.
 *
 * @param {string} isoStr - UTC ISO string (e.g. "2026-10-15T00:00:00Z")
 * @param {string} [locales] - Locale parameter, defaults to "en-GB"
 * @param {object} [options] - Additional Intl options
 * @param {string} [fallback] - Text returned when the date is missing or invalid
 * @returns {string} Formatted date or the provided fallback
 */
export function formatUTCDate(
  isoStr,
  locales = "en-GB",
  options = {},
  fallback = "—",
) {
  if (!isoStr) return fallback
  try {
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return fallback
    return d.toLocaleDateString(locales, {
      timeZone: "UTC",
      ...options
    })
  } catch {
    return fallback
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *  Course Utilities — Client-side business logic
 *  Based on SRS BR19 (Fee tiers) and BR11 (Currency formatting)
 *
 *  These are pure functions — no API calls needed.
 *  Scale to custom needs.
 * ═══════════════════════════════════════════════════════════════════
 */

// ─── BR19 Fee Tiers (default, can be overridden by server data) ─
/**
 * Get the fee tier for a given number of slots.
 * @param {number} slots - Number of student slots
 * @param {Array} [tiers] - Optional custom fee tiers from server
 * @returns {{ openingFee: number, commissionRate: number, minSlots: number, maxSlots: number }}
 */
export function getFeeTier(slots, tiers = DEFAULT_CLASS_FEE_TIERS) {
  const tier = tiers.find((t) => slots >= t.minSlots && slots <= t.maxSlots)
  return tier || tiers[tiers.length - 1]
}

/**
 * Get the opening fee for a given number of slots.
 * @param {number} slots
 * @param {Array} [tiers]
 * @returns {number} Opening fee in VND
 */
export function getOpeningFee(slots, tiers) {
  return getFeeTier(slots, tiers).openingFee
}

/**
 * Get the commission rate (%) for a given number of slots.
 * @param {number} slots
 * @param {Array} [tiers]
 * @returns {number} Commission rate as percentage (e.g. 10, 12, 15, 20)
 */
export function getCommissionRate(slots, tiers) {
  return getFeeTier(slots, tiers).commissionRate
}

/**
 * Calculate the net amount a teacher receives per student.
 * Formula: tuition - (tuition * commissionRate / 100)
 * @param {number} tuition - Tuition fee per student (VND)
 * @param {number} slots - Number of student slots
 * @param {Array} [tiers]
 * @returns {number} Net income per student (VND)
 */
export function calculateNetPerStudent(tuition, slots, tiers) {
  const rate = getCommissionRate(slots, tiers)
  return tuition - (tuition * rate) / 100
}

/**
 * Calculate all fee details for a class creation form.
 * @param {number} slots - Number of student slots
 * @param {number} tuitionPerStudent - Fee each student pays
 * @param {Array} [tiers]
 * @returns {{ openingFee: number, commissionRate: number, netPerStudent: number, commissionPerStudent: number }}
 */
export function calculateFees(slots, tuitionPerStudent, tiers) {
  const tier = getFeeTier(slots, tiers)
  const commissionPerStudent = (tuitionPerStudent * tier.commissionRate) / 100
  const netPerStudent = tuitionPerStudent - commissionPerStudent

  return {
    openingFee: tier.openingFee,
    commissionRate: tier.commissionRate,
    netPerStudent,
    commissionPerStudent,
  }
}

/**
 * Format a number as Vietnamese currency (BR11).
 * Uses dot (.) as thousands separator.
 * @param {number} amount - Amount in VND
 * @returns {string} Formatted string, e.g. "200.000"
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return "0"
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

/**
 * Format currency with unit suffix.
 * @param {number} amount
 * @returns {string} e.g. "200.000đ"
 */
export function formatCurrencyVND(amount) {
  return `${formatCurrency(amount)}đ`
}

/**
 * Status display config
 */
export const CLASS_STATUS_CONFIG = {
  LIVE: { bgClass: "bg-[#FFE4E6]", textClass: "text-[#E11D48]", dotClass: "bg-[#E11D48]", hasPing: true },
  TEACHING: { bgClass: "bg-[#E8F8F0]", textClass: "text-[#15803D]", dotClass: null, hasPing: false },
  OPEN: { bgClass: "bg-[#EFF6FF]", textClass: "text-[#1D4ED8]", dotClass: null, hasPing: false },
  OPEN_FOR_ENROLLMENT: { bgClass: "bg-[#EFF6FF]", textClass: "text-[#1D4ED8]", dotClass: null, hasPing: false },
  UPCOMING: { bgClass: "bg-[#EEF2FF]", textClass: "text-[#4F46E5]", dotClass: null, hasPing: false },
  ARCHIVED: { bgClass: "bg-[#F3F4F6]", textClass: "text-[#6B7280]", dotClass: null, hasPing: false },
}

/**
 * Attendance status config (BR14)
 */
export const ATTENDANCE_STATUS = {
  PRESENT: { color: "#22C55E" },
  ABSENT_EXCUSED: { color: "#3B82F6" },
  ABSENT_UNEXCUSED: { color: "#EF4444" },
}

const SHORT_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return "th"
  if (day % 10 === 1) return "st"
  if (day % 10 === 2) return "nd"
  if (day % 10 === 3) return "rd"
  return "th"
}

const formatLocalizedDay = (date, locale, dayFirst = false) => {
  if (String(locale).toLowerCase().startsWith("en")) {
    const day = date.getUTCDate()
    const month = SHORT_MONTH_NAMES[date.getUTCMonth()]
    return dayFirst
      ? `${day}${getOrdinalSuffix(day)} ${month}`
      : `${month} ${day}${getOrdinalSuffix(day)}`
  }

  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
}

// Date range formatter helper (e.g. Jan 15th - Feb 16th)
export const formatDateRange = (
  start,
  end,
  locale = "en-US",
  fallback = "—",
) => {
  if (!start || !end) return fallback

  const parseDate = (dStr) => {
    const d = new Date(dStr)
    if (isNaN(d.getTime())) return null
    return formatLocalizedDay(d, locale)
  }
  const startLabel = parseDate(start)
  const endLabel = parseDate(end)
  return startLabel && endLabel ? `${startLabel} - ${endLabel}` : fallback
}

export const formatDateDayMonth = (
  dateStr,
  locale = "en-US",
  fallback = "—",
) => {
  if (!dateStr) return fallback
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return fallback
  return formatLocalizedDay(d, locale, true)
}

export const formatTime12h = (
  timeStr,
  locale = "en-US",
  fallback = "—",
) => {
  if (!timeStr) return fallback
  const value = String(timeStr).trim()
  const twelveHourMatch = value.match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i)
  const twentyFourHourMatch = value.match(/^(\d{1,2}):(\d{2})$/)
  if (!twelveHourMatch && !twentyFourHourMatch) return fallback

  let hours
  let minutes
  if (twelveHourMatch) {
    hours = Number(twelveHourMatch[1]) % 12
    if (twelveHourMatch[3].toUpperCase() === "PM") hours += 12
    minutes = Number(twelveHourMatch[2])
  } else {
    hours = Number(twentyFourHourMatch[1])
    minutes = Number(twentyFourHourMatch[2])
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return fallback
  if (!String(locale).toLowerCase().startsWith("en")) {
    const time = new Date(Date.UTC(2000, 0, 1, hours, minutes))
    return time.toLocaleTimeString(locale, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    })
  }

  const ampm = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${ampm}`
}

export const getSafeMediaUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return null

  try {
    const trimmedValue = value.trim()
    const hasControlCharacter = [...trimmedValue].some((character) => {
      const codePoint = character.codePointAt(0)
      return codePoint <= 31 || codePoint === 127
    })
    if (hasControlCharacter || trimmedValue.startsWith("#")) return null

    const baseUrl = typeof window !== "undefined"
      ? window.location.origin
      : "https://localhost"
    const parsedUrl = new URL(trimmedValue, baseUrl)
    if (
      !["http:", "https:"].includes(parsedUrl.protocol)
      || parsedUrl.username
      || parsedUrl.password
    ) {
      return null
    }

    return parsedUrl.href
  } catch {
    return null
  }
}

export const getClassEnrollmentIssue = ({
  classData,
  enrolledClassId,
  nowMs = Date.now(),
}) => {
  if (!classData || typeof classData !== "object" || Array.isArray(classData)) {
    return "unavailable"
  }

  const classId = classData.id == null ? "" : String(classData.id)
  if (!classId) return "unavailable"

  if (
    enrolledClassId !== null
    && enrolledClassId !== undefined
    && String(enrolledClassId) !== ""
    && String(enrolledClassId) !== classId
  ) {
    return "already_enrolled_in_course"
  }

  const status = typeof classData.status === "string"
    ? classData.status.trim().toUpperCase()
    : ""
  if (!["OPEN", "OPEN_FOR_ENROLLMENT"].includes(status)) {
    return status ? "not_open" : "unavailable"
  }

  const enrolledCountValue = (
    classData.enrolledCount
    ?? classData.studentCount
    ?? classData.enrolledStudents
  )
  const capacityValue = classData.capacity ?? classData.slots
  const enrolledCount = Number(enrolledCountValue)
  const capacity = Number(capacityValue)
  const hasEnrolledCount = (
    enrolledCountValue !== null
    && enrolledCountValue !== undefined
    && enrolledCountValue !== ""
  )
  const hasCapacity = (
    capacityValue !== null
    && capacityValue !== undefined
    && capacityValue !== ""
  )
  if (
    (hasEnrolledCount && (!Number.isFinite(enrolledCount) || enrolledCount < 0))
    || (hasCapacity && (!Number.isFinite(capacity) || capacity < 0))
  ) {
    return "unavailable"
  }
  if (
    hasEnrolledCount
    && hasCapacity
    && Number.isFinite(enrolledCount)
    && Number.isFinite(capacity)
    && capacity >= 0
    && enrolledCount >= capacity
  ) {
    return "full"
  }

  const hasEnrollmentStart = Boolean(classData.enrollmentStart)
  const enrollmentStartMs = new Date(classData.enrollmentStart || "").getTime()
  if (hasEnrollmentStart && !Number.isFinite(enrollmentStartMs)) {
    return "unavailable"
  }
  if (Number.isFinite(enrollmentStartMs) && nowMs < enrollmentStartMs) {
    return "not_started"
  }

  const hasEnrollmentEnd = Boolean(classData.enrollmentEnd)
  const enrollmentEndMs = new Date(classData.enrollmentEnd || "").getTime()
  if (hasEnrollmentEnd && !Number.isFinite(enrollmentEndMs)) {
    return "unavailable"
  }
  if (Number.isFinite(enrollmentEndMs) && nowMs > enrollmentEndMs) {
    return "closed"
  }

  return null
}

export const getClassEnrollmentIssueMessage = (issue, studentText = {}) => {
  const messages = {
    already_enrolled_in_course:
      studentText.alreadyEnrolledInCourse,
    not_open:
      studentText.enrollmentNotOpen,
    full:
      studentText.classFull,
    not_started:
      studentText.enrollmentNotStarted,
    closed:
      studentText.enrollmentClosed,
    unavailable:
      studentText.enrollmentUnavailable,
  }
  return messages[issue] || messages.unavailable || ""
}

export const getClassEnrollmentIssueLabel = (issue, studentText = {}) => {
  const labels = {
    already_enrolled_in_course:
      studentText.alreadyEnrolled,
    not_open:
      studentText.notOpen,
    full:
      studentText.full,
    not_started:
      studentText.notStarted,
    closed:
      studentText.closed,
    unavailable:
      studentText.unavailable,
  }
  return labels[issue] || labels.unavailable || ""
}

export const formatFileSize = (bytes) => {
  const value = Number(bytes)
  if (!Number.isFinite(value) || value <= 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.min(
    sizes.length - 1,
    Math.floor(Math.log(value) / Math.log(k)),
  )
  return `${parseFloat((value / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export const getFileIconColorClass = (fileName) => {
  const ext = fileName?.split(".").pop()?.toLowerCase() || ""
  if (ext === "pdf") return "text-rose-500"
  if (["doc", "docx"].includes(ext)) return "text-blue-500"
  if (["xls", "xlsx"].includes(ext)) return "text-emerald-500"
  if (["png", "jpg", "jpeg", "gif", "svg"].includes(ext)) return "text-violet-500"
  return "text-gray-500"
}
