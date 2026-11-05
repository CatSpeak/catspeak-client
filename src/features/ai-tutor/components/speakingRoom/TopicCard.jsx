import React from "react"
import { Lock } from "lucide-react"

const TopicCard = ({
  topic,
  isSelected = false,
  onSelect,
}) => {
  if (!topic) return null

  const isLocked = topic.isLocked

  return (
    <div
      id={`topic-card-${topic.id}`}
      onClick={() => {
        if (!isLocked && onSelect) {
          onSelect(topic.id)
        }
      }}
      className={`rounded-2xl p-4 sm:p-4.5 border transition-colors duration-200 relative flex flex-col justify-between ${
        isLocked
          ? "bg-slate-50/70 dark:bg-[#1A1A1A]/70 border-slate-200 dark:border-[#3F3F3F] opacity-75 cursor-not-allowed"
          : isSelected
          ? "bg-white dark:bg-[#1A1A1A] border-[#990011] dark:border-red-400 shadow-sm cursor-pointer"
          : "bg-white dark:bg-[#1A1A1A] border-slate-200 dark:border-[#3F3F3F] hover:border-slate-300 dark:hover:border-neutral-500 shadow-2xs hover:shadow-xs cursor-pointer"
      }`}
    >
      <div>
        {/* Top row: Emoji, Title, Sub, Radio/Lock */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100 dark:bg-[#272727] flex items-center justify-center text-2xl shrink-0 shadow-inner">
              {topic.emoji}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                {topic.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                {topic.sub}
              </p>
            </div>
          </div>

          {/* Radio or Lock indicator */}
          <div className="shrink-0 mt-0.5">
            {isLocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-[#272727] text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-[#3F3F3F]">
                <Lock className="w-3 h-3 text-slate-500 dark:text-neutral-400" />
                <span>{topic.lockBadge}</span>
              </span>
            ) : (
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                  isSelected
                    ? "border-[#990011] dark:border-red-400"
                    : "border-slate-300 dark:border-[#3F3F3F]"
                }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#990011] dark:bg-red-500" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tags row */}
        {topic.tags && topic.tags.length > 0 && !isLocked && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {topic.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 dark:bg-[#242424] text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-[#3F3F3F]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Vocabulary preview section */}
      {topic.vocab && !isLocked && (
        <div className="mt-3 bg-slate-50/80 dark:bg-[#242424] border border-slate-100 dark:border-[#3F3F3F] rounded-xl px-3 py-2 text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
          <span className="font-medium text-slate-800 dark:text-white">Từ vựng: </span>
          <span>{topic.vocab}</span>
        </div>
      )}
    </div>
  )
}

export default TopicCard
