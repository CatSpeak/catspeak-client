import React, { useState, useRef, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Search } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import useClickOutside from "@/shared/hooks/useClickOutside"
import colors from "@/shared/utils/colors"
import { useLanguage } from "@/shared/context/LanguageContext"

const removeDiacritics = (str) => {
  if (!str) return ""
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
}

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
  activeColor = colors.primaryRed,
  disabled = false,
  enableSearch = false,
  searchPlaceholder = "Search...",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { t } = useLanguage()
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)
  const [portalCoords, setPortalCoords] = useState(null)
  const portalRef = useRef(null)

  useClickOutside(dropdownRef, (e) => {
    if (portalRef.current && portalRef.current.contains(e.target)) {
      return
    }
    setIsOpen(false)
  })

  useEffect(() => {
    if (isOpen && enableSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      setSearchQuery("")
    }
  }, [isOpen, enableSearch])

  useEffect(() => {
    const handleClose = () => setIsOpen(false)
    const handleScroll = (e) => {
      // Don't close if scrolling inside the dropdown portal itself
      if (portalRef.current && portalRef.current.contains(e.target)) return
      handleClose()
    }

    const updateCoords = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top

        // Flip up if there's less than ~300px below and more space above
        const flipUp = spaceBelow < 300 && spaceAbove > spaceBelow

        // Check horizontal clipping (assume ~260px width default)
        const forceAlignRight = rect.left + 260 > window.innerWidth

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

  const filteredOptions = useMemo(() => {
    if (!enableSearch || !searchQuery) return options
    const query = searchQuery.toLowerCase().trim()
    const cleanQuery = query.replace(/^\+/, "")
    const queryNoDiacritics = removeDiacritics(cleanQuery).replace(/\s+/g, "")

    return options.filter((opt) => {
      const label = (opt.label || "").toLowerCase()
      const val = (opt.value || "").toLowerCase()
      const cleanVal = val.replace(/^\+/, "")
      const subtitle = (opt.subtitle || "").toLowerCase()
      const searchTerms = (opt.searchTerms || "").toLowerCase()
      const cleanSearchTerms = searchTerms.replace(/\+/g, "")

      const matchLabel = removeDiacritics(label).replace(/\s+/g, "").includes(queryNoDiacritics)
      const matchSubtitle = removeDiacritics(subtitle).replace(/\s+/g, "").includes(queryNoDiacritics)
      const matchSearchTerms = removeDiacritics(cleanSearchTerms).replace(/\s+/g, "").includes(queryNoDiacritics)

      return (
        label.includes(query) ||
        val.includes(query) ||
        cleanVal.includes(cleanQuery) ||
        subtitle.includes(query) ||
        searchTerms.includes(query) ||
        cleanSearchTerms.includes(cleanQuery) ||
        matchLabel ||
        matchSubtitle ||
        matchSearchTerms
      )
    })
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
      className={`flex items-center justify-between border border-[#e5e5e5] rounded-2xl px-4 h-12 w-full bg-white text-base ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-gray-100"
          : "hover:bg-[#f0f0f0]"
      } ${triggerClassName}`}
    >
      <span className="truncate mr-2">
        {selectedOption ? selectedOption.label : placeholder}
      </span>
      <ChevronDown
        size={16}
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
        className={`w-full min-h-[48px] py-2 px-4 text-left text-base rounded-md flex items-center gap-3 ${
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
        <div className="flex flex-col min-w-0 flex-1">
          <span className="whitespace-normal break-words leading-tight">{option.label}</span>
          {option.subtitle && (
            <span
              className={`text-xs font-normal whitespace-normal break-words mt-0.5 ${isSelected ? "" : "text-gray-500"}`}
            >
              {option.subtitle}
            </span>
          )}
        </div>
      </div>
    )
  }

  const alignClass = portalCoords?.forceAlignRight
    ? "right-0 origin-top-right"
    : align === "right"
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
                  <FluentAnimation
                    direction={portalCoords.flipUp ? "up" : "down"}
                    exit={true}
                    className={`absolute ${portalCoords.flipUp ? "bottom-full mb-4 origin-bottom" : "top-full mt-4"} flex flex-col pointer-events-auto shadow-lg border border-[#E5E5E5] rounded-2xl bg-white ${maxHeightClass} overflow-hidden ${alignClass} ${dropdownClassName}`}
                  >
                    {enableSearch && (
                      <div className="px-3 py-2 shrink-0 bg-white z-10 border-b border-gray-100">
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
                    <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:my-4 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]">
                      <div className="flex flex-col gap-1 p-1">
                        {filteredOptions.length > 0 ? (
                          filteredOptions.map((option, idx) => {
                            const isSelected = option.value === value
                            return (
                              <button
                                key={option.key || option.code || (option.value ? `${option.value}-${idx}` : idx)}
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
                            {t?.noOptionsFound || "No options found"}
                          </div>
                        )}
                      </div>
                    </div>

                  </FluentAnimation>
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  )
}

export default Dropdown
