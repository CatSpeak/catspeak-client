import React, { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { IconButton } from '@/shared/components/ui/buttons'
import EventBlock from './EventBlock'
import EventCardDetail from './EventCardDetail'
import EventFilter from './EventFilter'
import { useTimezone } from '@/shared/hooks/useTimezone'
import dayjs from 'dayjs'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

const CalendarDayView = ({ date = '20/01', targetDate, events = [], activeFilters = null, onApplyFilter, onShareEvent, hideHeader = false }) => {
  const { formatScheduleDays, parseIsoToZoneDate } = useTimezone()
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterOpenCount, setFilterOpenCount] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [prevDate, setPrevDate] = useState(date)

  if (date !== prevDate) {
    setPrevDate(date)
    setSelectedEvent(null)
  }

  const handleApplyFilter = (selectedTypes) => {
    if (onApplyFilter) onApplyFilter(selectedTypes)
    setFilterOpen(false)
  }

  if (selectedEvent) {
    return (
      <div className="flex flex-col min-h-0 w-full border bg-white rounded-xl h-full flex-1">
        <EventCardDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} onShareEvent={onShareEvent} />
      </div>
    )
  }

  const dDate = targetDate || dayjs()
  const dayNameRaw = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][dDate.day()]
  const dayLabel = formatScheduleDays([dayNameRaw])
  const formattedDate = dDate.format('D/M')
  const dateStr = dDate.format('YYYY-MM-DD')

  const now = dayjs()
  const isToday = dateStr === now.format('YYYY-MM-DD')
  const currentHour = now.hour()
  const currentMin = now.minute()

  const parsedEvents = events
    .map((ev) => {
      if (!ev.startTime) return null
      const evStart = dayjs(parseIsoToZoneDate(ev.startTime))
      const evEnd = ev.endTime ? dayjs(parseIsoToZoneDate(ev.endTime)) : evStart.add(1, 'hour')
      const colStart = dayjs(dateStr)
      const colEnd = colStart.add(1, 'day')

      if (!evStart.isBefore(colEnd) || !evEnd.isAfter(colStart)) return null

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

  parsedEvents.sort((a, b) => a.renderStart.valueOf() - b.renderStart.valueOf())

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

  return (
    <div className={`flex flex-col min-h-0 w-full ${hideHeader ? '' : 'border bg-white rounded-xl'} h-full flex-1`}>
      {/* Panel Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b">
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-gray-400 w-12 shrink-0">GMT +7</div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500">{dayLabel}</span>
              <span className={`text-2xl font-bold ${isToday ? 'text-[#990011]' : 'text-[#1A1A1A]'}`}>
                {formattedDate}
              </span>
            </div>
          </div>
          <IconButton
            variant="outline"
            className='!w-10 !h-10 shrink-0'
            innerClassName="!w-8 !h-8"
            onClick={() => { setFilterOpenCount(c => c + 1); setFilterOpen(true) }}
            title="Bộ lọc"
          >
            <SlidersHorizontal />
          </IconButton>
        </div>
      )}

      {/* Time Grid Scrollable */}
      <div className="flex-1 overflow-y-auto relative scrollbar-app">
        <div className="flex relative pt-4 pb-4">
          {/* Y-Axis */}
          <div className="w-16 flex flex-col shrink-0 items-center">
            {HOURS.map((hour) => (
              <div key={hour} className="h-[60px] text-xs text-gray-400 font-medium relative -top-2">
                {hour}:00
              </div>
            ))}
          </div>

          {/* Horizontal Lines and Events */}
          <div className="flex-1 relative pr-4">
            {HOURS.map((_, i) => (
              <div key={i} className="h-[60px] border-t border-[#F5F5F5] w-full" />
            ))}

            <div className="absolute inset-0 flex pointer-events-none">
              <div className="flex-1 relative pointer-events-auto">
                {parsedEvents.map(pEv => (
                  <EventBlock
                    key={pEv.originalId}
                    event={pEv.event}
                    top={pEv.topMinutes}
                    height={pEv.durationMinutes}
                    width={pEv.width}
                    left={pEv.left}
                    onClick={() => setSelectedEvent(pEv.event)}
                  />
                ))}
              </div>
            </div>

            {/* Current Time Line */}
            {isToday && (
              <div
                className="absolute left-0 right-4 border-t border-red-500 flex items-center z-20 pointer-events-none"
                style={{ top: `${(currentHour * 60) + currentMin}px` }}
              >
                <span className="absolute text-xs font-bold text-red-500 bg-white pr-1 -left-12">
                  {now.format('H:mm')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <EventFilter
        key={filterOpenCount}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilter}
        activeFilters={activeFilters}
      />
    </div>
  )
}

export default CalendarDayView