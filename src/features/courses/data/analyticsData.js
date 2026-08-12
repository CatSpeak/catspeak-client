const pad = (value) => String(value).padStart(2, "0")

const toDateKey = (date) => (
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
)

const toMonthKey = (date) => (
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
)

const toQuarterKey = (date) => (
  `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`
)

const parseYear = (value, fallback) => {
  const year = Number.parseInt(String(value || ""), 10)
  return Number.isInteger(year) ? year : fallback
}

const parseMonth = (value, fallbackDate) => {
  const match = /^(\d{4})-(\d{2})$/.exec(String(value || ""))
  if (!match) return new Date(fallbackDate)

  return new Date(Number(match[1]), Number(match[2]) - 1, 1)
}

const parseQuarter = (value, fallbackDate) => {
  const match = /^(\d{4})-Q([1-4])$/.exec(String(value || ""))
  if (!match) return new Date(fallbackDate)

  return new Date(Number(match[1]), (Number(match[2]) - 1) * 3, 1)
}

const getYearRange = (year) => ({
  startDate: `${year}-01-01`,
  endDate: `${year}-12-31`,
})

const getMonthRange = (monthDate) => {
  const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
  return {
    startDate: toDateKey(startDate),
    endDate: toDateKey(endDate),
  }
}

const getQuarterRange = (quarterDate) => {
  const startMonth = Math.floor(quarterDate.getMonth() / 3) * 3
  const startDate = new Date(quarterDate.getFullYear(), startMonth, 1)
  const endDate = new Date(quarterDate.getFullYear(), startMonth + 3, 0)
  return {
    startDate: toDateKey(startDate),
    endDate: toDateKey(endDate),
  }
}

const getFiveYearRange = (value, fallbackDate) => {
  const match = /^(\d{4})-(\d{4})$/.exec(String(value || ""))
  const endYear = match
    ? Number(match[2])
    : Math.floor(new Date(fallbackDate).getFullYear() / 5) * 5 + 4
  const startYear = match ? Number(match[1]) : endYear - 4

  return {
    startDate: `${startYear}-01-01`,
    endDate: `${endYear}-12-31`,
  }
}

const getLocale = (language) => {
  if (String(language || "").toLowerCase().startsWith("vi")) return "vi-VN"
  if (String(language || "").toLowerCase().startsWith("zh")) return "zh-CN"
  return "en-US"
}

const formatMonthLabel = (date, language) => (
  new Intl.DateTimeFormat(getLocale(language), {
    month: "2-digit",
    year: "numeric",
  }).format(date)
)

const formatQuarterLabel = (date, language) => {
  const quarter = Math.floor(date.getMonth() / 3) + 1
  const year = date.getFullYear()
  if (String(language || "").toLowerCase().startsWith("vi")) {
    return `Quý ${quarter}/${year}`
  }
  if (String(language || "").toLowerCase().startsWith("zh")) {
    return `${year}年第${quarter}季度`
  }
  return `Q${quarter}/${year}`
}

const getMonthOptions = (now, language) => Array.from({ length: 12 }, (_, index) => {
  const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
  return { value: toMonthKey(date), label: formatMonthLabel(date, language) }
})

const getQuarterOptions = (now, language) => Array.from({ length: 8 }, (_, index) => {
  const date = new Date(now.getFullYear(), now.getMonth() - index * 3, 1)
  return { value: toQuarterKey(date), label: formatQuarterLabel(date, language) }
})

const getYearOptions = (now) => Array.from({ length: 5 }, (_, index) => {
  const year = now.getFullYear() - index
  return { value: String(year), label: String(year) }
})

const getFiveYearOptions = (now) => {
  const currentEnd = Math.floor(now.getFullYear() / 5) * 5 + 4
  return Array.from({ length: 3 }, (_, index) => {
    const endYear = currentEnd - index * 5
    const startYear = endYear - 4
    return {
      value: `${startYear}-${endYear}`,
      label: `${startYear}–${endYear}`,
    }
  })
}

