import React from "react"

/**
 * SpeakingTimeBalanceLegend Component
 * Renders the bottom threshold legend for Normal (>=60%), Attention (30-60%), and Too Low (<30%).
 */
const SpeakingTimeBalanceLegend = ({ labels = {} }) => {
  return (
    <div className="border-t border-[#EFEFEF] bg-white px-4 py-2.5 text-xs flex flex-col gap-1 shrink-0">
      <div className="flex items-center gap-1.5 text-gray-600">
        <span className="inline-block w-2.5 h-2.5 bg-gray-800 rounded-sm shrink-0" />
        <span>≥60% · {labels.normal || "Bình thường"}</span>
      </div>
      <div className="flex items-center gap-1.5 text-amber-600 font-medium">
        <span className="font-mono font-bold">[?]</span>
        <span>30–60% · {labels.attention || "Cần chú ý"}</span>
      </div>
      <div className="flex items-center gap-1.5 text-red-600 font-medium">
        <span className="font-mono font-bold">[!!]</span>
        <span>&lt;30% · {labels.tooLow || "Quá thấp"}</span>
      </div>
    </div>
  )
}

export default SpeakingTimeBalanceLegend
