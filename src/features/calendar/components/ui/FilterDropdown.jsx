import React, { useState, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import useClickOutside from "@/shared/hooks/useClickOutside"

const FilterDropdown = ({ label, options = [], onSelect }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const dropdownRef = useRef(null)

  useClickOutside(dropdownRef, () => setIsOpen(false))

  const handleSelect = (option) => {
    setSelected(option)
    setIsOpen(false)
    if (onSelect) onSelect(option)
  }

  // Clear selection if the same property is tapped again
  const handleToggle = (e) => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={`flex items-center px-3 gap-3 rounded-[5px] hover:bg-[#FAFAFA] text-sm leading-5 border border-[#E5E5E5] min-w-[130px] min-h-[32px] justify-between`}
      >
        <span className="truncate">{selected ? selected.label : label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="absolute z-50 mt-2 min-w-[180px] max-w-[280px] whitespace-nowrap w-full">
            <FluentAnimation
              direction="down"
              exit={true}
              className="rounded-[5px] bg-[#F9F9F9] shadow-lg border border-[#E5E5E5] overflow-hidden"
            >
              <div className="flex flex-col gap-1 p-1">
                {options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(option)}
                    className={`w-full h-[32px] rounded-[5px] text-left px-3 text-sm hover:bg-[#F0F0F0] ${
                      selected?.value === option.value
                        ? "text-cath-red-700 bg-[#F0F0F0]"
                        : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </FluentAnimation>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FilterDropdown
