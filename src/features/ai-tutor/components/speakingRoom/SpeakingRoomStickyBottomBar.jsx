import React from "react"

const SpeakingRoomStickyBottomBar = ({
  selectedTopic,
  onStartSpeaking,
  isQuotaExceeded = false,
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
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isQuotaExceeded ? "bg-amber-500" : "bg-[#990011]"
              }`}
            />
            <span className={isQuotaExceeded ? "text-amber-800" : "text-[#990011]"}>
              Đã chọn: {selectedTopic.title} {chineseSubtitle ? `(${chineseSubtitle})` : ""} · 4-6 câu
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isQuotaExceeded
              ? "Bạn đã dùng hết hạn mức hôm nay (2/2 buổi). Nâng cấp để tiếp tục."
              : "Trừ 1 buổi vào hạn mức sau khi hoàn thành phiên luyện nói"}
          </p>
        </div>

        {/* Right CTA Button */}
        <button
          type="button"
          onClick={onStartSpeaking}
          disabled={isQuotaExceeded}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base tracking-wide uppercase transition-all whitespace-nowrap ${
            isQuotaExceeded
              ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none active:scale-100"
              : "bg-[#990011] hover:bg-[#85000f] text-white shadow-lg shadow-rose-950/20 active:scale-95 cursor-pointer"
          }`}
          title={
            isQuotaExceeded
              ? "Bạn đã dùng hết hạn mức hôm nay. Vui lòng nâng cấp gói."
              : "Bắt đầu luyện nói ngay"
          }
        >
          {isQuotaExceeded ? "Hết hạn mức hôm nay" : "Bắt đầu luyện nói ngay"}
        </button>
      </div>
    </div>
  )
}

export default SpeakingRoomStickyBottomBar
