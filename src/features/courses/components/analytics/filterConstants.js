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

export const getPresetDateRange = (preset, now = new Date()) => {
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
        display: "Toàn bộ thời gian",
      }
    default:
      return {
        startDate: null,
        endDate: null,
        display: "Theo kỳ đã chọn",
      }
  }
}

export const getCompareOptionsForPreset = (preset, translations = {}) => {
  const t = translations || {}
  const noComp = t.none || "Không so sánh"
  const lastYear = t.samePeriodLastYear || "Cùng kỳ năm trước"

  switch (preset) {
    case "today":
      return [
        { value: "prev", label: t.yesterday || "Hôm qua (Kỳ trước)" },
        { value: "year", label: t.sameDayLastYear || "Cùng ngày năm trước" },
        { value: "none", label: noComp },
      ]
    case "week":
      return [
        { value: "prev", label: t.lastWeek || "Tuần trước" },
        { value: "year", label: lastYear },
        { value: "none", label: noComp },
      ]
    case "month":
      return [
        { value: "prev", label: t.lastMonth || "Tháng trước" },
        { value: "year", label: lastYear },
        { value: "none", label: noComp },
      ]
    case "quarter":
      return [
        { value: "prev", label: t.lastQuarter || "Quý trước" },
        { value: "year", label: lastYear },
        { value: "none", label: noComp },
      ]
    case "year":
      return [
        { value: "prev", label: t.lastYear || "Năm trước" },
        { value: "none", label: noComp },
      ]
    case "all":
      return [{ value: "none", label: noComp }]
    case "custom":
    default:
      return [
        { value: "prev", label: t.previous || "Kỳ liền trước" },
        { value: "year", label: lastYear },
        { value: "none", label: noComp },
      ]
  }
}
