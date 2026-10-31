import React, { useState, useMemo } from "react"
import { SlidersHorizontal } from "lucide-react"
import RoomFilterModal from "@/features/rooms/components/navigation/RoomFilterModal"
import { useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import IconButton from "@/shared/components/ui/buttons/IconButton"

const HeaderFilter = ({ className = "" }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { t } = useLanguage()
  const filterLabel = t?.header?.filterRooms || "Lọc phòng"
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
      <IconButton
        onClick={() => setIsFilterOpen(true)}
        variant="ghost"
        aria-label={filterLabel}
        title={filterLabel}
        className={className}
        badge={
          activeFilterCount > 0 && (
            <span className="absolute top-0 right-0 z-10 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full bg-cath-red-700 text-[10px] font-bold leading-none text-white shadow-xs pointer-events-none ring-2 ring-white dark:ring-[#0F0F0F]">
              {activeFilterCount}
            </span>
          )
        }
      >
        <SlidersHorizontal size={20} strokeWidth={2} aria-hidden="true" />
      </IconButton>

      {/* Professional Filter Modal */}
      <RoomFilterModal 
        open={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
      />
    </>
  )
}

export default HeaderFilter
