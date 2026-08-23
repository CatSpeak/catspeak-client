export const ALL_COURSES_VALUE = "__all_courses__"
export const ALL_CLASSES_VALUE = "__all_classes__"
export const UNASSIGNED_VALUE = "__unassigned__"

export const PRESET_OPTIONS = [
  { value: "today", key: "today" },
  { value: "week", key: "week" },
  { value: "month", key: "month" },
  { value: "quarter", key: "quarter" },
  { value: "year", key: "year" },
  { value: "custom", key: "custom" },
  { value: "all", key: "all" },
]

export const COMPARE_OPTIONS = [
  { value: "prev", key: "previous" },
  { value: "year", key: "lastYear" },
  { value: "none", key: "none" },
]

const pad2 = (n) => String(n).padStart(2, "0")

export const formatDateStr = (d) => {
  if (!d) return ""
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return ""
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`
}

export const formatDateIso = (d) => {
  if (!d) return ""
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return ""
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export const getPresetDateRange = (preset, now = new Date(), labels = {}) => {
  const d = new Date(now)
  const y = d.getFullYear()
  const m = d.getMonth()
  const day = d.getDate()

  switch (preset) {
    case "today": {
      const today = new Date(y, m, day)
      return {
        startDate: formatDateIso(today),
        endDate: formatDateIso(today),
        display: `${formatDateStr(today)} – ${formatDateStr(today)}`,
      }
    }
    case "week": {
      const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1 // Mon=0 .. Sun=6
      const startOfWeek = new Date(y, m, day - dayOfWeek)
      const endOfWeek = new Date(y, m, day + (6 - dayOfWeek))
      return {
        startDate: formatDateIso(startOfWeek),
        endDate: formatDateIso(endOfWeek),
        display: `${formatDateStr(startOfWeek)} – ${formatDateStr(endOfWeek)}`,
      }
    }
    case "month": {
      const startOfMonth = new Date(y, m, 1)
      const endOfMonth = new Date(y, m + 1, 0)
      return {
        startDate: formatDateIso(startOfMonth),
        endDate: formatDateIso(endOfMonth),
        display: `${formatDateStr(startOfMonth)} – ${formatDateStr(endOfMonth)}`,
      }
    }
    case "quarter": {
      const qStartMonth = Math.floor(m / 3) * 3
      const startOfQ = new Date(y, qStartMonth, 1)
      const endOfQ = new Date(y, qStartMonth + 3, 0)
      return {
        startDate: formatDateIso(startOfQ),
        endDate: formatDateIso(endOfQ),
        display: `${formatDateStr(startOfQ)} – ${formatDateStr(endOfQ)}`,
      }
    }
    case "year": {
      const startOfYear = new Date(y, 0, 1)
      const endOfYear = new Date(y, 11, 31)
      return {
        startDate: formatDateIso(startOfYear),
        endDate: formatDateIso(endOfYear),
        display: `${formatDateStr(startOfYear)} – ${formatDateStr(endOfYear)}`,
      }
    }
    case "all":
      return {
        startDate: null,
        endDate: null,
        display: labels.allTime || "Toàn bộ thời gian",
      }
    default:
      return {
        startDate: null,
        endDate: null,
        display: labels.selectedPeriod || "Theo kỳ đã chọn",
      }
  }
}

export const getCompareOptionsForPreset = (preset, translations = {}, language = "vi") => {
  const t = translations || {}
  const lang = String(language || "vi").toLowerCase()
  const isZh = lang.startsWith("zh")
  const isEn = lang.startsWith("en")

  const noComp = t.none || (isZh ? "不对比" : isEn ? "No Comparison" : "Không so sánh")
  const lastYear = t.samePeriodLastYear || (isZh ? "去年同期" : isEn ? "Same Period Last Year" : "Cùng kỳ năm trước")
  const yesterday = t.yesterday || (isZh ? "昨天 (上一周期)" : isEn ? "Yesterday (Previous Period)" : "Hôm qua (Kỳ trước)")
  const sameDayLastYear = t.sameDayLastYear || (isZh ? "去年同日" : isEn ? "Same Day Last Year" : "Cùng ngày năm trước")
  const lastWeek = t.lastWeek || (isZh ? "上周 (上一周期)" : isEn ? "Last Week (Previous Period)" : "Tuần trước (Kỳ trước)")
  const lastMonth = t.lastMonth || (isZh ? "上月 (上一周期)" : isEn ? "Last Month (Previous Period)" : "Tháng trước (Kỳ trước)")
  const lastQuarter = t.lastQuarter || (isZh ? "上季度 (上一周期)" : isEn ? "Last Quarter (Previous Period)" : "Quý trước (Kỳ trước)")
  const prevYear = t.lastYear || (isZh ? "去年 (上一周期)" : isEn ? "Last Year (Previous Period)" : "Năm trước (Kỳ trước)")
  const prevPeriod = t.previous || (isZh ? "上一周期" : isEn ? "Previous Period" : "Kỳ liền trước")

  switch (preset) {
    case "today":
      return [
        { value: "prev", label: yesterday },
        { value: "year", label: sameDayLastYear },
        { value: "none", label: noComp },
      ]
    case "week":
      return [
        { value: "prev", label: lastWeek },
        { value: "year", label: lastYear },
        { value: "none", label: noComp },
      ]
    case "month":
      return [
        { value: "prev", label: lastMonth },
        { value: "year", label: lastYear },
        { value: "none", label: noComp },
      ]
    case "quarter":
      return [
        { value: "prev", label: lastQuarter },
        { value: "year", label: lastYear },
        { value: "none", label: noComp },
      ]
    case "year":
      return [
        { value: "prev", label: prevYear },
        { value: "none", label: noComp },
      ]
    case "all":
      return [{ value: "none", label: noComp }]
    case "custom":
    default:
      return [
        { value: "prev", label: prevPeriod },
        { value: "year", label: lastYear },
        { value: "none", label: noComp },
      ]
  }
}
