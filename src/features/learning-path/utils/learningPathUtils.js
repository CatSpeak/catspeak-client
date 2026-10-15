/**
 * Parses Chinese topic title into Hanzi, Pinyin, and Vietnamese meaning
 * Common formats:
 * - "打招呼 (Dǎzhāohu) - Chào hỏi"
 * - "自我介绍 - Giới thiệu bản thân"
 * - "你好 (Nǐ hǎo)"
 * - "Topic 1"
 */
export const parseTopic = (title = "", description = "") => {
  if (!title) {
    return {
      hanzi: "Luyện nói",
      pinyin: "",
      vietnamese: description || "Chủ đề luyện nói",
    }
  }

  // Check format: "Hanzi (Pinyin) - Meaning"
  const fullMatch = title.match(/^([^(–—:-]+)\s*(?:\(([^)]+)\))?\s*(?:[-–—:]\s*(.+))?$/)

  if (fullMatch) {
    const hanzi = (fullMatch[1] || "").trim()
    const pinyin = (fullMatch[2] || "").trim()
    const vietnamese = (fullMatch[3] || description || "").trim()

    return {
      hanzi: hanzi || title,
      pinyin,
      vietnamese: vietnamese || description || "",
    }
  }

  // Fallback: split by hyphen
  if (title.includes("-")) {
    const [part1, ...rest] = title.split("-")
    return {
      hanzi: part1.trim(),
      pinyin: "",
      vietnamese: rest.join("-").trim() || description || "",
    }
  }

  return {
    hanzi: title,
    pinyin: "",
    vietnamese: description || "",
  }
}

/**
 * Formats level string into user-friendly Vietnamese label
 */
export const getLevelName = (level = "") => {
  const normalized = (level || "").toUpperCase().trim()
  switch (normalized) {
    case "HSK 1":
    case "HSK1":
      return "Sơ cấp 1 (Khởi động)"
    case "HSK 2":
    case "HSK2":
      return "Sơ cấp 2 (Cơ bản)"
    case "HSK 3":
    case "HSK3":
      return "Trung cấp 1 (Giao tiếp)"
    case "HSK 4":
    case "HSK4":
      return "Trung cấp 2 (Thảo luận)"
    case "HSK 5":
    case "HSK5":
      return "Cao cấp 1 (Lưu loát)"
    case "HSK 6":
    case "HSK6":
      return "Cao cấp 2 (Thành thạo)"
    default:
      return "Lộ trình cá nhân"
  }
}

/**
 * Formats seconds into HH:mm:ss or "X giờ Y phút"
 */
export const formatResetsIn = (totalSeconds) => {
  if (!totalSeconds || totalSeconds <= 0) return "00:00:00"

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  const pad = (n) => String(n).padStart(2, "0")
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

/**
 * Category metadata for badges
 */
export const getCategoryBadgeInfo = (category) => {
  const cat = String(category || "").toLowerCase()
  if (cat === "0" || cat === "newlearning") {
    return {
      label: "Mới",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      textColor: "text-emerald-700 dark:text-emerald-300",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      dotColor: "bg-emerald-500",
    }
  }
  if (cat === "1" || cat === "spacedreview") {
    return {
      label: "Ôn tập",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
      textColor: "text-indigo-700 dark:text-indigo-300",
      borderColor: "border-indigo-200 dark:border-indigo-800",
      dotColor: "bg-indigo-500",
    }
  }
  if (cat === "2" || cat === "highpriorityremediation") {
    return {
      label: "Ưu tiên",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      textColor: "text-amber-700 dark:text-amber-300",
      borderColor: "border-amber-200 dark:border-amber-800",
      dotColor: "bg-amber-500",
    }
  }

  return {
    label: "Luyện tập",
    bgColor: "bg-gray-50 dark:bg-gray-800",
    textColor: "text-gray-700 dark:text-gray-300",
    borderColor: "border-gray-200 dark:border-gray-700",
    dotColor: "bg-gray-400",
  }
}
