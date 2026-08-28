/**
 * Voucher Data Transformers & Formatters
 */

/**
 * Format currency amount into Vietnamese Dong (e.g., 200.000 ₫)
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return "0 ₫"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format discount label (e.g., "Giảm 20%" or "Giảm 200.000 ₫")
 */
export const formatDiscountBadgeText = (voucher) => {
  if (!voucher) return ""
  const isPercent =
    voucher.discountType === "Percentage" || voucher.discountType === 1
  if (isPercent) {
    return `-${voucher.discountValue}%`
  }
  return `-${formatCurrency(voucher.discountValue)}`
}

/**
 * Format scope label
 */
export const formatScopeLabel = (scopeType, t = null) => {
  const d = t?.vouchers?.detail || {}
  switch (scopeType) {
    case "SpecificCourses":
    case 2:
      return d.specificCourse || "Khóa học chỉ định"
    case "SpecificClasses":
    case 3:
      return d.specificClass || "Lớp học chỉ định"
    case "All":
    case 1:
      return d.allClassesOrCourses || "Toàn bộ lớp / khóa"
    default:
      return "-"
  }
}

/**
 * Format ISO date string into readable local date
 */
export const formatVoucherDate = (isoString, includeTime = false) => {
  if (!isoString) return "-"
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return "-"

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()

  if (includeTime) {
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes} ${day}/${month}/${year}`
  }

  return `${day}/${month}/${year}`
}

/**
 * Format a raw number or string into thousand-separated string (e.g., "10000000" -> "10.000.000")
 */
export const formatNumberWithDots = (val) => {
  if (val === null || val === undefined || val === "") return ""
  const cleanNum = String(val).replace(/\D/g, "")
  if (!cleanNum) return ""
  return new Intl.NumberFormat("vi-VN").format(Number(cleanNum))
}

/**
 * Parse a thousand-separated string back to raw digits (e.g., "10.000.000" -> "10000000")
 */
export const parseFormattedNumber = (val) => {
  if (val === null || val === undefined) return ""
  return String(val).replace(/\D/g, "")
}
