import React from 'react'
import dayjs from 'dayjs'
import { useTimezone } from '@/shared/hooks/useTimezone'


const CalendarMonthView = ({
  currentDate,
  selectedDate,
  onSelectDate,
  events
}) => {
  const { userTimeZone, formatScheduleDays } = useTimezone()
  
  // Use formatScheduleDays to translate each day correctly according to language/timezone shifts
  const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => 
    formatScheduleDays([day])
  )

  const startDay = (currentDate.startOf('month').day() + 6) % 7 // Make Monday = 0
  const prevDays = currentDate.subtract(1, 'month').daysInMonth()
  const daysInMonth = currentDate.daysInMonth()

  const calendarDates = Array.from({ length: 42 }, (_, i) => {
    const dayValue = i - startDay + 1
    if (dayValue < 1) {
      return {
        day: prevDays + dayValue,
        isCurrentMonth: false,
        dateStr: currentDate.subtract(1, 'month').date(prevDays + dayValue).format('YYYY-MM-DD')
      }
    }
    if (dayValue > daysInMonth) {
      return {
        day: dayValue - daysInMonth,
        isCurrentMonth: false,
        dateStr: currentDate.add(1, 'month').date(dayValue - daysInMonth).format('YYYY-MM-DD')
      }
    }
    return {
      day: dayValue,
      isCurrentMonth: true,
      dateStr: currentDate.date(dayValue).format('YYYY-MM-DD')
    }
  })

  return (
    <div className="w-full h-full flex flex-col min-h-0 overflow-y-auto scrollbar-app pr-2">
      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 text-center border-b border-[#E5E5E5] pb-4 mb-4">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-base text-[#1A1A1A] font-medium tracking-wider">
            {label}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-3">
        {calendarDates.map((dateObj, idx) => {
          const { day, isCurrentMonth } = dateObj

          if (!isCurrentMonth) {
            return (
              <div key={`empty-${idx}`} className="h-15 flex flex-col items-center justify-start pt-2">
                <div className="w-10 h-10 flex items-center justify-center text-base text-gray-300 font-medium">
                  {String(day).padStart(2, '0')}
                </div>
              </div>
            )
          }

          const isToday = day === dayjs().date() && currentDate.isSame(dayjs(), 'month')
          const isSelected = day === selectedDate
          const dayEvents = events.filter((ev) => {
            if (!ev.startTime) return false
            const evStart = dayjs(ev.startTime).tz(userTimeZone)
            const evDateStr = evStart.format('YYYY-MM-DD')
            return evDateStr === dateObj.dateStr
          })

          return (
            <div key={`day-${idx}`} className="h-15 flex flex-col items-center justify-start pt-2 gap-2 relative">
              <button
                onClick={() => onSelectDate(day)}
                className={`
                  w-10 h-10 flex items-center justify-center rounded-full text-base font-medium transition-all
                  ${isSelected ? 'bg-[#990011] text-white border border-[#990011]' :
                    isToday ? 'text-[#1A1A1A] border border-[#990011]' : 'text-[#1A1A1A] hover:bg-[#F5F5F5]'}
                `}
              >
                {String(day).padStart(2, '0')}
                {dayEvents.length > 0 && (
                  <div className={`absolute rounded-full w-1 h-1 bottom-1 ${isSelected ? 'bg-white' : 'bg-[#990011]'}`} />
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarMonthView
