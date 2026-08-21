import React, { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { IconButton } from '@/shared/components/ui/buttons'
import EventBlock from './EventBlock'
import EventBlockDetail from './EventBlockDetail'
import CalendarDayView from './CalendarDayView'
import { useTimezone } from '@/shared/hooks/useTimezone'
import { HOURS, WEEK_DAY_KEYS } from '@/features/calendar/data/calendarConstants'
import { parseEventsForDay, layoutEventClusters } from '@/features/calendar/utils/eventLayoutUtils'

const CalendarWeekView = ({
  currentDate,
  selectedDate,
  events,
  onPrev,
  onNext,
  onSelectDate,
}) => {
  const { formatScheduleDays, parseIsoToZoneDate } = useTimezone()

  // Use formatScheduleDays to translate each day correctly according to language/timezone shifts
  const DAY_LABELS = WEEK_DAY_KEYS.map(day =>
    formatScheduleDays([day])
  )

  const daysInMonth = currentDate.daysInMonth()
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [expandedDayStr, setExpandedDayStr] = useState(null)

  const getWeekDates = useMemo(() => {
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
  }, [currentDate, selectedDate, daysInMonth])

  const weekDates = getWeekDates
  const now = dayjs()

  if (expandedDayStr && !weekDates.some(d => d.dateStr === expandedDayStr)) {
    setExpandedDayStr(null)
  }

  const isCurrentWeek = weekDates.some(d => d.dateStr === now.format('YYYY-MM-DD'))
  const currentHour = now.hour()
  const currentMin = now.minute()
  const showCurrentTime = isCurrentWeek


  return (
    <div className="w-full h-full min-h-0 max-h-[500px] overflow-x-auto scrollbar-app">
      <div className="flex flex-col min-w-[700px] h-full min-h-0">
        {/* Week Header */}
        <div className="flex border-b border-border pb-4 items-center relative">
        <IconButton
          onClick={onPrev}
          variant="ghost"
          className="text-gray-400 hover:text-[#990011]"
          title="Tuần trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </IconButton>
        {weekDates.map((dateObj, idx) => {
          const isToday = dateObj.dateStr === now.format('YYYY-MM-DD')
          const isExpanded = expandedDayStr === dateObj.dateStr
          const isActive = isExpanded || (!expandedDayStr && isToday)

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
              onClick={() => {
                if (expandedDayStr === dateObj.dateStr) {
                  setExpandedDayStr(null)
                } else {
                  setExpandedDayStr(dateObj.dateStr)
                  if (onSelectDate) {
                    onSelectDate(dateObj.day)
                  }
                }
              }}
            >
              <div className={`w-16 h-16 flex items-center justify-center rounded-full text-sm font-semibold tracking-wider transition-all 
                ${isActive ? 'text-white bg-[#990011] shadow-md' : 'text-[#1A1A1A] group-hover:bg-gray-100'}`}>
                {DAY_LABELS[idx]}
              </div>
              <div className={`text-lg font-medium ${isActive ? 'text-[#990011]' : 'text-gray-600'}`}>
                {dateObj.formatted}
              </div>
            </div>
          )
        })}
        <IconButton
          onClick={onNext}
          variant="ghost"
          className="text-gray-400 hover:text-[#990011]"
          title="Tuần sau"
        >
          <ChevronRight className="w-5 h-5" />
        </IconButton>
      </div>

      {/* Body */}
      {expandedDayStr ? (
        <CalendarDayView
          targetDate={dayjs(expandedDayStr)}
          events={events}
          hideHeader={true}
        />
      ) : (
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
              <div className="absolute inset-0 flex pointer-events-none z-10">
                {weekDates.map((dateObj, colIdx) => {
                  // Use shared utils for event parsing and layout
                  const parsedEvents = parseEventsForDay(events, dateObj.dateStr, parseIsoToZoneDate)
                  layoutEventClusters(parsedEvents)

                  return (
                    <div key={colIdx} className="flex-1 relative pointer-events-auto border-r border-[#F5F5F5] last:border-r-0">
                      {parsedEvents.map(pEv => (
                        <EventBlock
                          key={`${pEv.originalId}-${dateObj.dateStr}`}
                          event={pEv.event}
                          top={pEv.topMinutes}
                          height={pEv.durationMinutes}
                          width={pEv.width}
                          left={pEv.left}
                          onClick={() => setSelectedEvent(pEv.event)}
                        />
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Current Time Line */}
            {showCurrentTime && (
              <div
                className="absolute left-0 right-0 border-t border-red-500 flex items-center pointer-events-none z-[5]"
                style={{ top: `${(currentHour * 60) + currentMin}px` }}
              >
                <span className="absolute text-xs font-bold text-red-500 bg-white pr-1">
                  {now.format('H:mm')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <EventBlockDetail
        open={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
      </div>
    </div>
  )
}

export default CalendarWeekView