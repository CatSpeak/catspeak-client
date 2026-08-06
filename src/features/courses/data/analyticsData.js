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
}) => {
  const selectedRange = getAnalyticsDateRange(group, period)
  const comparisonRange = getAnalyticsDateRange(group, compare)

  return {
    groupBy: group ? group.charAt(0).toUpperCase() + group.slice(1) : "Month",
    startDate: selectedRange.startDate,
    endDate: selectedRange.endDate,
    compareStartDate: comparisonRange.startDate,
    compareEndDate: comparisonRange.endDate,
    courseId,
    classId,
  }
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
