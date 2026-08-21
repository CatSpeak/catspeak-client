import React, { useState, useRef, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Search, Check, Loader2 } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import useClickOutside from "@/shared/hooks/useClickOutside"
import colors from "@/shared/utils/colors"
import { useLanguage } from "@/shared/context/LanguageContext"
import MenuItem from "@/shared/components/ui/MenuItem"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const removeDiacritics = (str) => {
  if (!str) return ""
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
}

/**
 * Dropdown component supporting single choice, multiple choice, dynamic API search,
 * portal positioning, loading states, and full i18n support.
 */
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
  roundedClass = "rounded-full",
  align = "left", // 'left' | 'right' | 'center'
  maxHeightClass = "max-h-[250px]",
  activeColor = colors.primaryRed,
  disabled = false,
  enableSearch = false,
  searchPlaceholder,
  mode = "single", // "single" | "multiple"
  handleSearch, // (keyword: string) => void - Dynamic API search handler
  loading = false, // Boolean - Loading indicator when fetching dynamic options
  searchDebounceMs = 300, // Debounce delay in ms for handleSearch
  closeOnSelect, // Optional boolean override for closing dropdown on select
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { t } = useLanguage()
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)
  const [portalCoords, setPortalCoords] = useState(null)
  const portalRef = useRef(null)

  const isMultiple = mode === "multiple"
  const isSearchActive = enableSearch || Boolean(handleSearch)

  // Normalize selected values for multiple and single mode
  const selectedValues = useMemo(() => {
    if (isMultiple) {
      if (Array.isArray(value)) return value
      if (value !== undefined && value !== null && value !== "") return [value]
      return []
    }
    return value !== undefined && value !== null ? [value] : []
  }, [isMultiple, value])

  const isOptionSelected = (optVal) => {
    if (isMultiple) {
      return selectedValues.includes(optVal)
    }
    return value === optVal
  }

  const selectedOption = useMemo(() => {
    if (isMultiple) return null
    return options.find((opt) => opt.value === value) || null
  }, [isMultiple, options, value])

  const selectedOptionsList = useMemo(() => {
    if (!isMultiple) return []
    return options.filter((opt) => selectedValues.includes(opt.value))
  }, [isMultiple, options, selectedValues])

  useClickOutside(dropdownRef, (e) => {
    if (portalRef.current && portalRef.current.contains(e.target)) {
      return
    }
    setIsOpen(false)
  })

  // Focus search input on open
  useEffect(() => {
    if (isOpen && isSearchActive) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else if (!isOpen) {
      setSearchQuery("")
    }
  }, [isOpen, isSearchActive])

  // Debounced API search callback
  const handleSearchRef = useRef(handleSearch)
  handleSearchRef.current = handleSearch

  useEffect(() => {
    if (!isOpen || !handleSearchRef.current) return
    const timer = setTimeout(() => {
      handleSearchRef.current?.(searchQuery)
    }, searchDebounceMs)

    return () => clearTimeout(timer)
  }, [searchQuery, isOpen, searchDebounceMs])

  // Portal positioning and coordinate calculation
  useEffect(() => {
    const updateCoords = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top

        // Flip up if there's less than ~300px below and more space above
        const flipUp = spaceBelow < 300 && spaceAbove > spaceBelow

        // Check horizontal clipping (assume ~260px width default)
        const forceAlignRight = rect.left + 260 > window.innerWidth

        setPortalCoords((prev) => {
          const newTop = rect.top + window.scrollY
          const newLeft = rect.left + window.scrollX

          if (
            prev &&
            prev.top === newTop &&
            prev.left === newLeft &&
            prev.width === rect.width &&
            prev.height === rect.height &&
            prev.flipUp === flipUp &&
            prev.forceAlignRight === forceAlignRight
          ) {
            return prev
          }

          return {
            top: newTop,
            left: newLeft,
            width: rect.width,
            height: rect.height,
            flipUp,
            forceAlignRight,
          }
        })
      }
    }

    const handleScroll = (e) => {
      if (portalRef.current && portalRef.current.contains(e.target)) return
      updateCoords()
    }

    if (isOpen) {
      updateCoords()
      window.addEventListener("resize", updateCoords)
      window.addEventListener("scroll", handleScroll, true)
      return () => {
        window.removeEventListener("resize", updateCoords)
        window.removeEventListener("scroll", handleScroll, true)
      }
    }
  }, [isOpen])

  // Filter options: if handleSearch is provided, parent/API controls options
  const filteredOptions = useMemo(() => {
    if (handleSearch) return options
    if (!enableSearch || !searchQuery) return options
    const query = searchQuery.toLowerCase().trim()
    const cleanQuery = query.replace(/^\+/, "")
    const queryNoDiacritics = removeDiacritics(cleanQuery).replace(/\s+/g, "")

    return options.filter((opt) => {
      const label = String(opt.label ?? "").toLowerCase()
      const val = String(opt.value ?? "").toLowerCase()
      const subtitle = String(opt.subtitle ?? "").toLowerCase()
      const searchTerms = String(opt.searchTerms ?? "").toLowerCase()

      const cleanVal = val.replace(/^\+/, "")
      const cleanSearchTerms = searchTerms.replace(/\+/g, "")

      const matchLabel = removeDiacritics(label)
        .replace(/\s+/g, "")
        .includes(queryNoDiacritics)
      const matchSubtitle = removeDiacritics(subtitle)
        .replace(/\s+/g, "")
        .includes(queryNoDiacritics)
      const matchSearchTerms = removeDiacritics(cleanSearchTerms)
        .replace(/\s+/g, "")
        .includes(queryNoDiacritics)

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
  }, [options, enableSearch, searchQuery, handleSearch])

  const handleSelect = (option) => {
    if (disabled || option.disabled) return

    if (isMultiple) {
      const isSelected = selectedValues.includes(option.value)
      const nextValues = isSelected
        ? selectedValues.filter((v) => v !== option.value)
        : [...selectedValues, option.value]

      const nextOptions = options.filter((opt) =>
        nextValues.includes(opt.value),
      )

      if (onChange) {
        onChange(nextValues, nextOptions)
      }

      if (closeOnSelect === true) {
        setIsOpen(false)
      }
    } else {
      if (onChange) {
        onChange(option.value, option)
      }
      if (closeOnSelect !== false) {
        setIsOpen(false)
      }
    }
  }

  // Resolved translations
  const resolvedSearchPlaceholder =
    searchPlaceholder ||
    t?.search ||
    t?.common?.search ||
    "Search..."

  const resolvedNoOptionsFound =
    t?.noOptionsFound ||
    t?.common?.noOptionsFound ||
    "No options found"

  const resolvedLoading =
    t?.loading ||
    t?.common?.loading ||
    "Loading..."

  // Default trigger content based on single/multiple mode
  const renderDefaultTriggerContent = () => {
    if (!isMultiple) {
      return (
        <span className="flex-1 text-left truncate min-w-0">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      )
    }

    if (selectedValues.length === 0) {
      return (
        <span className="flex-1 text-left truncate min-w-0 text-gray-500">
          {placeholder}
        </span>
      )
    }

    const firstMatch = options.find((opt) => opt.value === selectedValues[0])
    const firstLabel = firstMatch ? firstMatch.label : selectedValues[0]

    if (selectedValues.length === 1) {
      return (
        <span className="flex-1 text-left truncate min-w-0">
          {firstLabel}
        </span>
      )
    }

    return (
      <span className="flex-1 text-left truncate min-w-0 flex items-center gap-1.5">
        <span className="truncate">{firstLabel}</span>
        <span className="shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-[#990011]">
          +{selectedValues.length - 1}
        </span>
      </span>
    )
  }

  const defaultTrigger = (
    <PillButton
      type="button"
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      variant="secondary"
      roundedClass={roundedClass}
      startIcon={
        !isMultiple
          ? selectedOption?.icon
          : selectedValues.length === 1
            ? options.find((opt) => opt.value === selectedValues[0])?.icon
            : undefined
      }
      endIcon={
        <ChevronDown
          className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
        />
      }
      className={`w-full ${triggerClassName}`}
    >
      {renderDefaultTriggerContent()}
    </PillButton>
  )

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
            isMultiple ? selectedOptionsList : selectedOption,
            () => !disabled && setIsOpen(!isOpen),
            {
              isMultiple,
              selectedValues,
              selectedOptions: selectedOptionsList,
            },
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
                data-dropdown-portal="true"
                className="dropdown-portal"
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
                    className={`absolute ${portalCoords.flipUp
                        ? "bottom-full mb-2 origin-bottom"
                        : "top-full mt-2"
                      } flex flex-col pointer-events-auto shadow-lg border border-border rounded-xl bg-white ${maxHeightClass} overflow-hidden ${alignClass} ${dropdownClassName}`}
                    data-dropdown-portal="true"
                  >
                    {isSearchActive && (
                      <div className="px-3 py-2 shrink-0 bg-white z-10 border-b border-border">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {loading && handleSearch ? (
                              <Loader2
                                size={14}
                                className="text-gray-400 animate-spin"
                              />
                            ) : (
                              <Search size={14} className="text-gray-400" />
                            )}
                          </div>
                          <input
                            ref={searchInputRef}
                            type="text"
                            className="w-full pl-9 pr-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:border-cath-red-700"
                            placeholder={resolvedSearchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex-1 py-[2px] overflow-y-auto overflow-x-hidden">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
                          <Loader2
                            size={16}
                            className="animate-spin text-[#990011]"
                          />
                          <span>{resolvedLoading}</span>
                        </div>
                      ) : filteredOptions.length > 0 ? (
                        filteredOptions.map((option, idx) => {
                          const isSelected = isOptionSelected(option.value)
                          const optionKey =
                            option.key ||
                            option.code ||
                            (option.value !== undefined && option.value !== null
                              ? `${option.value}-${idx}`
                              : idx)

                          return renderOption ? (
                            <button
                              key={optionKey}
                              type="button"
                              disabled={option.disabled}
                              onClick={() => handleSelect(option)}
                              className="group w-full flex items-center focus:outline-none px-1 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {renderOption(option, isSelected, {
                                isMultiple,
                                isSelected,
                              })}
                            </button>
                          ) : (
                            <MenuItem
                              key={optionKey}
                              onClick={() =>
                                !option.disabled && handleSelect(option)
                              }
                              isSelected={isSelected}
                              activeColor={option.color || activeColor}
                              icon={option.icon}
                              label={option.label}
                              rightText={option.rightText}
                              rightContent={
                                isMultiple ? (
                                  <div className="flex items-center ml-2">
                                    <div
                                      className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${isSelected
                                          ? "bg-[#990011] border-[#990011] text-white"
                                          : "border-gray-300 bg-white group-hover:border-gray-400"
                                        }`}
                                    >
                                      {isSelected && (
                                        <Check size={12} strokeWidth={3} />
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  option.rightContent
                                )
                              }
                              className={
                                option.disabled
                                  ? "opacity-50 pointer-events-none"
                                  : ""
                              }
                            />
                          )
                        })
                      ) : (
                        <div className="px-3 py-6 text-sm text-center text-gray-500">
                          {resolvedNoOptionsFound}
                        </div>
                      )}
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