const getComparisonOptions = (periods, getPreviousValue, language) => periods.map((period) => ({
  value: getPreviousValue(period.value),
  label: formatComparisonLabel(period, getPreviousValue(period.value), language),
}))

const formatComparisonLabel = (period, previousValue, language) => {
  if (period.value.length === 4) return previousValue

  if (/^\d{4}-\d{2}$/.test(period.value)) {
    return formatMonthLabel(parseMonth(previousValue), language)
  }

  if (/^\d{4}-Q[1-4]$/.test(period.value)) {
    return formatQuarterLabel(parseQuarter(previousValue), language)
  }

  return previousValue.replace("-", "–")
}

export const getAnalyticsFilterMeta = (language, now = new Date()) => {
  const safeNow = new Date(now)
  const monthPeriods = getMonthOptions(safeNow, language)
  const quarterPeriods = getQuarterOptions(safeNow, language)
  const yearPeriods = getYearOptions(safeNow)
  const fiveYearPeriods = getFiveYearOptions(safeNow)

  return {
    day: {
      label: "day",
      periods: monthPeriods,
      comparisons: getComparisonOptions(
        monthPeriods,
        (value) => toMonthKey(new Date(parseMonth(value, safeNow).getFullYear(), parseMonth(value, safeNow).getMonth() - 1, 1)),
        language,
      ),
    },
    week: {
      label: "week",
      periods: quarterPeriods,
      comparisons: getComparisonOptions(
        quarterPeriods,
        (value) => toQuarterKey(new Date(parseQuarter(value, safeNow).getFullYear(), parseQuarter(value, safeNow).getMonth() - 3, 1)),
        language,
      ),
    },
    month: {
      label: "month",
      periods: yearPeriods,
      comparisons: getComparisonOptions(
        yearPeriods,
        (value) => String(parseYear(value, safeNow.getFullYear()) - 1),
        language,
      ),
    },
    year: {
      label: "year",
      periods: fiveYearPeriods,
      comparisons: getComparisonOptions(
        fiveYearPeriods,
        (value) => {
          const [start, end] = value.split("-").map(Number)
          return `${start - 5}-${end - 5}`
        },
        language,
      ),
    },
  }
}

// ── BR-DASH-40: dashboard → analytics scope resolution (shared auto-bucket rule) ──

export const CUSTOM_PERIOD_VALUE = "custom"
export const COMPARE_LAST_YEAR_VALUE = "__lastYear__"
export const COMPARE_PREVIOUS_VALUE = "__previous__"

const parseDateKey = (value) => {
  const s = String(value || "")
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  const iso = new Date(s)
  return isNaN(iso.getTime()) ? null : iso
}

const diffDays = (a, b) => Math.round((b - a) / 86400000)

/** Mirrors the backend trend-bucket rule: ≤31 days → day, ≤180 days → week, else month. */
export const getGroupForRange = (startDate, endDate) => {
  const start = parseDateKey(startDate)
  const end = parseDateKey(endDate)
  if (!start || !end) return "month"
  const days = diffDays(start, end) + 1
  if (days <= 31) return "day"
  if (days <= 180) return "week"
  return "month"
}

/**
 * If [startDate, endDate] is exactly one of the preset vocabulary ranges
 * (month / quarter / year / five-year), returns the matching identifier; else null.
 * Identifiers share the analytics vocabulary: "YYYY-MM" (day), "YYYY-Qn" (week),
 * "YYYY" (month), "YYYY-YYYY" (year).
 */
