import React from "react"
import { Search } from "lucide-react"

const CourseSearchInput = ({ value, onChange, placeholder = "Search...", className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full h-10 pl-4 pr-10 bg-white hover:bg-gray-50/50 focus:bg-white border border-gray-200 focus:border-gray-300 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all placeholder:text-gray-400 shadow-xs"
      />
      <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

export default CourseSearchInput
