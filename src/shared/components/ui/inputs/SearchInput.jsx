import React from "react"
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
  return (
    <div
      className={`group relative flex items-center justify-center w-full h-12 ${className}`}
    >
      <div
        className={`flex items-center w-full min-w-0 h-10 bg-white text-black border border-[#e5e5e5] rounded-full transition-colors ${
          focusBorder ? "focus-within:border-cath-red-700" : ""
        }`}
      >
        <input
          ref={inputRef}
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
          className={`flex-1 min-w-0 h-full pl-4 pr-2 text-sm truncate bg-transparent focus:outline-none ${inputClassName}`}
        />

        {isLoading ? (
          <div className="mr-3 shrink-0 flex items-center justify-center text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : onClear && value ? (
          <IconButton
            onClick={onClear}
            variant="ghost"
            size="sm"
            className="mr-1 shrink-0"
            innerClassName={buttonClassName}
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
          </IconButton>
        ) : (
          <IconButton
            onClick={onSearch}
            variant="ghost"
            size="sm"
            className="mr-1 shrink-0"
            innerClassName={buttonClassName}
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-gray-500" />
          </IconButton>
        )}
      </div>
    </div>
  )
}

export default SearchInput
