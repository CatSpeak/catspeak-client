import React from "react"

const SpeakingRoomFilterTabs = ({
  tabs = [],
  selectedFilter,
  onSelectFilter,
}) => {
  return (
    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
      {tabs.map((tab) => {
        const isActive = selectedFilter === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectFilter(tab.id)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-[#990011] text-white font-semibold shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default SpeakingRoomFilterTabs
