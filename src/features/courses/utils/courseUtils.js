import { MessageSquare, FileText, Users, GraduationCap, PenSquare, BookOpen } from "lucide-react"
import { DEFAULT_CLASS_FEE_TIERS } from "../data/courseFormOptions.js"
import defaultCourseThumbnail from "@/shared/assets/backgrounds/background-account.png"
import { ensureDate } from "@/shared/utils/dateUtils"

export { defaultCourseThumbnail, defaultCourseThumbnail as DEFAULT_COURSE_THUMBNAIL }

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
    const d = ensureDate(isoStr)
    return d ? d.toISOString().split("T")[0] : ""
  } catch {
    return ""
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
  nowMs = Date.now(),
}) => {
  if (!classData || typeof classData !== "object" || Array.isArray(classData)) {
    return "unavailable"
  }

  const classId = classData.id == null ? "" : String(classData.id)
  if (!classId) return "unavailable"

  const status = typeof classData.status === "string"
    ? classData.status.trim().toUpperCase()
    : ""
  const closedStatuses = ["CLOSED", "ARCHIVED", "COMPLETED", "CANCELLED"]
  if (status && closedStatuses.includes(status)) {
    return "closed"
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
    && capacity > 0
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
    return "closed"
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
      studentText.alreadyEnrolledInCourse || "You are already enrolled in a class for this course.",
    not_open:
      studentText.enrollmentNotOpen || "Class enrollment is not open.",
    full:
      studentText.classFull || "This class is full.",
    not_started:
      studentText.enrollmentClosed || studentText.closed || "Enrollment for this class has closed.",
    closed:
      studentText.enrollmentClosed || studentText.closed || "Enrollment for this class has closed.",
    unavailable:
      studentText.enrollmentUnavailable || "Class is not available for enrollment.",
  }
  return messages[issue] || messages.unavailable || "Class is not available for enrollment."
}

export const getClassEnrollmentIssueLabel = (issue, studentText = {}) => {
  const labels = {
    already_enrolled_in_course:
      studentText.alreadyEnrolled || "Already enrolled",
    not_open:
      studentText.notOpen || "Not open",
    full:
      studentText.full || "Full",
    not_started:
      studentText.closed || "Closed",
    closed:
      studentText.closed || "Closed",
    unavailable:
      studentText.unavailable || "Unavailable",
  }
  return labels[issue] || labels.unavailable || "Unavailable"
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
