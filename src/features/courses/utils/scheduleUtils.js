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
  return dayNames[normalizedDay] || day
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
      const start = item.startTime || "00:00"
      const end = item.endTime || "00:00"
      const timeKey = `${start} - ${end}`
      const dayLabel = getLocalizedDayName(item.dayOfWeek, language)

      if (!acc[timeKey]) {
        acc[timeKey] = []
      }
      acc[timeKey].push(dayLabel)

      return acc
    }, {})

    return Object.entries(groups)
      .map(([timeKey, days]) => `${days.join(", ")} (${timeKey})`)
      .join("; ")
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
