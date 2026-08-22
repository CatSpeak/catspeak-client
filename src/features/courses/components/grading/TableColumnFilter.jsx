import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { SlidersHorizontal } from "lucide-react"
import { IconButton } from "@/shared/components/ui/buttons"

const TableColumnFilter = ({
  title,
  filterTitle = "Lọc",
  activeValue = "all",
  options = [],
  onSelect,
  isOpen = false,
  onToggle,
  onClose,
}) => {
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)
  const [coords, setCoords] = useState(null)
  const isActive = activeValue !== "all"

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX + rect.width / 2,
      })
    }
  }

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition()
    } else {
      setCoords(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)

    const handleOutsideClick = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target)
      ) {
        onClose?.()
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.()
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleButtonClick = (e) => {
    e.stopPropagation()
    if (!isOpen) {
      updatePosition()
    }
    onToggle?.()
  }

  return (
    <div ref={triggerRef} className="relative inline-flex items-center justify-center gap-1.5">
      {title && <span>{title}</span>}
      <IconButton
        size="xs"
        variant={isActive ? "primary" : "transparent"}
        className={`transition-all ${
          isActive
            ? "!bg-[#990011] !text-white shadow-xs"
            : "text-gray-400 hover:!bg-gray-100"
        }`}
        onClick={handleButtonClick}
        title={filterTitle}
        aria-label={title || filterTitle}
        aria-expanded={isOpen}
      >
        <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
      </IconButton>

      {isOpen &&
        coords !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "absolute",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: "translateX(-50%)",
            }}
            className="min-w-[170px] max-w-[240px] bg-white border border-border rounded-2xl shadow-xl p-2 z-[9999] text-left animate-in fade-in zoom-in-95 duration-100 origin-top font-normal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              {options.map((opt) => {
                const isSelected = activeValue === opt.value

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onSelect?.(opt.value)
                      onClose?.()
                    }}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors text-left cursor-pointer"
                  >
                    {/* Custom Checkbox */}
                    <div
                      className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? "bg-[#990011] border-[#990011] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path
                            d="M1 3l2 2 4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Badge Pill or Text */}
                    {opt.style ? (
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block ${opt.style}`}
                      >
                        {opt.label}
                      </span>
                    ) : (
                      <span
                        className={`text-xs font-semibold ${
                          isSelected ? "text-gray-900 font-bold" : "text-gray-700"
                        }`}
                      >
                        {opt.label}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default TableColumnFilter
