import React, { useState, useRef, useEffect, useLayoutEffect } from "react"
import { createPortal } from "react-dom"
import dayjs from "dayjs"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { formatDateInput, maskDateInput, parseDateInput, shouldShowDateFormatError } from "../../utils/dateInput"

const FormDatePicker = ({
  value,
  onChange,
  placeholder = "Chọn ngày",
  error,
  helperText,
  invalidDateMessage,
  color = "#8e0000",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState("days") // "days" | "years"
  const dropdownRef = useRef(null)
  const portalRef = useRef(null)
  const [lastEmittedValue, setLastEmittedValue] = useState(null)
  const [hasBlurred, setHasBlurred] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)
  const pendingCaret = useRef(null)

  useLayoutEffect(() => {
    if (pendingCaret.current !== null) {
      inputRef.current?.setSelectionRange(pendingCaret.current, pendingCaret.current)
      pendingCaret.current = null
    }
  })

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
    if (value === lastEmittedValue) {
      // The parent acknowledged our change. Preserve the user's text and caret.
    } else if (value) {
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
        const winWidth = typeof window !== "undefined" ? window.innerWidth : 360
        const newWidth = Math.min(rect.width, winWidth - 16)
        const newLeft = Math.max(8, Math.min(rect.left + window.scrollX, winWidth - newWidth - 8))

        setPortalCoords({
          top: rect.top + window.scrollY,
          left: newLeft,
          width: newWidth,
          height: rect.height,
          flipUp,
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
    let rawValue = e.target.value
    let selStart = e.target.selectionStart

    if (
      inputValue.endsWith("/") &&
      rawValue === inputValue.slice(0, -1) &&
      selStart === rawValue.length
    ) {
      rawValue = rawValue.slice(0, -1)
      selStart = rawValue.length
    }

    const { value: val, caret } = maskDateInput(rawValue, selStart)
    pendingCaret.current = caret
    e.target.setSelectionRange(caret, caret)
    setInputValue(val)
    const isoDate = parseDateInput(val)
    const newDate = isoDate ? dayjs(isoDate) : null
    setDate(newDate)
    if (newDate) {
      setCurrentViewDate(newDate.startOf("month"))
      setYearBlockStart(Math.floor(newDate.year() / 12) * 12)
    }
    emitChange(newDate)
  }

  const emitChange = (selectedDate) => {
    const nextValue = selectedDate ? selectedDate.format("YYYY-MM-DD") : ""
    setLastEmittedValue(nextValue)
    if (onChange) {
      onChange({
        target: {
          value: nextValue,
          type: "text",
        },
      })
    }
  }

  const handleSelectDate = (dayNumber) => {
    const selectedDate = currentViewDate.date(dayNumber)
    setDate(selectedDate)
    setInputValue(selectedDate.format("DD/MM/YYYY"))
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
  const showInvalidInput = shouldShowDateFormatError(inputValue, isFocused, hasBlurred)
  const showParentError = Boolean(error) && !isFocused
  const displayedHelper = showInvalidInput && invalidDateMessage
    ? invalidDateMessage
    : (!isFocused ? helperText : null)

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block w-full ${className}`}
    >
      <div
        className={`h-14 w-full flex items-center justify-between rounded-md border px-4 text-left transition-colors focus-within:border-primary hover:border-primary
        ${showParentError || showInvalidInput ? "!border-red-500 focus-within:!border-red-500 animate-shake" : "border-border"}
        ${disabled ? "cursor-not-allowed opacity-80 bg-gray-50" : "bg-white"}`}
        onClick={() => {
          if (!disabled && !isOpen) setIsOpen(true)
        }}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={() => {
            setIsFocused(false)
            setHasBlurred(true)
            const isoDate = parseDateInput(inputValue)
            if (isoDate) setInputValue(formatDateInput(isoDate))
          }}
          onKeyDown={(e) => {
            const input = e.currentTarget
            const start = input.selectionStart
            if (start !== input.selectionEnd) return
            // Delete the adjacent digit rather than repeatedly restoring a separator.
            if (e.key === "Backspace" && input.value[start - 1] === "/") {
              input.setSelectionRange(start - 1, start - 1)
            } else if (e.key === "Delete" && input.value[start] === "/") {
              input.setSelectionRange(start + 1, start + 1)
            }
          }}
          aria-invalid={showParentError || showInvalidInput}
          onFocus={() => {
            setIsFocused(true)
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
      {displayedHelper && <p className="mt-1 text-xs text-red-600">{displayedHelper}</p>}

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
                  maxWidth: "calc(100vw - 16px)",
                  height: portalCoords.height,
                  zIndex: 9999,
                  pointerEvents: "none",
                }}
              >
                <div className="relative w-full h-full">
                  <div
                    className={`absolute z-50 ${portalCoords.flipUp ? "bottom-full mb-2" : "top-full mt-2"} left-0 w-full pointer-events-none`}
                  >
                    <FluentAnimation
                      direction={portalCoords.flipUp ? "up" : "down"}
                      exit={true}
                      className="pointer-events-auto bg-white border border-border rounded-xl shadow-lg p-4 flex flex-col w-full"
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
