import dayjs from 'dayjs'

/**
 * Parse raw events into positioned event objects for a single day column.
 *
 * @param {Array} events - Array of calendar events with startTime/endTime
 * @param {string} dateStr - Target date in 'YYYY-MM-DD' format
 * @param {Function} parseIsoToZoneDate - Timezone conversion function from useTimezone
 * @returns {Array} Parsed events with topMinutes, durationMinutes, renderStart, renderEnd
 */
export const parseEventsForDay = (events, dateStr, parseIsoToZoneDate) => {
  return events
    .map((ev) => {
      if (!ev.startTime) return null
      const evStart = dayjs(parseIsoToZoneDate(ev.startTime))
      const evEnd = ev.endTime ? dayjs(parseIsoToZoneDate(ev.endTime)) : evStart.add(1, 'hour')
      const colStart = dayjs(dateStr)
      const colEnd = colStart.add(1, 'day')

      // Check if event overlaps with this day column
      if (!evStart.isBefore(colEnd) || !evEnd.isAfter(colStart)) return null

      // Clamp to day boundaries
      const renderStart = evStart.isBefore(colStart) ? colStart : evStart
      const renderEnd = evEnd.isAfter(colEnd) ? colEnd : evEnd

      const topMinutes = renderStart.hour() * 60 + renderStart.minute()
      const durationMinutes = renderEnd.diff(renderStart, 'minute') || 60

      return {
        event: ev,
        renderStart,
        renderEnd,
        topMinutes,
        durationMinutes,
        originalId: ev.id,
      }
    })
    .filter(Boolean)
}

/**
 * Group overlapping events into clusters and assign column positions.
 * Mutates the parsedEvents array by adding colIdx, width, and left properties.
 *
 * @param {Array} parsedEvents - Output of parseEventsForDay (will be sorted in-place)
 * @returns {Array} Same array with layout properties (colIdx, width, left) added
 */
export const layoutEventClusters = (parsedEvents) => {
  // Sort by renderStart time
  parsedEvents.sort((a, b) => a.renderStart.valueOf() - b.renderStart.valueOf())

  // Group overlapping events into clusters
  const clusters = []
  let currentCluster = []
  let clusterEnd = null

  parsedEvents.forEach(pEv => {
    if (clusterEnd === null || !pEv.renderStart.isBefore(clusterEnd)) {
      if (currentCluster.length > 0) {
        clusters.push(currentCluster)
      }
      currentCluster = [pEv]
      clusterEnd = pEv.renderEnd
    } else {
      currentCluster.push(pEv)
      if (pEv.renderEnd.isAfter(clusterEnd)) {
        clusterEnd = pEv.renderEnd
      }
    }
  })
  if (currentCluster.length > 0) {
    clusters.push(currentCluster)
  }

  // For each cluster, assign columns for side-by-side layout
  clusters.forEach(cluster => {
    const columns = []
    cluster.forEach(pEv => {
      let placed = false
      for (let i = 0; i < columns.length; i++) {
        const lastEv = columns[i][columns[i].length - 1]
        if (!pEv.renderStart.isBefore(lastEv.renderEnd)) {
          columns[i].push(pEv)
          pEv.colIdx = i
          placed = true
          break
        }
      }
      if (!placed) {
        pEv.colIdx = columns.length
        columns.push([pEv])
      }
    })

    const numColumns = columns.length
    cluster.forEach(pEv => {
      pEv.width = `calc(${100 / numColumns}% - 4px)`
      pEv.left = `calc(${(pEv.colIdx * 100) / numColumns}% + 2px)`
    })
  })

  return parsedEvents
}
