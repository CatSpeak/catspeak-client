import React from "react"
import { X } from "lucide-react"

const CompletedCardPopover = ({
  dayIndex = 1,
  topicTitle = "Chào hỏi",
  score = 82,
  onClose,
}) => {
  return (
    <div
      role="tooltip"
      onClick={(e) => e.stopPropagation()}
      className="absolute -top-24 left-1/2 -translate-x-1/2 z-30 w-52 bg-white rounded-xl shadow-xl border border-gray-100 p-3 text-left transition-all animate-fadeIn"
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-bold text-gray-900 truncate">
          Ngày {dayIndex} · {topicTitle}
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="text-xs font-extrabold text-[#12B76A] mt-1">
        Điểm: {score}/100
      </div>

      <div className="text-[11px] text-gray-400 mt-0.5">
        Đã hoàn thành — không học lại
      </div>

      {/* Down arrow triangle */}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45" />
    </div>
  )
}

export default CompletedCardPopover
