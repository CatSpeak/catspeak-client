import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"

const TimeDropdown = ({
  value,
  onChange,
  color = "#B91264",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const portalRef = useRef(null)

  const [selectedTime, setSelectedTime] = useState(value !== undefined ? value : "")

  useEffect(() => {
    if (value !== undefined) {
      setSelectedTime(value)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        (!portalRef.current || !portalRef.current.contains(event.target))
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

        // TimeDropdown list is ~200px tall
        const flipUp = spaceBelow < 220 && spaceAbove > spaceBelow

        // Width is 100px
        const forceAlignRight = rect.left + 100 > window.innerWidth

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

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    if (onChange) onChange(time)
    setIsOpen(false)
  }

  const times = Array.from({ length: 24 * 4 }, (_, i) => {
    const h = Math.floor(i / 4)
      .toString()
      .padStart(2, "0")
    const m = ((i % 4) * 15).toString().padStart(2, "0")
    return `${h}:${m}`
  })

  // Ensure the current selected time is in the list, if not, add it
  const displayTimes = [...times]
  if (!displayTimes.includes(selectedTime)) {
    displayTimes.push(selectedTime)
    displayTimes.sort()
  }

  const listRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (listRef.current) {
          const selectedEl = listRef.current.querySelector(".selected-time")
          if (selectedEl) {
            const container = listRef.current
            container.scrollTop =
              selectedEl.offsetTop -
              container.clientHeight / 2 +
              selectedEl.clientHeight / 2
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
        className={`hover:bg-[#f0f0f0] flex items-center justify-center rounded-2xl px-4 h-12 outline-none bg-white min-w-[90px] transition-all border ${
          isOpen ? "border-2" : "border-[#e5e5e5]"
        }`}
        style={isOpen ? { borderColor: color } : {}}
      >
        <span className={`text-base ${!selectedTime ? "text-[#7A7574]" : ""}`}>
          {selectedTime || "Chọn giờ"}
        </span>
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
                    className={`absolute z-50 ${
                      portalCoords.flipUp
                        ? "bottom-full mb-4 origin-bottom"
                        : "top-full mt-4 origin-top"
                    } ${
                      portalCoords.forceAlignRight
                        ? "right-0 origin-top-right"
                        : "left-0 origin-top-left"
                    } w-[100px] h-[220px] pointer-events-none`}
                  >
                    <FluentAnimation
                      direction={portalCoords.flipUp ? "up" : "down"}
                      exit={true}
                      className="pointer-events-auto w-full h-full flex flex-col bg-white border border-[#E5E5E5] rounded-2xl shadow-lg overflow-hidden"
                    >
                      <div
                        ref={listRef}
                        className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:my-4 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"
                      >
                        <div className="flex flex-col gap-1 p-1">
                          {displayTimes.map((time) => {
                            const isSelected = selectedTime === time;
                            return (
                              <div
                                key={time}
                                onClick={() => handleTimeSelect(time)}
                                className={`w-full h-12 px-4 text-left text-base rounded-md flex items-center cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-[#F6F6F6] font-semibold selected-time"
                                    : "hover:bg-[#F6F6F6]"
                                }`}
                                style={isSelected ? { color: color } : {}}
                              >
                                {time}
                              </div>
                            );
                          })}
                        </div>
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
  );
}

export default TimeDropdown
