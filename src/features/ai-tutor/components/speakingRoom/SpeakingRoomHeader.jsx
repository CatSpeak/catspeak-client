import React from "react"
import LevelSelectorDropdown from "./LevelSelectorDropdown"

const SpeakingRoomHeader = ({
  title = "Phòng luyện nói tương tác 2 chiều",
  badge = "50+ Chủ đề thực tế",
  currentLevel,
  onSelectLevel,
  levelOptions = [],
}) => {
  return (
    <div className="space-y-3">
      {/* 1. Title row */}
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-headingColor uppercase">
        {title}
      </h1>

      {/* 2. Sub-row below title: Badge on left, Level selector on right */}
      <div className="flex items-center justify-between gap-4">
        <div>
          {badge && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>

        <LevelSelectorDropdown
          currentLevel={currentLevel}
          onSelectLevel={onSelectLevel}
          options={levelOptions}
        />
      </div>
    </div>
  )
}

export default SpeakingRoomHeader
