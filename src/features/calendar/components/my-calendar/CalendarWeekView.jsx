import React, { useState } from 'react'
import dayjs from 'dayjs'
import EventBlock from './EventBlock'
import EventBlockDetail from './EventBlockDetail'
import { useTimezone } from '@/shared/hooks/useTimezone'
const HOURS = Array.from({ length: 24 }, (_, i) => i) // 0 to 23

const CalendarWeekView = ({
  currentDate,
  selectedDate,
  events,
}) => {
  const { formatScheduleDays } = useTimezone()

  // Use formatScheduleDays to translate each day correctly according to language/timezone shifts
  const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day =>
    formatScheduleDays([day])
  )

  const daysInMonth = currentDate.daysInMonth()
  const [selectedEvent, setSelectedEvent] = useState(null)

  const getWeekDates = () => {
    const validSelectedDate = Math.min(selectedDate, daysInMonth)
    const targetDate = currentDate.date(validSelectedDate)
    const dayOfWeek = targetDate.day()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Monday start
    const startOfWeek = targetDate.subtract(diff, 'day')

    return Array.from({ length: 7 }, (_, i) => {
      const d = startOfWeek.add(i, 'day')
      return {
        day: d.date(),
        isCurrentMonth: d.month() === currentDate.month(),
        dateStr: d.format('YYYY-MM-DD'),
        formatted: d.format('D/M')
      }
    })
  }

  const weekDates = getWeekDates()
  const now = dayjs()

  const isCurrentWeek = weekDates.some(d => d.dateStr === now.format('YYYY-MM-DD'))
  const currentHour = now.hour()
  const currentMin = now.minute()
  const showCurrentTime = isCurrentWeek


  return (
    <div className="w-full h-full min-h-0 max-h-[500px] overflow-x-auto scrollbar-app">
      <div className="min-w-[600px] md:min-w-0 flex flex-col h-full">
        {/* Week Header */}
        <div className="flex ml-16 border-b border-[#E5E5E5] pb-4">
          {weekDates.map((dateObj, idx) => {
            const isToday = dateObj.dateStr === now.format('YYYY-MM-DD')
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-1 py-2"
              >
                <div className={`w-full h-12 flex items-center justify-center rounded-full text-sm font-semibold tracking-wider transition-all 
                ${isToday ? 'text-white bg-[#990011]' : 'text-[#1A1A1A]'}`}>
                  {DAY_LABELS[idx]}
                </div>
                <div className="text-lg font-medium text-gray-600">
                  {dateObj.formatted}
                </div>
              </div>
            )
          })}
        </div>

        {/* Time Scrollable */}
        <div className="flex-1 overflow-y-auto relative mt-4 scrollbar-app">
          <div className="flex relative pt-3">
            {/* Y-Axis */}
            <div className="w-16 flex flex-col shrink-0">
              {HOURS.map((hour) => (
                <div key={hour} className="h-[60px] text-xs text-gray-400 font-medium relative -top-2">
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Horizontal Lines */}
            <div className="flex-1 relative">
              {HOURS.map((_, i) => (
                <div key={i} className="h-[60px] border-t border-[#F5F5F5] w-full" />
              ))}

              {/* Events Overlay */}
              <div className="absolute inset-0 flex pointer-events-none">
                {weekDates.map((dateObj, colIdx) => (
                  <div key={colIdx} className="flex-1 relative pointer-events-auto">
                    {(() => {
                      const parsedEvents = events
                        .map((ev) => {
                          if (!ev.startTime) return null
                          const evStart = dayjs(ev.startTime)
                          const evEnd = ev.endTime ? dayjs(ev.endTime) : evStart.add(1, 'hour')

                          const colStart = dayjs(dateObj.dateStr) // 00:00:00 of this column
                          const colEnd = colStart.add(1, 'day')   // 00:00:00 of next day

                          // Check if event overlaps with this day column
                          if (!evStart.isBefore(colEnd) || !evEnd.isAfter(colStart)) return null

                          // Calculate the start and end time visually restricted within this day column
                          const renderStart = evStart.isBefore(colStart) ? colStart : evStart
                          const renderEnd = evEnd.isAfter(colEnd) ? colEnd : evEnd

                          const startH = renderStart.hour()
                          const startM = renderStart.minute()

                          const topMinutes = startH * 60 + startM
                          const durationMinutes = renderEnd.diff(renderStart, 'minute') || 60

                          return {
                            event: ev,
                            renderStart,
                            renderEnd,
                            topMinutes,
                            durationMinutes,
                            originalId: ev.id
                          }
                        })
                        .filter(Boolean)

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

                      // For each cluster, find columns to lay them out side-by-side
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

                      return parsedEvents.map(pEv => (
                        <EventBlock
                          key={`${pEv.originalId}-${dateObj.dateStr}`}
                          event={pEv.event}
                          top={pEv.topMinutes}
                          height={pEv.durationMinutes}
                          width={pEv.width}
                          left={pEv.left}
                          onClick={() => setSelectedEvent(pEv.event)}
                        />
                      ))
                    })()}
                  </div>
                ))}
              </div>
            </div>

            {/* Current Time Line */}
            {showCurrentTime && (
              <div
                className="absolute left-16 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                style={{ top: `${(currentHour + currentMin / 60) * 60 + 12}px` }}
              >
                <div className="absolute -left-16 -top-2.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-20">
                  {String(currentHour).padStart(2, '0')}:{String(currentMin).padStart(2, '0')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <EventBlockDetail
        open={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  )
}

export default CalendarWeekView
