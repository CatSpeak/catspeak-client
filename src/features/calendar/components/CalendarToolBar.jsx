import React, { useState } from "react"
import { Search, Plus } from "lucide-react"
// import Dropdown from "@/shared/components/ui/Dropdown"
import CreateEventModal from "./CreateEventModal"

const FILTER_CONFIGS = [
  {
    label: "Loại sự kiện",
    options: [
      { label: "Âm nhạc / Music", value: "music" },
      { label: "Công nghệ / Tech", value: "tech" },
      { label: "Nghệ thuật / Art", value: "art" },
      { label: "Hội thảo / Workshop", value: "workshop" },
    ],
  },
  {
    label: "Giá vé",
    options: [
      { label: "Miễn phí / Free", value: "free" },
      { label: "Trả phí / Paid", value: "paid" },
    ],
  },
  {
    label: "Thời gian diễn ra",
    options: [
      { label: "Hôm nay / Today", value: "today" },
      { label: "Tuần này / This Week", value: "week" },
      { label: "Tháng này / This Month", value: "month" },
    ],
  },
]

const CalendarToolBar = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col xl:flex-row items-center justify-end w-full mb-4 gap-4">
        {/* Filters Left - hidden until backend API is ready
        <div className="flex items-center gap-2 flex-wrap w-full xl:w-auto pb-2 xl:pb-0">
          {FILTER_CONFIGS.map((filter, idx) => (
            <FilterDropdown
              key={idx}
              label={filter.label}
              options={filter.options}
              onSelect={(val) => {}}
            />
          ))}
        </div>
        */}

        {/* Search and Create Right */}
        <div className="flex justify-end items-center gap-3 w-full xl:w-auto shrink-0 mt-2 xl:mt-0">
          {/* Search - hidden until backend API is ready
          <div className="relative flex items-center w-full sm:w-[320px]">
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              className="h-10 w-full rounded-full border border-gray-200 bg-white pl-4 pr-11 text-sm outline-none focus:border-[#8e0000] transition-all"
            />
            <Search
              className="absolute right-3 text-[#8e0000] cursor-pointer"
              size={20}
            />
          </div>
          */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-[#F2F2F2] hover:bg-[#D9D9D9] transition-all shrink-0"
            title="Create New"
          >
            <Plus size={24} color="#8e0000" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateEventModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </>
  )
}

export default CalendarToolBar
