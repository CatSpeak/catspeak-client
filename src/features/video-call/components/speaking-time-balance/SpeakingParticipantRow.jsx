import React from "react"

/**
 * SpeakingParticipantRow Component
 * Renders an individual student's speaking metrics, alert badge ([?], [!!]), word count, and bar.
 */
const SpeakingParticipantRow = ({
  name,
  totalWords = 0,
  sharePercent = 0,
  status = "normal",
  labels = {},
}) => {
  const isAttention = status === "attention"
  const isTooLow = status === "tooLow"

  let containerClass = "px-4 py-3 border-b border-gray-100 transition-colors"
  let badge = null
  let barFillColor = "bg-emerald-500"
  let percentColor = "text-emerald-600"

  if (isAttention) {
    containerClass += " bg-[#FFFDF5] border-l-4 border-l-amber-500"
    barFillColor = "bg-amber-500"
    percentColor = "text-amber-600"
    badge = (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-amber-500 text-amber-600 font-bold text-xs shrink-0">
        ?
      </span>
    )
  } else if (isTooLow) {
    containerClass += " bg-[#FFF8F8] border-l-4 border-l-cath-red-700"
    barFillColor = "bg-cath-red-700"
    percentColor = "text-cath-red-700"
    badge = (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-cath-red-700 text-white font-bold text-xs shrink-0">
        !!
      </span>
    )
  }

  return (
    <div className={containerClass}>
      {/* Top line: Name + Word count */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {badge}
          <span className="font-medium text-sm text-gray-900 truncate">
            {name}
          </span>
        </div>
        <span className="text-xs text-gray-500 font-medium shrink-0">
          {totalWords} {labels.words || "từ"}
        </span>
      </div>

      {/* Bottom line: Percentage + Progress Bar */}
      <div className="flex items-center gap-3">
        <span className={`text-xs font-bold w-7 shrink-0 ${percentColor}`}>
          {sharePercent}%
        </span>
        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`${barFillColor} h-full rounded-full transition-all duration-500`}
            style={{
              width: `${Math.min(100, Math.max(0, sharePercent))}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default SpeakingParticipantRow
