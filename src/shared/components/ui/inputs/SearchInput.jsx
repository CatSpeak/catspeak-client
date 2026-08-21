import React from "react"
import { Search } from "lucide-react"
import IconButton from "@/shared/components/ui/buttons/IconButton"

const SearchInput = ({
  value,
  onChange,
  onSearch,
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

        <IconButton
          onClick={onSearch}
          variant="ghost"
          size="sm"
          className="mr-1 shrink-0"
          innerClassName={buttonClassName}
        >
          <Search className="w-4 h-4 text-gray-500" />
        </IconButton>
      </div>
    </div>
  )
}

export default SearchInput
