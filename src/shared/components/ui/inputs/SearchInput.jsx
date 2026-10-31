import React, { useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"
import IconButton from "@/shared/components/ui/buttons/IconButton"

const SearchInput = ({
  value,
  onChange,
  onSearch,
  onClear,
  isLoading = false,
  placeholder = "Search...",
  className = "",
  inputClassName = "",
  buttonClassName = "",
  focusBorder = true,
  onKeyDown,
  onFocus,
  onBlur,
  inputRef,
  ariaExpanded,
  ariaControls,
  role,
  id,
  disabled = false,
}) => {
  const localRef = useRef(null)
  const resolvedRef = inputRef || localRef

  const hasCustomHeight = className
    .split(" ")
    .some((c) => c.startsWith("h-") || c.startsWith("!h-"))
  const heightClass = hasCustomHeight ? "" : "h-14"

  const handleContainerClick = (e) => {
    if (e.target.tagName !== "BUTTON" && !e.target.closest("button")) {
      resolvedRef.current?.focus()
    }
  }

  return (
    <div
      onClick={handleContainerClick}
      className={`group relative flex items-center w-full min-w-0 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-border dark:border-[#3F3F3F] rounded-full transition-colors cursor-text ${
        focusBorder ? "focus-within:border-cath-red-700" : ""
      } ${heightClass} ${className}`}
    >
      <input
        ref={resolvedRef}
        id={id}
        role={role}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        onKeyDown={(e) => {
          if (onKeyDown) {
            onKeyDown(e)
          }
          if (!e.defaultPrevented && e.key === "Enter" && onSearch) {
            onSearch()
          }
        }}
        className={`flex-1 min-w-0 h-full pl-5 pr-2 text-sm md:text-base truncate bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#AAAAAA] focus:outline-none ${inputClassName}`}
      />

      {isLoading ? (
        <div className="mr-4 shrink-0 flex items-center justify-center text-neutral-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : onClear && value ? (
        <IconButton
          onClick={(e) => {
            e?.stopPropagation()
            onClear()
          }}
          variant="ghost"
          size="sm"
          className="mr-2 shrink-0"
          innerClassName={buttonClassName}
          aria-label="Clear search"
        >
          <X className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-[#AAAAAA] dark:hover:text-white" />
        </IconButton>
      ) : (
        <IconButton
          onClick={(e) => {
            e?.stopPropagation()
            onSearch?.()
          }}
          variant="ghost"
          size="sm"
          className="mr-2 shrink-0"
          innerClassName={buttonClassName}
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-gray-500 dark:text-[#AAAAAA]" />
        </IconButton>
      )}
    </div>
  )
}

export default SearchInput
