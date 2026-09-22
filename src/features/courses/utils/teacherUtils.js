/**
 * Utilities for Teacher Exploration & Public Profile
 */

/**
 * BR-EX-GV-01: Lấy 2 chữ cái đầu viết hoa cho avatar mặc định
 * Quy tắc: Ký tự đầu tiên của từ đầu + ký tự đầu tiên của từ cuối
 * Ví dụ: "Nguyễn Bình" -> "NB", "Lâm Gia Bảo" -> "LB", "Emma Johnson" -> "EJ"
 */
export const getTeacherInitials = (name) => {
  if (!name || typeof name !== "string") return "GV"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "GV"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  const first = parts[0].charAt(0)
  const last = parts[parts.length - 1].charAt(0)
  return (first + last).toUpperCase()
}

/**
 * BR-EX-GV-03: Chuyên môn của giảng viên với fallback nếu trống
 */
export const getTeacherHeadline = (teacher, fallbackText = "Giảng viên ngôn ngữ") => {
  if (teacher?.headline && teacher.headline.trim()) {
    return teacher.headline.trim()
  }
  if (Array.isArray(teacher?.languages) && teacher.languages.length > 0) {
    const langs = teacher.languages
      .map((l) => (typeof l === "string" ? l : l?.name || l?.languageName))
      .filter(Boolean)
      .join(", ")
    if (langs) {
      return `Giảng viên ${langs}`
    }
  }
  return fallbackText
}

/**
 * Định dạng số với dấu chấm phân cách hàng nghìn (ví dụ 1240 -> "1.240")
 */
export const formatTeacherNumber = (num) => {
  if (num == null || isNaN(Number(num))) return "0"
  return Number(num).toLocaleString("vi-VN")
}

/**
 * BR-EX-GV-04: Format rating 1 chữ số thập phân
 */
export const formatRating = (rating) => {
  if (rating == null || isNaN(Number(rating))) return "5.0"
  const val = Number(rating)
  return val.toFixed(1)
}

/**
 * BR-EX-GV-08: Màu trạng thái số chỗ còn lại
 * - Còn > 5 chỗ: Xanh lá ("green", #10B981)
 * - Còn 1 - 5 chỗ: Vàng cam ("yellow", #F59E0B)
 * - Hết chỗ (0): Đỏ ("red", #DC2626)
 */
export const getSlotStatusColor = (remainingSlots) => {
  const slots = Number(remainingSlots) || 0
  if (slots > 5) {
    return {
      status: "green",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      hex: "#10B981",
    }
  }
  if (slots >= 1) {
    return {
      status: "yellow",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      hex: "#F59E0B",
    }
  }
  return {
    status: "red",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    hex: "#DC2626",
  }
}

/**
 * Format giá tiền VNĐ (ví dụ 900000 -> "900.000đ")
 */
export const formatTeacherPrice = (price) => {
  if (price == null || isNaN(Number(price))) return "0đ"
  const val = Number(price)
  if (val === 0) return "Miễn phí"
  return `${val.toLocaleString("vi-VN")}đ`
}

