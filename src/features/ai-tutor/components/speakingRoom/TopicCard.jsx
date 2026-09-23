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
          ? "bg-slate-50/70 border-slate-200 opacity-75 cursor-not-allowed"
          : isSelected
          ? "bg-white border-[#990011] shadow-sm cursor-pointer"
          : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs cursor-pointer"
      }`}
    >
      <div>
        {/* Top row: Emoji, Title, Sub, Radio/Lock */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              {topic.emoji}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {topic.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {topic.sub}
              </p>
            </div>
          </div>

          {/* Radio or Lock indicator */}
          <div className="shrink-0 mt-0.5">
            {isLocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>{topic.lockBadge}</span>
              </span>
            ) : (
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                  isSelected
                    ? "border-[#990011]"
                    : "border-slate-300"
                }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#990011]" />
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
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Vocabulary preview section */}
      {topic.vocab && !isLocked && (
        <div className="mt-3 bg-slate-50/80 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-600 leading-relaxed">
          <span className="font-medium text-slate-800">Từ vựng: </span>
          <span>{topic.vocab}</span>
        </div>
      )}
    </div>
  )
}

export default TopicCard
