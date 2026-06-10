import React, { useState, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import useClickOutside from "@/shared/hooks/useClickOutside"

const COUNTRIES = [
  { value: "vietnam", label: "Vietnam" },
  { value: "usa", label: "United States" },
  { value: "china", label: "China" },
]

const CountryDropdown = ({ value, onChange, className = "" }) => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useClickOutside(dropdownRef, () => setOpen(false))

  const handleToggle = () => setOpen((prev) => !prev)

  const handleSelect = (country) => {
    onChange(country.value)
    setOpen(false)
  }

  const getDisplayLabel = () => {
    const match = COUNTRIES.find((c) => c.value === value)
    return match?.label || value || "Viet Nam"
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <div
        onClick={handleToggle}
        className="bg-white border border-[#e2e2e2] hover:bg-gray-50 transition-colors duration-200 rounded-2xl h-12 flex items-center px-4 cursor-pointer"
      >
        <div className="flex items-center gap-3 text-base text-gray-900 justify-between w-full">
          <span className="truncate">{getDisplayLabel()}</span>

          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <div className="absolute top-full right-0 mt-4 min-w-[200px] max-w-[280px] z-50">
            <FluentAnimation
              direction="down"
              exit
              className="rounded-lg shadow-lg bg-white overflow-hidden"
            >
              <div className="flex flex-col whitespace-nowrap">
                {COUNTRIES.map(({ value: val, label }) => {
                  const isActive = value === val

                  return (
                    <button
                      key={val}
                      onClick={() => handleSelect({ value: val, label })}
                      className={`w-full text-left px-4 h-10 text-sm transition-colors hover:bg-[#E5E5E5]`}
                      style={{
                        backgroundColor: isActive ? "#E5E5E5" : undefined,
                      }}
                    >
                      {label}
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

export default CountryDropdown
