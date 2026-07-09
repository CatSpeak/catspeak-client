import React from "react"
import { ChevronDown } from "lucide-react"

const CourseSelectFilter = ({ value, onChange, options, className = "" }) => {
  return (
    <div className={`relative shrink-0 ${className}`}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 outline-none appearance-none cursor-pointer hover:border-gray-300"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

export default CourseSelectFilter
