import React, { useState, useMemo } from "react"
import { SlidersHorizontal } from "lucide-react"
import RoomFilterModal from "@/features/rooms/components/navigation/RoomFilterModal"
import { useSearchParams } from "react-router-dom"

const HeaderFilter = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchParams] = useSearchParams()

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchParams.get("requiredLevels")) {
      count += searchParams.getAll("requiredLevels").length
    }
    if (searchParams.get("topics")) {
      count += searchParams.getAll("topics").length
    }
    return count
  }, [searchParams])

  return (
    <>
      <button 
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#F0F0F0] hover:bg-gray-200 text-gray-700 transition-colors shrink-0"
        onClick={() => setIsFilterOpen(true)}
      >
        <SlidersHorizontal size={20} strokeWidth={2} />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cath-red-700 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Professional Filter Modal */}
      <RoomFilterModal 
        open={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
      />
    </>
  )
}

export default HeaderFilter
