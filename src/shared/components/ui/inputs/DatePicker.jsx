import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import dayjs from "dayjs"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import colors from "@/shared/utils/colors"
import useClickOutside from "@/shared/hooks/useClickOutside"

const DatePicker = ({
  value,
  onChange,
  color = "#B91264",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const portalRef = useRef(null)

  const [date, setDate] = useState(value ? dayjs(value) : dayjs())
  const [currentViewDate, setCurrentViewDate] = useState(
    value ? dayjs(value).startOf("month") : dayjs().startOf("month"),
  )

  useClickOutside(dropdownRef, () => setIsOpen(false))

  useEffect(() => {
    if (value) {
      const newDate = dayjs(value)
      setDate(newDate)
      setCurrentViewDate(newDate.startOf("month"))
    }
  }, [value])

  const [portalCoords, setPortalCoords] = useState(null)

  useEffect(() => {
    const handleClose = () => setIsOpen(false)
    const handleScroll = (e) => {
      if (portalRef.current && portalRef.current.contains(e.target)) return
      handleClose()
    }

    const updateCoords = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top

        // DatePicker is relatively tall (~360px)
        const flipUp = spaceBelow < 360 && spaceAbove > spaceBelow

        // Datepicker is fixed 280px wide
        const forceAlignRight = rect.left + 280 > window.innerWidth

        setPortalCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
          flipUp,
          forceAlignRight,
        })
      }
    }

    if (isOpen) {
      updateCoords()
      window.addEventListener("resize", handleClose)
      window.addEventListener("scroll", handleScroll, true)
      return () => {
        window.removeEventListener("resize", handleClose)
        window.removeEventListener("scroll", handleScroll, true)
      }
    }
  }, [isOpen])

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
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen)
        }}
        disabled={disabled}
        className={`hover:bg-[#f0f0f0] flex items-center justify-center border border-[#e5e5e5] rounded-2xl whitespace-nowrap text-center px-4 h-12 bg-white outline-none ${disabled ? "cursor-not-allowed opacity-80" : "hover:bg-gray-50"}`}
      >
        <span>{formatVietnameseDate(date)}</span>
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && portalCoords && (
              <div
                ref={portalRef}
                style={{
                  position: "absolute",
                  top: portalCoords.top,
                  left: portalCoords.left,
                  width: portalCoords.width,
                  height: portalCoords.height,
                  zIndex: 9999,
                  pointerEvents: "none",
                }}
              >
                <div className="relative w-full h-full">
                  <div
                    className={`absolute z-50 ${portalCoords.flipUp ? "bottom-full mb-1" : "top-full mt-1"} ${portalCoords.forceAlignRight ? "right-0 origin-top-right" : "left-0 origin-top-left"} w-[280px] pointer-events-none`}
                  >
                    <FluentAnimation
                      direction={portalCoords.flipUp ? "up" : "down"}
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
                                ...(isSelected
                                  ? { backgroundColor: color }
                                  : {}),
                                ...(isToday && !isSelected
                                  ? {
                                      border: `1px solid ${color}`,
                                      color: color,
                                    }
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
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  )
}

export default DatePicker