const periodCovering = (group, startDate, endDate) => {
  const start = parseDateKey(startDate)
  const end = parseDateKey(endDate)
  if (!start || !end) return null
  const startKey = toDateKey(start)
  const endKey = toDateKey(end)
  switch (group) {
    case "day": {
      const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
      if (start.getDate() === 1 && end.getDate() === lastDay) return toMonthKey(start)
      return null
    }
    case "week": {
      const quarterStart = new Date(start.getFullYear(), Math.floor(start.getMonth() / 3) * 3, 1)
      const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0)
      if (startKey === toDateKey(quarterStart) && endKey === toDateKey(quarterEnd)) return toQuarterKey(start)
      return null
    }
    case "month":
      if (start.getMonth() === 0 && start.getDate() === 1 && end.getMonth() === 11 && end.getDate() === 31) {
        return String(start.getFullYear())
      }
      return null
    case "year": {
      if (
        start.getMonth() === 0 && start.getDate() === 1 &&
        end.getMonth() === 11 && end.getDate() === 31 &&
        end.getFullYear() === start.getFullYear() + 4
      ) {
        return `${start.getFullYear()}-${end.getFullYear()}`
      }
      return null
    }
    default:
      return null
  }
}

/** The immediately preceding identifier of the same unit for a period identifier. */
const previousPeriodKey = (group, period) => {
  if (group === "day") {
    const date = parseMonth(period)
    return toMonthKey(new Date(date.getFullYear(), date.getMonth() - 1, 1))
  }
  if (group === "week") {
    const date = parseQuarter(period)
    return toQuarterKey(new Date(date.getFullYear(), date.getMonth() - 3, 1))
  }
  if (group === "month") return String(parseYear(period, new Date().getFullYear()) - 1)
  if (group === "year") {
    const [start, end] = String(period).split("-").map(Number)
    return `${start - 5}-${end - 5}`
  }
  return ""
}

const matchesRange = (group, period, startDate, endDate) => {
  if (!startDate || !endDate) return false
  const range = getAnalyticsDateRange(group, period)
  return range.startDate === startDate && range.endDate === endDate
}

/**
 * Computes a comparison range for custom dates.
 * "previous" = same length immediately before; "lastYear" = same calendar range one year ago.
 */
export const computeCustomCompareRange = (mode, startDate, endDate) => {
  const start = parseDateKey(startDate)
  const end = parseDateKey(endDate)
  if (!start || !end) return {}
  if (mode === "previous") {
    const days = diffDays(start, end) + 1
    return {
      customCompareStartDate: toDateKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() - days)),
      customCompareEndDate: toDateKey(new Date(end.getFullYear(), end.getMonth(), end.getDate() - days)),
    }
  }
  if (mode === "lastYear") {
    return {
      customCompareStartDate: toDateKey(new Date(start.getFullYear() - 1, start.getMonth(), start.getDate())),
      customCompareEndDate: toDateKey(new Date(end.getFullYear() - 1, end.getMonth(), end.getDate())),
    }
  }
  return {}
}

/**
 * Maps the Dashboard's resolved dates (+ compare dates) to an Analytics filter scope:
 * keeps the exact range, auto-selects the GroupBy via the shared auto-bucket rule, and
 * uses a preset identifier when the range matches the vocabulary, else the "Tùy chỉnh" option.
 * Returns null when no dates are present (keep local defaults).
 */
