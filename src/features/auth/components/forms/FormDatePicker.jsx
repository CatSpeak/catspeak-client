import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import dayjs from "dayjs"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"

const FormDatePicker = ({
  value,
  onChange,
  placeholder = "Chọn ngày",
  error,
  helperText,
  color = "#8e0000",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState("days") // "days" | "years"
  const dropdownRef = useRef(null)
  const portalRef = useRef(null)

  const [date, setDate] = useState(value ? dayjs(value) : null)
  const [inputValue, setInputValue] = useState(
    value ? dayjs(value).format("DD/MM/YYYY") : "",
  )
  const [currentViewDate, setCurrentViewDate] = useState(
    value ? dayjs(value).startOf("month") : dayjs().startOf("month"),
  )
  const [yearBlockStart, setYearBlockStart] = useState(
    Math.floor((value ? dayjs(value).year() : dayjs().year()) / 12) * 12,
  )

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        (!portalRef.current || !portalRef.current.contains(event.target))
      ) {
        setIsOpen(false)
        setView("days")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const [prevValue, setPrevValue] = useState(value)

  if (value !== prevValue) {
    setPrevValue(value)
    if (value) {
      const newDate = dayjs(value)
      setDate(newDate)
      setCurrentViewDate(newDate.startOf("month"))
      setYearBlockStart(Math.floor(newDate.year() / 12) * 12)
      setInputValue(newDate.format("DD/MM/YYYY"))
    } else {
      setDate(null)
      setInputValue("")
    }
  }

  const [portalCoords, setPortalCoords] = useState(null)

  useEffect(() => {
    const handleClose = () => {
      setIsOpen(false)
      setView("days")
    }
    const handleScroll = (e) => {
      if (portalRef.current && portalRef.current.contains(e.target)) return
      handleClose()
    }

    const updateCoords = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top

        const flipUp = spaceBelow < 360 && spaceAbove > spaceBelow
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

  const handleInputChange = (e) => {
    let val = e.target.value.replace(/[^0-9/]/g, "")

    // Auto-format DD/MM/YYYY
    if (e.nativeEvent.inputType !== "deleteContentBackward") {
      let clean = val.replace(/\D/g, "")
      if (clean.length > 8) clean = clean.slice(0, 8)

      if (clean.length >= 5) {
        val = `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4)}`
      } else if (clean.length >= 3) {
        val = `${clean.slice(0, 2)}/${clean.slice(2)}`
      } else if (clean.length === 2) {
        val = `${clean}/`
      } else {
        val = clean
      }
    }

    setInputValue(val)

    const parts = val.split("/")
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const year = parseInt(parts[2], 10)

      if (
        year >= 1900 &&
        year <= 2100 &&
        month >= 0 &&
        month < 12 &&
        day > 0 &&
        day <= 31
      ) {
        const newD = dayjs(new Date(year, month, day))
        if (newD.isValid()) {
          setDate(newD)
          setCurrentViewDate(newD.startOf("month"))
          setYearBlockStart(Math.floor(newD.year() / 12) * 12)
          emitChange(newD)
        }
      }
    } else if (val === "") {
      setDate(null)
      if (onChange) {
        onChange({ target: { value: "", type: "text" } })
      }
    }
  }

  const emitChange = (selectedDate) => {
    if (onChange) {
      onChange({
        target: {
          value: selectedDate.format("YYYY-MM-DD"),
          type: "text",
        },
      })
    }
  }

  const handleSelectDate = (dayNumber) => {
    const selectedDate = currentViewDate.date(dayNumber)
    setDate(selectedDate)
    setIsOpen(false)
    setView("days")
    emitChange(selectedDate)
  }

  const handlePreviousMonth = (e) => {
    e.stopPropagation()
    setCurrentViewDate(currentViewDate.subtract(1, "month"))
  }

  const handleNextMonth = (e) => {
    e.stopPropagation()
    setCurrentViewDate(currentViewDate.add(1, "month"))
  }

  const openYearPicker = (e) => {
    e.stopPropagation()
    setYearBlockStart(Math.floor(currentViewDate.year() / 12) * 12)
    setView("years")
  }

  const handleSelectYear = (year) => {
    setCurrentViewDate(currentViewDate.year(year))
    setView("days")
  }

  const handlePreviousYearBlock = (e) => {
    e.stopPropagation()
    setYearBlockStart((prev) => prev - 12)
  }

  const handleNextYearBlock = (e) => {
    e.stopPropagation()
    setYearBlockStart((prev) => prev + 12)
  }

  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

  const generateDays = () => {
    const days = []
    const startDay = currentViewDate.startOf("month").day()
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1
    const daysInMonth = currentViewDate.daysInMonth()

    for (let i = 0; i < adjustedStartDay; i++) {
      days.push({ isEmpty: true, key: `empty-${i}` })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ isEmpty: false, day: i, key: `day-${i}` })
    }
    return days
  }

  const days = generateDays()
  const years = Array.from({ length: 12 }, (_, i) => yearBlockStart + i)

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block w-full ${className}`}
    >
      <div
        className={`h-14 w-full flex items-center justify-between rounded-md border px-4 text-left transition-colors focus-within:border-primary hover:border-primary
        ${error ? "border-red-500 focus-within:border-red-500" : "border-border"}
        ${disabled ? "cursor-not-allowed opacity-80 bg-gray-50" : "bg-white"}`}
        onClick={() => {
          if (!disabled && !isOpen) setIsOpen(true)
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (!disabled) setIsOpen(true)
          }}
          placeholder={`${placeholder} (dd/mm/yyyy)`}
          disabled={disabled}
          className="w-full h-full outline-none bg-transparent text-gray-800 placeholder-[#9e9e9e]"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (!disabled) setIsOpen(!isOpen)
          }}
          className="p-1 outline-none"
        >
          <Calendar size={18} className="text-gray-400 shrink-0" />
        </button>
      </div>
      {helperText && <p className="mt-1 text-xs text-red-600">{helperText}</p>}

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
                    className={`absolute z-50 ${portalCoords.flipUp ? "bottom-full mb-4" : "top-full mt-4"} ${portalCoords.forceAlignRight ? "right-0 origin-top-right" : "left-0 origin-top-left"} w-[280px] pointer-events-none`}
                  >
                    <FluentAnimation
                      direction={portalCoords.flipUp ? "up" : "down"}
                      exit={true}
                      className="pointer-events-auto bg-white border border-border rounded-md shadow-lg p-4 flex flex-col"
                    >
                      {view === "days" ? (
                        <>
                          {/* Header tháng + năm (bấm vào năm để chọn nhanh) */}
                          <div className="flex items-center justify-between mb-4">
                            <button
                              type="button"
                              onClick={handlePreviousMonth}
                              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <ChevronLeft
                                size={18}
                                className="text-gray-600"
                              />
                            </button>
                            <button
                              type="button"
                              onClick={openYearPicker}
                              className="font-bold text-gray-800 text-[14px] hover:underline"
                            >
                              Tháng {currentViewDate.format("M")},{" "}
                              {currentViewDate.format("YYYY")}
                            </button>
                            <button
                              type="button"
                              onClick={handleNextMonth}
                              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <ChevronRight
                                size={18}
                                className="text-gray-600"
                              />
                            </button>
                          </div>

                          {/* Weekdays */}
                          <div className="grid grid-cols-7 gap-1 mb-2 shrink-0">
                            {weekDays.map((day) => (
                              <div
                                key={day}
                                className="text-center text-[12px] font-bold text-gray-400 pb-2 border-b border-border"
                              >
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Days Grid */}
                          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                            {days.map((item) => {
                              if (item.isEmpty) return <div key={item.key} />

                              const isSelected =
                                date &&
                                item.day === date.date() &&
                                currentViewDate.month() === date.month() &&
                                currentViewDate.year() === date.year()

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
                                    w-8 h-8 flex items-center justify-center text-[13px] rounded-md mx-auto transition-colors font-medium
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
                        </>
                      ) : (
                        <>
                          {/* Lưới chọn nhanh năm */}
                          <div className="flex items-center justify-between mb-4">
                            <button
                              type="button"
                              onClick={handlePreviousYearBlock}
                              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <ChevronLeft
                                size={18}
                                className="text-gray-600"
                              />
                            </button>
                            <div className="font-bold text-gray-800 text-[14px]">
                              {yearBlockStart} - {yearBlockStart + 11}
                            </div>
                            <button
                              type="button"
                              onClick={handleNextYearBlock}
                              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <ChevronRight
                                size={18}
                                className="text-gray-600"
                              />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {years.map((year) => {
                              const isSelectedYear =
                                currentViewDate.year() === year
                              return (
                                <button
                                  type="button"
                                  key={year}
                                  onClick={() => handleSelectYear(year)}
                                  className={`h-9 flex items-center justify-center text-[13px] rounded-md transition-colors font-medium
                                    ${isSelectedYear ? "text-white font-bold hover:brightness-90" : "text-gray-700 hover:bg-gray-100"}`}
                                  style={
                                    isSelectedYear
                                      ? { backgroundColor: color }
                                      : {}
                                  }
                                >
                                  {year}
                                </button>
                              )
                            })}
                          </div>
                        </>
                      )}
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

export default FormDatePicker
