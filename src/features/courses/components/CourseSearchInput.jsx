import React from "react"
import { Search } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const CourseSearchInput = ({ value, onChange, placeholder, className = "" }) => {
  const { t } = useLanguage()
  const resolvedPlaceholder = placeholder
    || t.courses?.allCourses?.searchPlaceholder
    || "Search..."

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={resolvedPlaceholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full h-8 pl-4 pr-10 bg-white hover:bg-gray-50/50 focus:bg-white border border-gray-200 focus:border-gray-300 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all placeholder:text-gray-400 shadow-xs"
      />
      <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

export default CourseSearchInput
