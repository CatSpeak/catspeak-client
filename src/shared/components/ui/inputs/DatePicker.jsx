import React, { useState, useRef, useEffect } from "react"
import dayjs from "dayjs"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import colors from "@/shared/utils/colors"

const DatePicker = ({ value, onChange, color = "#B91264", className = "", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const [date, setDate] = useState(value ? dayjs(value) : dayjs())
  const [currentViewDate, setCurrentViewDate] = useState(
    value ? dayjs(value).startOf("month") : dayjs().startOf("month"),
  )

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (value) {
      const newDate = dayjs(value)
      setDate(newDate)
      setCurrentViewDate(newDate.startOf("month"))
    }
  }, [value])

  const handleSelectDate = (dayNumber) => {
    const selectedDate = currentViewDate.date(dayNumber)
    setDate(selectedDate)
    setIsOpen(false)
    if (onChange) onChange(selectedDate.toDate())
  }

  const handlePreviousMonth = (e) => {
    e.stopPropagation()
    setCurrentViewDate(currentViewDate.subtract(1, "month"))
  }

  const handleNextMonth = (e) => {
    e.stopPropagation()
    setCurrentViewDate(currentViewDate.add(1, "month"))
  }

  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

  const formatVietnameseDate = (d) => {
    const dayOfWeek = d.day()
    const dayNames = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ]
    return `${dayNames[dayOfWeek]}, ${d.format("DD/MM/YYYY")}`
  }

  const generateDays = () => {
    const days = []
    const startDay = currentViewDate.startOf("month").day()
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1
    const daysInMonth = currentViewDate.daysInMonth()

    for (let i = 0; i < adjustedStartDay; i++) {
      days.push({
        isEmpty: true,
        key: `empty-${i}`,
      })
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        isEmpty: false,
        day: i,
        key: `day-${i}`,
      })
    }

    return days
  }

  const days = generateDays()

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => { if (!disabled) setIsOpen(!isOpen) }}
        disabled={disabled}
        className={`text-sm flex items-center justify-center border border-[#c6c6c6] rounded-md whitespace-nowrap text-center px-4 h-10 shadow-sm transition-colors bg-white outline-none text-gray-800 ${disabled ? "cursor-not-allowed opacity-80" : "hover:bg-gray-50"}`}
      >
        <span>{formatVietnameseDate(date)}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="absolute z-50 top-full mt-1 left-0 w-[280px] origin-top-left pointer-events-none">
            <FluentAnimation
              direction="down"
              exit={true}
              className="pointer-events-auto bg-white border rounded-lg shadow-xl p-4 flex flex-col"
            >
              {/* Header with Month Selection and Chevrons */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <div className="font-bold text-gray-800 text-[14px]">
                  Tháng {currentViewDate.format("M, YYYY")}
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronRight size={18} className="text-gray-600" />
                </button>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-1 mb-2 shrink-0">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[12px] font-bold text-gray-400 pb-2 border-b border-gray-100"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                {days.map((item) => {
                  if (item.isEmpty) {
                    return <div key={item.key} />
                  }

                  const isSelected =
                    item.day === date.date() &&
                    currentViewDate.month() === date.month() &&
                    currentViewDate.year() === date.year()

                  // Highlight today optionally
                  const today = dayjs()
                  const isToday =
                    item.day === today.date() &&
                    currentViewDate.month() === today.month() &&
                    currentViewDate.year() === today.year()

                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => handleSelectDate(item.day)}
                      className={`
                    w-8 h-8 flex items-center justify-center text-[13px] rounded-full mx-auto transition-colors font-medium
                    ${isSelected ? "text-white font-bold hover:brightness-90" : "text-gray-700 hover:bg-gray-100"}
                  `}
                      style={{
                        ...(isSelected ? { backgroundColor: color } : {}),
                        ...(isToday && !isSelected
                          ? { border: `1px solid ${color}`, color: color }
                          : {}),
                      }}
                    >
                      {item.day}
                    </button>
                  )
                })}
              </div>
            </FluentAnimation>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DatePicker
