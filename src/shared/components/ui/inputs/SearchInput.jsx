import React from "react"
import { Search } from "lucide-react"

const SearchInput = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  className = "",
  inputClassName = "",
}) => {
  return (
    <div
      className={`flex items-center w-full h-10 border border-[#C6C6C6] rounded-full focus-within:border-cath-red-700 transition-colors ${className}`}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSearch) {
            onSearch()
          }
        }}
        className={`flex-1 h-full pl-4 text-sm bg-transparent focus:outline-none ${inputClassName}`}
      />

      <button
        onClick={onSearch}
        className="h-full w-10 flex items-center justify-center rounded-full text-cath-red-700 transition-colors hover:bg-[#E5E5E5]"
      >
        <Search size={24} />
      </button>
    </div>
  )
}

export default SearchInput
