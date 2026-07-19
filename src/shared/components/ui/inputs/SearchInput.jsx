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
      className={`flex items-center w-full min-w-0 sm:min-w-[360px] h-14 border border-[#e5e5e5] rounded-full focus-within:border-cath-red-700 transition-colors ${className}`}
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
        className={`flex-1 h-full pl-6 bg-transparent focus:outline-none ${inputClassName}`}
      />

      <button
        onClick={onSearch}
        className="w-12 h-12 flex items-center justify-center rounded-full group cursor-pointer shrink-0 mr-1"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-full transition-colors group-hover:bg-[#E5E5E5]">
          <Search />
        </div>
      </button>
    </div>
  )
}

export default SearchInput
