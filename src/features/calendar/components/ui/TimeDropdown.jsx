import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"

const TimeDropdown = ({
  value,
  onChange,
  color = "#990011",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const portalRef = useRef(null)

  const [selectedTime, setSelectedTime] = useState(
    value !== undefined && value !== null ? value : ""
  )

  useEffect(() => {
    if (value !== undefined) {
      setSelectedTime(value || "")
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

        // TimeDropdown list is ~220px tall
        const flipUp = spaceBelow < 240 && spaceAbove > spaceBelow

        const forceAlignRight = rect.left + rect.width > window.innerWidth

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

  // Ensure the current selected time is in the list only if it's a valid non-empty string
  const trimmedSelectedTime =
    typeof selectedTime === "string" ? selectedTime.trim() : ""

  const displayTimes = [...times]
  if (trimmedSelectedTime && !displayTimes.includes(trimmedSelectedTime)) {
    displayTimes.push(trimmedSelectedTime)
    displayTimes.sort()
  }

  // Ensure no empty options are ever displayed
  const validTimes = displayTimes.filter(
    (t) => typeof t === "string" && t.trim() !== "",
  )

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
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-12 px-4 rounded border text-sm font-medium transition-colors duration-150 flex items-center justify-between gap-2 outline-none select-none bg-white dark:bg-[#272727] hover:bg-primaryBg dark:hover:bg-[#3D3D3D] ${
          isOpen
            ? "border-cath-red-700 dark:border-red-400"
            : "border-border dark:border-[#3F3F3F]"
        }`}
        style={
          isOpen && color && !["#990011", "#B91264"].includes(color)
            ? { borderColor: color }
            : {}
        }
      >
        <span
          className={`truncate ${
            selectedTime
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-[#AAAAAA]"
          }`}
        >
          {selectedTime || "Chọn giờ"}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-500 dark:text-[#AAAAAA] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
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
                        ? "bottom-full mb-1 origin-bottom"
                        : "top-full mt-1 origin-top"
                    } ${
                      portalCoords.forceAlignRight
                        ? "right-0 origin-top-right"
                        : "left-0 origin-top-left"
                    } pointer-events-none`}
                    style={{
                      width: Math.max(portalCoords.width, 110),
                      height: 220,
                    }}
                  >
                    <FluentAnimation
                      direction={portalCoords.flipUp ? "up" : "down"}
                      exit={true}
                      className="pointer-events-auto w-full h-full flex flex-col bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#3F3F3F] rounded-xl shadow-lg overflow-hidden"
                    >
                      <div
                        ref={listRef}
                        className="flex-1 overflow-y-auto overflow-x-hidden p-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:my-2 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"
                      >
                        <div className="flex flex-col gap-0.5">
                          {validTimes.map((time) => {
                            const isSelected = Boolean(
                              trimmedSelectedTime && trimmedSelectedTime === time,
                            )
                            return (
                              <button
                                key={time}
                                type="button"
                                onClick={() => handleTimeSelect(time)}
                                className={`w-full min-h-[40px] px-3 py-2 text-left text-sm font-medium rounded-lg flex items-center justify-between cursor-pointer transition-colors outline-none ${
                                  isSelected
                                    ? "bg-primaryBg dark:bg-[#272727] text-cath-red-700 dark:text-red-400 font-semibold selected-time"
                                    : "hover:bg-primaryBg dark:hover:bg-[#272727] text-gray-900 dark:text-neutral-200"
                                }`}
                                style={
                                  isSelected &&
                                  color &&
                                  !["#990011", "#B91264"].includes(color)
                                    ? { color }
                                    : {}
                                }
                              >
                                <span>{time}</span>
                              </button>
                            )
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
