import React, { useState, useRef, useEffect, useMemo } from "react"
import { ChevronDown, Search } from "lucide-react"
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
  dropdownClassName = "min-w-[260px] max-w-[260px]",
  triggerClassName = "",
  align = "left", // 'left' | 'right' | 'center'
  maxHeightClass = "max-h-[250px]",
  activeColor = "#990011",
  disabled = false,
  enableSearch = false,
  searchPlaceholder = "Search...",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && enableSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      setSearchQuery("")
    }
  }, [isOpen, enableSearch])

  const filteredOptions = useMemo(() => {
    if (!enableSearch || !searchQuery) return options
    const query = searchQuery.toLowerCase()
    return options.filter((opt) => opt.label.toLowerCase().includes(query))
  }, [options, enableSearch, searchQuery])

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
        <div className="flex flex-col min-w-0">
          <span className="truncate">{option.label}</span>
          {option.subtitle && (
            <span
              className={`text-xs font-normal truncate ${isSelected ? "" : "text-gray-500"}`}
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
            className={`absolute top-full mt-2 z-[60] shadow-lg border border-[#E5E5E5] rounded-lg bg-white ${maxHeightClass} overflow-y-auto overflow-x-hidden ${alignClass} ${dropdownClassName}`}
          >
            <div className="flex flex-col w-full">
              {enableSearch && (
                <div className="px-3 py-2 sticky top-0 bg-white z-10 border-b border-gray-100">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={14} className="text-gray-400" />
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#990011]"
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1 p-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, idx) => {
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
                  })
                ) : (
                  <div className="px-3 py-4 text-sm text-center text-gray-500">
                    No options found
                  </div>
                )}
              </div>
            </div>
          </FluentAnimation>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dropdown
