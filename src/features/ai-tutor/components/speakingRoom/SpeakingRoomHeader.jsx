import React from "react"
import LevelSelectorDropdown from "./LevelSelectorDropdown"
import { useLanguage } from "@/shared/context/LanguageContext"

const SpeakingRoomHeader = ({
  title,
  badge,
  currentLevel,
  onSelectLevel,
  levelOptions = [],
}) => {
  const { t } = useLanguage()
  const roomText = t?.aiTutor?.speakingRoom || {}
  const resolvedTitle =
    title || roomText.headerTitle || "Phòng luyện nói tương tác 2 chiều"
  const resolvedBadge = badge || roomText.headerBadge || "50+ Chủ đề thực tế"

  return (
    <div className="space-y-3">
      {/* 1. Title row */}
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-headingColor dark:text-white uppercase">
        {resolvedTitle}
      </h1>

      {/* 2. Sub-row below title: Badge on left, Level selector on right */}
      <div className="flex items-center justify-between gap-4">
        <div>
          {resolvedBadge && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-[#272727] text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-[#3F3F3F] whitespace-nowrap">
              {resolvedBadge}
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
