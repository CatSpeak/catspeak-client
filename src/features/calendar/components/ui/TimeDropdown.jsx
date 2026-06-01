import React, { useState, useRef, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import colors from "@/shared/utils/colors"
import useClickOutside from "@/shared/hooks/useClickOutside"

const TimeDropdown = ({
  value,
  onChange,
  color = "#B91264",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const getCurrentTime = () => {
    const now = new Date()
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
  }

  const [selectedTime, setSelectedTime] = useState(value || getCurrentTime())

  useEffect(() => {
    if (value !== undefined) {
      setSelectedTime(value)
    }
  }, [value])

  useClickOutside(dropdownRef, () => setIsOpen(false))

  const handleHourSelect = (hour) => {
    const [, min] = selectedTime.split(":")
    const newTime = `${hour}:${min || getCurrentTime().split(":")[1]}`
    setSelectedTime(newTime)
    if (onChange) onChange(newTime)
  }

  const handleMinuteSelect = (min) => {
    const [h] = selectedTime.split(":")
    const newTime = `${h || getCurrentTime().split(":")[0]}:${min}`
    setSelectedTime(newTime)
    if (onChange) onChange(newTime)
    setIsOpen(false)
  }

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  )
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  )

  const [currentHour, currentMinute] = selectedTime.split(":")

  // Refs for auto-scrolling
  const hoursRef = useRef(null)
  const minutesRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (hoursRef.current) {
          const selectedHourEl =
            hoursRef.current.querySelector(".selected-time")
          if (selectedHourEl) {
            selectedHourEl.scrollIntoView({ block: "center" })
          }
        }
        if (minutesRef.current) {
          const selectedMinEl =
            minutesRef.current.querySelector(".selected-time")
          if (selectedMinEl) {
            selectedMinEl.scrollIntoView({ block: "center" })
          }
        }
      }, 0)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm flex items-center justify-center border border-[#c6c6c6] rounded-md px-4 h-10 text-gray-800 shadow-sm hover:bg-gray-50 transition-colors outline-none bg-white"
      >
        <span>{selectedTime}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="absolute z-50 top-full mt-1 left-0 w-[140px] h-[200px] origin-top-left pointer-events-none">
            <FluentAnimation
              direction="down"
              exit={true}
              className="pointer-events-auto w-full h-full flex bg-white border rounded-md shadow-lg overflow-hidden"
              style={{ borderColor: colors.border }}
            >
              {/* Hours Column */}
              <div
                ref={hoursRef}
                className="flex-[1] overflow-y-auto scrollbar-none border-r border-gray-100"
              >
                {hours.map((hour) => {
                  const isSelected = currentHour === hour
                  return (
                    <div
                      key={`h-${hour}`}
                      onClick={() => handleHourSelect(hour)}
                      className={`flex justify-center items-center py-2 text-sm cursor-pointer transition-colors ${
                        isSelected
                          ? "selected-time text-white font-bold hover:brightness-90"
                          : "text-gray-700 font-medium hover:bg-gray-100"
                      }`}
                      style={isSelected ? { backgroundColor: color } : {}}
                    >
                      {hour}
                    </div>
                  )
                })}
              </div>

              {/* Minutes Column */}
              <div
                ref={minutesRef}
                className="flex-[1] overflow-y-auto scrollbar-none"
              >
                {minutes.map((minute) => {
                  const isSelected = currentMinute === minute
                  return (
                    <div
                      key={`m-${minute}`}
                      onClick={() => handleMinuteSelect(minute)}
                      className={`flex justify-center items-center py-2 text-sm cursor-pointer transition-colors ${
                        isSelected
                          ? "selected-time text-white font-bold hover:brightness-90"
                          : "text-gray-700 font-medium hover:bg-gray-100"
                      }`}
                      style={isSelected ? { backgroundColor: color } : {}}
                    >
                      {minute}
                    </div>
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

export default TimeDropdown
