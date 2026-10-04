import React from "react"
import { ArrowRight } from "lucide-react"

/**
 * FlashcardHeroBanner component (fc01)
 *
 * @param {Object} props
 * @param {number} props.dueCount - Số thẻ đến hạn hôm nay
 * @param {number} props.totalCards - Tổng số thẻ trong sổ
 * @param {number} [props.overdueCount=3] - Số thẻ quá hạn (nếu có)
 * @param {Function} [props.onStartDue] - Callback khi bấm "Bắt đầu ôn"
 * @param {Function} [props.onStartFree] - Callback khi bấm "Ôn tập (tự do)"
 * @param {Function} [props.onStartSpeaking] - Callback khi bấm "Luyện nói với AI"
 */
const FlashcardHeroBanner = ({
  dueCount = 0,
  totalCards = 0,
  overdueCount = 3,
  onStartDue,
  onStartSpeaking,
}) => {
  const isEmpty = totalCards === 0
  const isDone = !isEmpty && dueCount === 0
  const hasDue = !isEmpty && dueCount > 0

  return (
    <div
      data-testid="flashcard-hero-banner"
      className="relative overflow-hidden rounded-2xl bg-[#680411] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#7a0c1e] via-[#680411] to-[#45020a] p-6 sm:p-8 text-white shadow-sm"
    >
      {/* 2 hình tròn trang trí màu sáng (lighter overlay) */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Hình tròn 1 (80%): Góc trên bên phải — thấy 1/4 theo chiều dọc (-top 75%), 5/6 theo chiều ngang (-right 16.7%) */}
        <div className="absolute -top-[168px] -right-[37px] h-[224px] w-[224px] rounded-full bg-white/[0.05]" />

        {/* Hình tròn 2 (60%): Ở dưới lệch sang trái — thấy 4/5 theo chiều dọc (-bottom 20%) */}
        <div className="absolute -bottom-[26px] right-24 sm:right-32 h-[132px] w-[132px] rounded-full bg-white/[0.05]" />
      </div>

      <div className="relative z-10 flex flex-col items-start gap-4 sm:gap-6">
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          {isEmpty && "Chưa có từ nào trong sổ"}
          {isDone && "Đã ôn hết thẻ hôm nay"}
          {hasDue && `${dueCount} thẻ cần ôn hôm nay`}
        </h2>

        {/* Badge & Subtitle */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
          <span className="rounded-full bg-white px-3.5 py-1 font-bold text-[#680411] shadow-xs">
            {isEmpty || isDone ? "0 quá hạn" : `${overdueCount} quá hạn`}
          </span>
          <span className="text-white/90 font-medium">
            {isEmpty && "— luyện nói với AI để tạo thẻ đầu tiên"}
            {isDone && "— quay lại vào ngày mai"}
            {hasDue && "— ưu tiên ôn thẻ quá hạn trước"}
          </span>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {hasDue && (
            <>
              <button
                type="button"
                onClick={onStartDue}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-6 py-2.5 text-sm sm:text-base font-bold text-[#680411] shadow-xs transition-all hover:bg-white/95 active:scale-98"
              >
                Bắt đầu ôn
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </button>

            </>
          )}


          {isEmpty && (
            <button
              type="button"
              onClick={onStartSpeaking}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-6 py-2.5 text-sm sm:text-base font-bold text-[#680411] shadow-xs transition-all hover:bg-white/95 active:scale-98"
            >
              Luyện nói với AI
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FlashcardHeroBanner
