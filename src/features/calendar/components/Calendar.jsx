import React, { useState } from "react"
import dayjs from "dayjs"
import { colors } from "@/shared/utils/colors"
import CatIcon from "@/shared/assets/icons/logo/icon.svg"
import CalendarDetail from "./CalendarDetail"
import { motion } from "framer-motion"
import { useGetEventCountsQuery } from "@/store/api/eventsApi"

const Calendar = ({ currentDate = dayjs() }) => {
  const [selectedDate, setSelectedDate] = useState(null)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  // Create a calendar view layout for the current month (Monday-first)
  // dayjs .day() returns 0=Sun,1=Mon,...,6=Sat
  // For a Mon-first grid, offset = (dayOfWeek + 6) % 7
  const startDay = (currentDate.startOf("month").day() + 6) % 7
  const daysInMonth = currentDate.daysInMonth()
  const prevMonthDays = currentDate.subtract(1, "month").daysInMonth()

  const dates = Array.from({ length: 42 }, (_, i) => {
    const dayValue = i - startDay + 1
    if (dayValue < 1) {
      return {
        day: prevMonthDays + dayValue,
        isCurrentMonth: false,
        originalDate: null,
      }
    }
    if (dayValue > daysInMonth) {
      return {
        day: dayValue - daysInMonth,
        isCurrentMonth: false,
        originalDate: null,
      }
    }
    return { day: dayValue, isCurrentMonth: true, originalDate: dayValue }
  })

  // Fetch event counts from the API for the current month
  const { data: eventCountsData } = useGetEventCountsQuery({
    startDate: currentDate.startOf("month").toISOString(),
    endDate: currentDate.endOf("month").toISOString(),
  })

  // Build a day-of-month → totalEvents map from the API response
  const eventCountsByDay = React.useMemo(() => {
    if (!eventCountsData?.counts) return {}
    return eventCountsData.counts.reduce((acc, item) => {
      const day = dayjs(item.date).date()
      acc[day] = (acc[day] ?? 0) + item.totalEvents
      return acc
    }, {})
  }, [eventCountsData])

  const selectedIndex = dates.findIndex(
    (d) => d.isCurrentMonth && d.day === selectedDate,
  )
  const endOfRowIdx =
    selectedIndex !== -1 ? (Math.floor(selectedIndex / 7) + 1) * 7 - 1 : -1

  // Look up event count for a given day from API data
  const getEventCountForDate = (date) => {
    if (!date) return 0
    return eventCountsByDay[date] ?? 0
  }

  return (
    <div className="flex-1 flex flex-col w-full min-h-[350px]">
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-4">
        {days.map((d) => (
          <div
            key={d}
            className="text-xs font-bold text-[#606060] uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-x-1 sm:gap-x-2 gap-y-3 flex-1">
        {dates.map((dateObj, idx) => {
          const { day, isCurrentMonth, originalDate } = dateObj
          const date = originalDate // integer or null

          const isToday =
            isCurrentMonth &&
            day === dayjs().date() &&
            currentDate.isSame(dayjs(), "month")
          const eventCount = isCurrentMonth ? getEventCountForDate(day) : 0

          // Logic for gradient bars based on event count
          let numBars = 0
          if (eventCount >= 50) numBars = 4
          else if (eventCount >= 20) numBars = 3
          else if (eventCount >= 5) numBars = 2
          else if (eventCount > 0) numBars = 1

          const barColors = [
            colors.red[500], // bottom, lightest
            colors.red[700],
            colors.red[800],
            colors.red[900], // top, darkest
          ]

          const renderExpandedDetail = () => {
            if (selectedDate !== null && idx === endOfRowIdx) {
              return (
                <CalendarDetail
                  key={`detail-${selectedDate}`}
                  selectedDate={selectedDate}
                  currentDate={currentDate}
                  onClose={() => setSelectedDate(null)}
                />
              )
            }
            return null
          }

          if (!isCurrentMonth) {
            return (
              <React.Fragment key={`empty-${idx}`}>
                <div className="relative flex flex-col rounded-lg sm:rounded-xl bg-gray-50/50 border border-[#E5E5E5] overflow-hidden min-h-[80px] sm:min-h-0 sm:aspect-[5/4] items-start justify-start p-1.5 sm:p-3">
                  <span className="text-sm sm:text-base text-gray-400/60 font-medium">
                    {day}
                  </span>
                </div>
                {renderExpandedDetail()}
              </React.Fragment>
            )
          }

          return (
            <React.Fragment key={`date-${idx}`}>
              <motion.div
                whileTap={{
                  scale: 0.92,
                  transition: { type: "spring", stiffness: 400, damping: 17 },
                }}
                onClick={() =>
                  setSelectedDate(selectedDate === date ? null : date)
                }
                className={`relative flex flex-col rounded-lg sm:rounded-xl bg-white border overflow-hidden cursor-pointer min-h-[80px] sm:min-h-0 sm:aspect-[5/4]
                  ${isToday && selectedDate !== date ? "border-[#990011]" : "border-[#E5E5E5]"}
                  ${selectedDate === date ? "ring-2 ring-[#990011]/80 transform scale-[1.02] z-10" : ""}
                `}
              >
                {/* Top Row: Date and Event Count */}
                <div className="flex items-start justify-between p-1.5 sm:p-3 z-10 text-sm sm:text-base">
                  <span
                    className={`font-medium ${isToday ? "text-[#990011]" : "text-gray-900"}`}
                  >
                    {date}
                  </span>
                  {eventCount > 0 && (
                    <span className="text-[#990011] font-bold text-xs sm:text-base">
                      {eventCount}
                    </span>
                  )}
                </div>

                {/* Gradient Event Bars Container */}
                <div className="flex-1 flex flex-col justify-end w-full absolute inset-0 z-0 pointer-events-none">
                  {[
                    { height: "25%", color: colors.red[900] },
                    { height: "40%", color: colors.red[800] },
                    { height: "55%", color: colors.red[700] },
                    { height: "70%", color: colors.red[600] },
                  ]
                    .slice(0, numBars)
                    .reverse()
                    .map((layer, barIdx) => (
                      <div
                        key={barIdx}
                        className="absolute bottom-0 w-full rounded-t-lg transition-all"
                        style={{
                          height: layer.height,
                          backgroundColor: layer.color,
                          zIndex: barIdx,
                        }}
                      />
                    ))}

                  {/* Optional Cat Icon in bottom-left */}
                  {eventCount > 0 && (
                    <img
                      src={CatIcon}
                      className="absolute left-1 sm:left-1.5 bottom-1 sm:bottom-1.5 w-4 h-4 sm:w-6 sm:h-6 z-10"
                      alt="Cat Speak"
                    />
                  )}
                </div>
              </motion.div>
              {renderExpandedDetail()}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar
