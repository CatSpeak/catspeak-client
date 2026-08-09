export const TIMEZONE_LABELS = {
  vi: {
    "Asia/Ho_Chi_Minh": "Hà Nội, Bangkok (UTC+7)",
    "UTC": "Giờ chuẩn quốc tế (UTC+0)",
    "Asia/Tokyo": "Tokyo, Seoul (UTC+9)",
    "Asia/Singapore": "Singapore, Bắc Kinh (UTC+8)",
    "Asia/Dubai": "Dubai, Abu Dhabi (UTC+4)",
    "Europe/London": "London, Dublin (UTC+0)",
    "Europe/Paris": "Paris, Berlin (UTC+1)",
    "America/New_York": "New York (UTC-5)",
    "America/Chicago": "Chicago (UTC-6)",
    "America/Denver": "Denver (UTC-7)",
    "America/Los_Angeles": "Los Angeles (UTC-8)",
    "Australia/Sydney": "Sydney (UTC+10)",
  },
  en: {
    "Asia/Ho_Chi_Minh": "Hanoi, Bangkok (UTC+7)",
    "UTC": "Universal Coordinated Time (UTC+0)",
    "Asia/Tokyo": "Tokyo, Seoul (UTC+9)",
    "Asia/Singapore": "Singapore, Beijing (UTC+8)",
    "Asia/Dubai": "Dubai, Abu Dhabi (UTC+4)",
    "Europe/London": "London, Dublin (UTC+0)",
    "Europe/Paris": "Paris, Berlin (UTC+1)",
    "America/New_York": "New York (UTC-5)",
    "America/Chicago": "Chicago (UTC-6)",
    "America/Denver": "Denver (UTC-7)",
    "America/Los_Angeles": "Los Angeles (UTC-8)",
    "Australia/Sydney": "Sydney (UTC+10)",
  },
  zh: {
    "Asia/Ho_Chi_Minh": "河内, 曼谷 (UTC+7)",
    "UTC": "协调世界时 (UTC+0)",
    "Asia/Tokyo": "东京, 首尔 (UTC+9)",
    "Asia/Singapore": "新加坡, 北京 (UTC+8)",
    "Asia/Dubai": "迪拜, 阿布扎比 (UTC+4)",
    "Europe/London": "伦敦, 都柏林 (UTC+0)",
    "Europe/Paris": "巴黎, 柏林 (UTC+1)",
    "America/New_York": "纽约 (UTC-5)",
    "America/Chicago": "芝加哥 (UTC-6)",
    "America/Denver": "丹佛 (UTC-7)",
    "America/Los_Angeles": "洛杉矶 (UTC-8)",
    "Australia/Sydney": "悉尼 (UTC+10)",
  },
}

export const getTimezoneOptions = (lang = "vi") => {
  const code = String(lang || "vi").toLowerCase()
  const key = code.startsWith("zh") ? "zh" : code.startsWith("en") ? "en" : "vi"
  const dict = TIMEZONE_LABELS[key] || TIMEZONE_LABELS.vi
  return Object.keys(TIMEZONE_LABELS.vi).map((value) => ({
    value,
    label: dict[value] || TIMEZONE_LABELS.vi[value],
  }))
}

/** All timezone ids (IANA), useful for lookups (e.g. "is this a known TZ?") */
export const TIMEZONE_IDS = Object.keys(TIMEZONE_LABELS.vi)

/**
 * Return the UTC offset label (e.g. "UTC+7") for a given IANA id.
 * Uses Intl.DateTimeFormat to compute the offset dynamically, so DST-aware.
 */
export const getTimezoneOffset = (id) => {
  if (!id) return ""
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: id,
      timeZoneName: "shortOffset",
    })
    const parts = formatter.formatToParts(new Date())
    const offset = parts.find((p) => p.type === "timeZoneName")?.value || ""
    return offset.replace(/^GMT/, "UTC")
  } catch {
    return id
  }
}

export const TIMEZONE_OPTIONS = getTimezoneOptions("vi")

export const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh"

export const getBrowserTimeZone = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz && TIMEZONE_IDS.includes(tz)) {
      return tz
    }
  } catch {}
  return DEFAULT_TIMEZONE
}
