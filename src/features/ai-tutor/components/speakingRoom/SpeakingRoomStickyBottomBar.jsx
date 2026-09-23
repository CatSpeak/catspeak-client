import React from "react"

const SpeakingRoomStickyBottomBar = ({
  selectedTopic,
  onStartSpeaking,
}) => {
  if (!selectedTopic) return null

  // Extract Chinese title
  const chineseSubtitle = selectedTopic.sub
    ? selectedTopic.sub.split("·")[0]?.trim()
    : ""

  return (
    <div className="sticky bottom-4 z-20 mt-8">
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 sm:p-4.5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left summary */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-0.5">
          <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900">
            <span className="w-2.5 h-2.5 rounded-full bg-[#990011]" />
            <span className="text-[#990011]">
              Đã chọn: {selectedTopic.title} {chineseSubtitle ? `(${chineseSubtitle})` : ""} · 4-6 câu
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Trừ 1 buổi vào hạn mức sau khi hoàn thành phiên luyện nói
          </p>
        </div>

        {/* Right CTA Button */}
        <button
          type="button"
          onClick={onStartSpeaking}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#990011] hover:bg-[#85000f] text-white font-bold text-sm sm:text-base tracking-wide uppercase shadow-lg shadow-rose-950/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
        >
          Bắt đầu luyện nói ngay
        </button>
      </div>
    </div>
  )
}

export default SpeakingRoomStickyBottomBar
