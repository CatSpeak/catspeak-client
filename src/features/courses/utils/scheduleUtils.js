const DAY_NAMES_BY_LANGUAGE = {
  vi: {
    MON: "Th\u1ee9 2",
    TUE: "Th\u1ee9 3",
    WED: "Th\u1ee9 4",
    THU: "Th\u1ee9 5",
    FRI: "Th\u1ee9 6",
    SAT: "Th\u1ee9 7",
    SUN: "Ch\u1ee7 nh\u1eadt",
  },
  zh: {
    MON: "\u5468\u4e00",
    TUE: "\u5468\u4e8c",
    WED: "\u5468\u4e09",
    THU: "\u5468\u56db",
    FRI: "\u5468\u4e94",
    SAT: "\u5468\u516d",
    SUN: "\u5468\u65e5",
  },
  en: {
    MON: "Mon",
    TUE: "Tue",
    WED: "Wed",
    THU: "Thu",
    FRI: "Fri",
    SAT: "Sat",
    SUN: "Sun",
  },
}

const normalizeDay = (day) => String(day || "").toUpperCase()

const getLocalizedDayName = (day, language) => {
  const dayNames = DAY_NAMES_BY_LANGUAGE[language] || DAY_NAMES_BY_LANGUAGE.en
  const normalizedDay = normalizeDay(day)
  return dayNames[normalizedDay] || normalizedDay
}

export const formatWeeklyScheduleText = (classData, language = "en") => {
  let scheduleItems = null

  if (Array.isArray(classData?.rawSchedule) && classData.rawSchedule.length > 0) {
    scheduleItems = classData.rawSchedule
  } else if (Array.isArray(classData?.schedule)) {
    scheduleItems = classData.schedule
  }

  if (scheduleItems && scheduleItems.length > 0) {
    const groups = scheduleItems.reduce((acc, item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return acc
      const start = typeof item.startTime === "string" ? item.startTime : ""
      const end = typeof item.endTime === "string" ? item.endTime : ""
      const timeKey = start && end ? `${start} - ${end}` : ""
      const dayLabel = getLocalizedDayName(item.dayOfWeek, language)
      if (!dayLabel) return acc

      if (!acc.has(timeKey)) {
        acc.set(timeKey, [])
      }
      acc.get(timeKey).push(dayLabel)

      return acc
    }, new Map())

    const formattedGroups = [...groups.entries()]
      .map(([timeKey, days]) => (
        timeKey ? `${days.join(", ")} (${timeKey})` : days.join(", ")
      ))
      .filter(Boolean)
      .join("; ")
    if (formattedGroups) return formattedGroups
  }

  const schedule = classData?.schedule
  if (!schedule || typeof schedule !== "object" || Array.isArray(schedule)) {
    return "TBA"
  }

  const { days, startTime, endTime } = schedule
  if (!Array.isArray(days) || days.length === 0) {
    return "TBA"
  }

  const formattedDays = days
    .map((day) => getLocalizedDayName(day, language))
    .join(", ")
  const timeText = startTime && endTime ? `${startTime} - ${endTime}` : ""

  return timeText ? `${formattedDays} (${timeText})` : formattedDays
}
