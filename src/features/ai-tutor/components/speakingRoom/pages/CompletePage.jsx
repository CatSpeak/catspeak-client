import React from "react"

/**
 * CompletePage component - displays the speaking session completion status,
 * AI processing progress, analysis checklist, and CTA to view report.
 */
const CompletePage = ({
  progressPercent = 80,
  estimatedTime = "khoảng 2 giây",
  onViewReport,
  // TASK-AI-15: số mục đã xong trong checklist, container tính theo tiến trình chờ.
  doneCount = 3,
}) => {
  const baseChecklist = [
    {
      id: "fluency",
      icon: "✓",
      title: "Đo độ trôi chảy (Fluency) & phản xạ âm thanh",
      statusText: "Hoàn tất",
      isDone: true,
    },
    {
      id: "tone",
      icon: "✓",
      title: "Phân tích thanh điệu (Tone 1–4) và âm vị cần lưu ý",
      statusText: "Hoàn tất",
      isDone: true,
    },
    {
      id: "grammar",
      icon: "✓",
      title: "Kiểm tra cấu trúc ngữ pháp và từ vựng mở rộng",
      statusText: "Hoàn tất",
      isDone: true,
    },
    {
      id: "vocab",
      icon: "⏳",
      title: "Tự động trích xuất 5 từ vựng mới vào Flashcard",
      statusText: "Đang trích xuất...",
      isDone: false,
    },
  ]
  const checklist = baseChecklist.map((item, idx) =>
    idx < doneCount
      ? { ...item, icon: "✓", statusText: "Hoàn tất", isDone: true }
      : { ...item, icon: "⏳", statusText: item.isDone ? "Đang xử lý..." : item.statusText, isDone: false },
  )

  return (
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8 flex flex-col items-center justify-center min-h-[70vh]">
      {/* Top Completion Icon */}
      <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-3xl shadow-xs">
        🎉
      </div>

      {/* Main Title & Subtitle */}
      <div className="text-center space-y-2 max-w-xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          BUỔI LUYỆN NÓI ĐÃ HOÀN TẤT!
        </h1>
        <p className="text-slate-500 text-sm sm:text-base font-normal">
          Gia sư AI đang tính toán điểm số và trích xuất từ vựng vào Flashcard...
        </p>
      </div>

      {/* Progress Bar & Status Text */}
      <div className="w-full max-w-xl space-y-3">
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-[#990011] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-center text-sm font-bold text-[#990011]">
          Đang xử lý {progressPercent}% ({estimatedTime})
        </div>
      </div>

      {/* Analysis Checklist */}
      <div className="w-full max-w-xl space-y-3">
        {checklist.map((item) => {
          if (item.isDone) {
            return (
              <div
                key={item.id}
                className="w-full bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-4.5 flex items-center justify-between text-emerald-800 transition-all"
              >
                <div className="flex items-center gap-2.5 font-semibold text-xs sm:text-sm">
                  <span className="text-emerald-700 font-bold">{item.icon}</span>
                  <span>{item.title}</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-emerald-700 shrink-0 ml-3">
                  {item.statusText}
                </span>
              </div>
            )
          }

          return (
            <div
              key={item.id}
              className="w-full bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 sm:p-4.5 flex items-center justify-between text-blue-900 transition-all"
            >
              <div className="flex items-center gap-2.5 font-semibold text-xs sm:text-sm">
                <span className="text-blue-700">{item.icon}</span>
                <span>{item.title}</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-blue-600 shrink-0 ml-3 animate-pulse">
                {item.statusText}
              </span>
            </div>
          )
        })}
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onViewReport}
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#990011] hover:bg-[#85000f] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
        >
          Xem Báo cáo Tổng kết ngay
        </button>
      </div>
    </div>
  )
}

export default CompletePage
