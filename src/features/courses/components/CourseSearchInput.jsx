import React from "react"
import { Search } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const CourseSearchInput = ({
  value,
  onChange,
  onSearch,
  placeholder,
  className = "",
  inputClassName = "",
}) => {
  const { t } = useLanguage()
  const resolvedPlaceholder =
    placeholder
    || t.courses?.allCourses?.searchPlaceholder
    || "Search..."

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      onSearch?.(value)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={resolvedPlaceholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className={
          inputClassName ||
          "w-full h-8 pl-4 pr-10 bg-white dark:bg-[#1A1A1A] hover:bg-gray-50/50 dark:hover:bg-[#222222] focus:bg-white dark:focus:bg-[#1A1A1A] border border-border dark:border-[#3F3F3F] focus:border-gray-300 dark:focus:border-gray-600 outline-none rounded-xl text-sm font-semibold text-gray-800 dark:text-gray-200 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-xs"
        }
      />
      <button
        type="button"
        onClick={() => onSearch?.(value)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-0 outline-none flex items-center justify-center"
        aria-label="Search"
      >
        <Search size={18} />
      </button>
    </div>
  )
}

export default CourseSearchInput
