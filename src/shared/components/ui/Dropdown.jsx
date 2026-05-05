import React, { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"

const Dropdown = ({
  options = [],
  value,
  onChange,
  trigger,
  renderOption,
  placeholder = "Select...",
  className = "",
  dropdownClassName = "min-w-[260px] max-w-[260px] overflow-x-auto",
  triggerClassName = "",
  align = "left", // 'left' | 'right' | 'center'
  maxHeightClass = "max-h-[250px]",
  activeColor = "#990011",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (option) => {
    if (onChange) onChange(option.value, option)
    setIsOpen(false)
  }

  const selectedOption = options.find((opt) => opt.value === value) || null

  const defaultTrigger = (
    <button
      type="button"
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      className={`text-sm flex items-center justify-between border border-[#C6C6C6] rounded-lg px-4 h-10 shadow-sm w-full bg-white transition-colors ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-gray-100"
          : "hover:bg-gray-50"
      } ${triggerClassName}`}
    >
      <span className="truncate mr-2">
        {selectedOption ? selectedOption.label : placeholder}
      </span>
      <ChevronDown
        size={14}
        className={`shrink-0 text-gray-500 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  )

  const defaultRenderOption = (option, isSelected) => {
    const textColor = isSelected ? option.color || activeColor : "inherit"
    return (
      <div
        className={`w-full h-10 px-3 text-left text-sm rounded-md flex items-center gap-3 ${
          isSelected ? "bg-[#F6F6F6] font-semibold" : "hover:bg-[#F6F6F6]"
        }`}
        style={isSelected ? { color: textColor } : {}}
      >
        {option.icon && (
          <div
            className="shrink-0"
            style={isSelected ? { color: textColor } : { color: "#6B7280" }}
          >
            {option.icon}
          </div>
        )}
        <div className="flex flex-col">
          <span className="whitespace-nowrap">{option.label}</span>
          {option.subtitle && (
            <span
              className={`text-xs font-normal whitespace-nowrap ${isSelected ? "" : "text-gray-500"}`}
            >
              {option.subtitle}
            </span>
          )}
        </div>
      </div>
    )
  }

  const alignClass =
    align === "right"
      ? "right-0 origin-top-right"
      : align === "center"
        ? "-translate-x-1/2 left-1/2 origin-top"
        : "left-0 origin-top-left"

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {trigger
        ? typeof trigger === "function"
          ? trigger(
              isOpen,
              selectedOption,
              () => !disabled && setIsOpen(!isOpen),
            )
          : React.cloneElement(trigger, {
              onClick: () => !disabled && setIsOpen(!isOpen),
              disabled,
            })
        : defaultTrigger}

      <AnimatePresence>
        {isOpen && (
          <FluentAnimation
            direction="down"
            exit={true}
            className={`absolute top-full mt-2 z-[60] shadow-lg border border-[#E5E5E5] rounded-lg bg-white p-1 ${maxHeightClass} overflow-auto ${alignClass} ${dropdownClassName}`}
          >
            <div className="flex flex-col gap-1 w-max min-w-full">
              {options.map((option, idx) => {
                const isSelected = option.value === value
                return (
                  <button
                    key={option.value || idx}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="w-full focus:outline-none"
                  >
                    {renderOption
                      ? renderOption(option, isSelected)
                      : defaultRenderOption(option, isSelected)}
                  </button>
                )
              })}
            </div>
          </FluentAnimation>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dropdown
