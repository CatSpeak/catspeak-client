import React, { useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import RoomFilterModal from "@/features/rooms/components/navigation/RoomFilterModal"

const HeaderFilter = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <>
      <button 
        className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-[#F0F0F0] hover:bg-gray-200 text-gray-700 transition-colors shrink-0"
        onClick={() => setIsFilterOpen(true)}
      >
        <SlidersHorizontal size={20} strokeWidth={2} />
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
