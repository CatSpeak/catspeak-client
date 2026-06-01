import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
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
  const portalRef = useRef(null)
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

        // TimeDropdown is 200px tall
        const flipUp = spaceBelow < 220 && spaceAbove > spaceBelow

        // Width is 140px
        const forceAlignRight = rect.left + 140 > window.innerWidth

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
            const container = hoursRef.current
            container.scrollTop =
              selectedHourEl.offsetTop -
              container.clientHeight / 2 +
              selectedHourEl.clientHeight / 2
          }
        }
        if (minutesRef.current) {
          const selectedMinEl =
            minutesRef.current.querySelector(".selected-time")
          if (selectedMinEl) {
            const container = minutesRef.current
            container.scrollTop =
              selectedMinEl.offsetTop -
              container.clientHeight / 2 +
              selectedMinEl.clientHeight / 2
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
        className="hover:bg-[#f0f0f0] flex items-center justify-center border border-[#e5e5e5] rounded-2xl px-4 h-12 outline-none bg-white"
      >
        <span>{selectedTime}</span>
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
                    className={`absolute z-50 ${portalCoords.flipUp ? "bottom-full mb-1 origin-bottom" : "top-full mt-1 origin-top"} ${portalCoords.forceAlignRight ? "right-0 origin-top-right" : "left-0 origin-top-left"} w-[140px] h-[200px] pointer-events-none`}
                  >
                    <FluentAnimation
                      direction={portalCoords.flipUp ? "up" : "down"}
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
                              style={
                                isSelected ? { backgroundColor: color } : {}
                              }
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
                              style={
                                isSelected ? { backgroundColor: color } : {}
                              }
                            >
                              {minute}
                            </div>
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

export default TimeDropdown
