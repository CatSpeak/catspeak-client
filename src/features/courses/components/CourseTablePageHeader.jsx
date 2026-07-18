import React from "react"
import { Plus } from "lucide-react"
import CourseSearchInput from "./CourseSearchInput"

const CourseTablePageHeader = ({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  createLabel,
  onCreate,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 className="text-2xl font-bold tracking-tight text-gray-950">
        {title}
      </h1>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <CourseSearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="w-full sm:w-64"
        />

        <button
          type="button"
          onClick={onCreate}
          className="flex items-center justify-center gap-2 bg-[#990011] hover:bg-[#80000e] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm active:scale-95 w-full sm:w-auto flex-shrink-0"
        >
          <Plus size={16} />
          <span>{createLabel}</span>
        </button>
      </div>
    </div>
  )
}

export default CourseTablePageHeader
