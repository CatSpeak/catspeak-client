export const parseTime = (timeStr) => {
  if (!timeStr) return 0
  // Handle ISO strings like "2026-03-05T01:22:55.454Z"
  if (timeStr.includes("T")) {
    const date = new Date(timeStr)
    // Use local time instead of hardcoding a specific timezone
    return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
  }
  // Plain "HH:MM" fallback
  const [hours, minutes] = timeStr.split(":").map(Number)
  return hours + minutes / 60
}

export const processOverlappingEvents = (events) => {
  if (!events || events.length === 0) return []

  const sortedEvents = [...events].sort((a, b) => {
    const startA = parseTime(a.startTime)
    const startB = parseTime(b.startTime)
    if (startA !== startB) return startA - startB
    return parseTime(a.endTime) - parseTime(b.endTime)
  })

  let lastEventEnding = null
  const groups = []
  let currentGroup = []

  sortedEvents.forEach((ev) => {
    const start = parseTime(ev.startTime)
    const end = parseTime(ev.endTime)

    if (lastEventEnding !== null && start > lastEventEnding) {
      groups.push(currentGroup)
      currentGroup = []
      lastEventEnding = null
    }

    currentGroup.push(ev)
    lastEventEnding =
      lastEventEnding === null ? end : Math.max(lastEventEnding, end)
  })

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  const positionedEvents = []

  groups.forEach((group) => {
    const cols = []

    group.forEach((ev) => {
      const start = parseTime(ev.startTime)
      const end = parseTime(ev.endTime)

      let colIdx = 0
      while (colIdx < cols.length && cols[colIdx] > start) {
        colIdx++
      }

      if (colIdx >= cols.length) {
        cols.push(end)
      } else {
        cols[colIdx] = end
      }

      ev.colIdx = colIdx
    })

    group.forEach((ev) => {
      positionedEvents.push({
        ...ev,
        groupCols: cols.length,
      })
    })
  })

  return positionedEvents
}
