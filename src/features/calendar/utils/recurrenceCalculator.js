import dayjs from "dayjs"

// Map dayjs.day() (0=Sun, 1=Mon) to selectedDays index (0=Mon, 6=Sun)
const getWeekdayIndex = (dayjsDate) => {
  const d = dayjsDate.day()
  return d === 0 ? 6 : d - 1
}



export const calculateExactOccurrences = (
  startDate,
  endDate,
  recurrenceOption,
  interval,
  selectedDays // [0, 1, 2...] where 0=MON
) => {
  if (!startDate || !endDate || recurrenceOption === "NONE") return 1
  
  const frequency = recurrenceOption === "CUSTOM" ? "WEEKLY" : recurrenceOption
  if (!frequency || frequency === "NONE") return 1

  let current = dayjs(startDate)
  const end = dayjs(endDate)
  let count = 0
  const limit = 25 // We only need to know if it's > 24
  
  if (current.isAfter(end)) return 0

  if (frequency === "DAILY") {
    while (current.isBefore(end) || current.isSame(end, "day")) {
      count++
      if (count >= limit) return count
      current = current.add(interval || 1, "day")
    }
  } else if (frequency === "WEEKLY") {
    if (!selectedDays || selectedDays.length === 0) return 0
    const activeDays = selectedDays
    
    while (current.isBefore(end) || current.isSame(end, "day")) {
      const idx = getWeekdayIndex(current)
      
      if (activeDays.includes(idx)) {
        count++
        if (count >= limit) return count
      }
      
      if (idx === 6) {
        // Sunday is the end of the week. Skip to the next target week.
        current = current.add(1, "day").add((interval || 1) - 1, "week")
      } else {
        current = current.add(1, "day")
      }
    }
  } else if (frequency === "MONTHLY") {
    while (current.isBefore(end) || current.isSame(end, "day")) {
      count++
      if (count >= limit) return count
      current = current.add(interval || 1, "month")
    }
  } else if (frequency === "YEARLY") {
    while (current.isBefore(end) || current.isSame(end, "day")) {
      count++
      if (count >= limit) return count
      current = current.add(interval || 1, "year")
    }
  }

  return count
}
