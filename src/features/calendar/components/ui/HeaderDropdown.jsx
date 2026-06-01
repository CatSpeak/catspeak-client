import React, { useState, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import useClickOutside from "@/shared/hooks/useClickOutside"

const HeaderDropdown = ({ triggerIcon, label, children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useClickOutside(dropdownRef, () => setIsOpen(false))

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border border-white rounded-full px-3 py-1.5 bg-white transition text-black"
        type="button"
      >
        {triggerIcon}
        <span className="text-sm font-medium">{label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="absolute z-50 mt-2 min-w-[150px] w-auto pointer-events-none left-0 origin-top-left sm:left-auto sm:right-0 sm:origin-top-right">
            <FluentAnimation
              direction="down"
              exit={true}
              className="pointer-events-auto rounded-[12px] bg-white shadow-lg border border-gray-100 ring-1 ring-black ring-opacity-5 overflow-hidden"
            >
              {typeof children === "function"
                ? children(() => setIsOpen(false))
                : children}
            </FluentAnimation>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HeaderDropdown