export const resolveAnalyticsScope = ({ startDate, endDate, compareStartDate, compareEndDate } = {}) => {
  const parsedStart = parseDateKey(startDate)
  const parsedEnd = parseDateKey(endDate)
  if (!parsedStart || !parsedEnd) return null
  startDate = toDateKey(parsedStart)
  endDate = toDateKey(parsedEnd)
  if (compareStartDate) compareStartDate = toDateKey(parseDateKey(compareStartDate))
  if (compareEndDate) compareEndDate = toDateKey(parseDateKey(compareEndDate))

  const group = getGroupForRange(startDate, endDate)
  const period = periodCovering(group, startDate, endDate)
  const hasCompare = !!(compareStartDate && compareEndDate)

  if (period) {
    const previousKey = previousPeriodKey(group, period)
    let compare = ""
    if (hasCompare) {
      if (matchesRange(group, previousKey, compareStartDate, compareEndDate)) compare = previousKey
      else {
        const lastYear = computeCustomCompareRange("lastYear", startDate, endDate)
        if (lastYear.customCompareStartDate === compareStartDate && lastYear.customCompareEndDate === compareEndDate) {
          compare = COMPARE_LAST_YEAR_VALUE
        }
      }
    }
    return {
      group,
      period,
      compare,
      customStartDate: "",
      customEndDate: "",
    }
  }

  let compare = ""
  if (hasCompare) {
    const previous = computeCustomCompareRange("previous", startDate, endDate)
    if (previous.customCompareStartDate === compareStartDate && previous.customCompareEndDate === compareEndDate) {
      compare = COMPARE_PREVIOUS_VALUE
    } else {
      const lastYear = computeCustomCompareRange("lastYear", startDate, endDate)
      if (lastYear.customCompareStartDate === compareStartDate && lastYear.customCompareEndDate === compareEndDate) {
        compare = COMPARE_LAST_YEAR_VALUE
      }
    }
  }
  return {
    group,
    period: CUSTOM_PERIOD_VALUE,
    compare,
    customStartDate: startDate,
    customEndDate: endDate,
  }
}

export const getAnalyticsDateRange = (group, value, fallbackDate = new Date()) => {
  switch (group) {
    case "day":
      return getMonthRange(parseMonth(value, fallbackDate))
    case "week":
      return getQuarterRange(parseQuarter(value, fallbackDate))
    case "month":
      return getYearRange(parseYear(value, new Date(fallbackDate).getFullYear()))
    case "year":
      return getFiveYearRange(value, fallbackDate)
    default:
      return getYearRange(new Date(fallbackDate).getFullYear())
  }
}

export const buildAnalyticsQueryParams = ({
  group,
  period,
  compare,
  courseId,
  classId,
  customStartDate,
  customEndDate,
}) => {
  const isCustom = period === CUSTOM_PERIOD_VALUE
  const isAllTime = period === "alltime"
  const groupBy = group ? group.charAt(0).toUpperCase() + group.slice(1) : "Month"
  const range = isCustom
    ? { startDate: customStartDate, endDate: customEndDate }
    : isAllTime
      ? null
      : getAnalyticsDateRange(group, period)

  const params = {
    groupBy,
    period: isCustom ? CUSTOM_PERIOD_VALUE : period,
    courseId,
    classId,
  }

  if (compare && !isAllTime && compare !== COMPARE_LAST_YEAR_VALUE && compare !== COMPARE_PREVIOUS_VALUE) {
    params.compare = compare
  } else if (compare === COMPARE_LAST_YEAR_VALUE || compare === COMPARE_PREVIOUS_VALUE) {
    const compareRange = computeCustomCompareRange(compare === COMPARE_LAST_YEAR_VALUE ? "lastYear" : "previous", range.startDate, range.endDate)
    if (compareRange.customCompareStartDate) params.compareCustomStartDate = compareRange.customCompareStartDate
    if (compareRange.customCompareEndDate) params.compareCustomEndDate = compareRange.customCompareEndDate
  }

  if (isCustom) {
    if (customStartDate) params.customStartDate = customStartDate
    if (customEndDate) params.customEndDate = customEndDate
  }

  return params
}

export const getDrillDownSelection = ({ group, period, index }) => {
  if (group !== "month") return null

  const year = parseYear(period, new Date().getFullYear())
  const month = Math.max(0, Math.min(11, Number(index) || 0))
  const selected = new Date(year, month, 1)
  const previous = new Date(year, month - 1, 1)

  return {
    group: "day",
    period: toMonthKey(selected),
    compare: toMonthKey(previous),
  }
}

export const numberVi = (value, maximumFractionDigits = 2) => (
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits }).format(value)
)

export const money = (value) => `${new Intl.NumberFormat("vi-VN").format(value)} đ`
