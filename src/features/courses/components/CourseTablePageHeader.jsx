import React from "react"
import { Plus } from "lucide-react"
import { SearchInput } from "@/shared/components/ui/inputs"

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
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="w-full sm:w-64 !h-10"
        />

        <button
          type="button"
          onClick={onCreate}
          className="flex items-center justify-center gap-1.5 bg-[#8B0000] hover:bg-[#700000] text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 shadow-xs active:scale-95 w-full sm:w-auto flex-shrink-0 cursor-pointer"
        >
          <span>{createLabel}</span>
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

export default CourseTablePageHeader
