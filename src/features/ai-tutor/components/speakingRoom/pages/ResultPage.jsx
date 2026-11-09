import React from "react"

/**
 * ResultPage component - displays the speaking session assessment report,
 * overall score, detailed metric progress bars, strengths, pronunciation tips,
 * extracted flashcards, and navigation actions.
 */
const ResultPage = ({
  topicTitle = "Mua hoa quả ở chợ",
  duration = "04:50",
  date = "18/09/2026",
  overallScore = 82,
  cefrLevel = "HSK 3 (Tương đương chuẩn B1 CEFR Quốc tế)",
  metrics = [
    { label: "Độ trôi chảy (Fluency)", score: 85, color: "bg-emerald-500" },
    { label: "Phát âm & Thanh điệu", score: 78, color: "bg-amber-500" },
    { label: "Ngữ pháp & Vốn từ", score: 84, color: "bg-blue-500" },
  ],
  strengths = [
    "Phản xạ tốc độ cao: Bạn trả lời các câu hỏi về giá cả rất tự tin, thời gian ngập ngừng < 1.2s.",
    "Sử dụng ngữ pháp chính xác: Dùng chuẩn lượng từ '两斤苹果' ngay sau khi được AI nhắc nhở.",
    "Ngữ điệu tự nhiên: Giữ nhịp giao tiếp thân thiện, rõ ràng như đang trò chuyện với người bản xứ!",
  ],
  improvements = [
    "Thanh 3: Từ '苹果' (píngguǒ) đọc thành thanh 2 (píngguó). Âm cần hạ sâu xuống đáy trước khi vút lên.",
    "Âm bật hơi: Từ '便宜' (piányi) âm 'p' chưa đủ luồng hơi mạnh từ vòm miệng.",
  ],
  savedVocabs = [
    { hanzi: "苹果", meaning: "Táo" },
    { hanzi: "多少钱", meaning: "Bao nhiêu" },
    { hanzi: "便宜", meaning: "Rẻ" },
    { hanzi: "新鲜", meaning: "Tươi mới" },
    { hanzi: "两斤", meaning: "Hai cân" },
  ],
  onBackToCatalog,
  onPracticeFlashcards,
  onGoHome,
  onViewPronunciationDetails,
  // TASK-AI-15: ba prop dưới do SpeakingReportContainer truyền khi có dữ liệu thật.
  // levelPrefix = "" vì cấp HSK ở đây là cấp của buổi nói, không phải một lần xếp cấp.
  levelPrefix = "Đánh giá trình độ: ",
  notice,
  showPronunciationLink = true,
  onRetry,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
      {/* Header with Title, metadata and back link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#2E2E2E] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            BÁO CÁO TỔNG KẾT BUỔI LUYỆN NÓI
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 text-xs sm:text-sm mt-1">
            Chủ đề: {topicTitle} · Thời lượng: {duration} · {date}
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToCatalog}
          className="inline-flex items-center text-xs sm:text-sm font-semibold text-slate-600 dark:text-neutral-300 hover:text-[#990011] dark:hover:text-red-400 transition-colors cursor-pointer self-start sm:self-auto"
        >
          ← Về danh mục
        </button>
      </div>

      {notice ? (
        <div className="w-full bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl px-4 py-3 text-xs sm:text-sm text-blue-900 dark:text-blue-200 flex flex-wrap items-center justify-between gap-2">
          <span>{notice}</span>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-bold text-[#990011] dark:text-red-400 underline hover:text-[#85000f] dark:hover:text-red-300 cursor-pointer"
            >
              Thử lại
            </button>
          ) : null}
        </div>
      ) : null}

      {/* 1. Score & Detailed Breakdown Card */}
      <div className="w-full bg-rose-50/20 dark:bg-[#1A1A1A] border border-rose-100/60 dark:border-[#3F3F3F] rounded-3xl p-5 sm:p-7 flex flex-col md:flex-row items-center gap-6 sm:gap-8 shadow-2xs">
        {/* Score Circle */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-rose-200 dark:border-rose-900/50 bg-white dark:bg-[#242424] flex flex-col items-center justify-center shadow-xs shrink-0">
          <span className="text-4xl sm:text-5xl font-extrabold text-[#990011] dark:text-red-400 leading-none">
            {overallScore ?? "—"}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 dark:text-neutral-400 uppercase mt-1.5">
            ĐIỂM TỔNG QUAN
          </span>
        </div>

        {/* Detailed Metrics */}
        <div className="flex-1 w-full space-y-3.5">
          <h2 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">
            {levelPrefix}{cefrLevel}
          </h2>

          <div className="space-y-3">
            {metrics.map((metric, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm">
                <span className="w-36 sm:w-44 font-medium text-slate-700 dark:text-neutral-300 shrink-0">
                  {metric.label}
                </span>
                <div className="h-2.5 bg-slate-200/80 dark:bg-neutral-700 rounded-full flex-1 overflow-hidden">
                  <div
                    className={`h-full ${metric.color} rounded-full transition-all duration-500`}
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
                <span className="w-14 sm:w-16 font-bold text-slate-700 dark:text-neutral-200 text-right shrink-0">
                  {metric.score} / 100
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Strengths Card */}
      <div className="w-full bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-2xs">
        <h3 className="text-xs sm:text-sm font-extrabold text-emerald-800 dark:text-emerald-300 tracking-wide flex items-center gap-1.5">
          <span>🌟</span> ĐIỂM MẠNH ĐÁNG KHEN:
        </h3>
        <ul className="space-y-2 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
          {strengths.map((str, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">•</span>
              <span>{str}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Areas for Improvement Card */}
      {improvements.length > 0 || showPronunciationLink ? (
      <div className="w-full bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-2xs">
        <h3 className="text-xs sm:text-sm font-extrabold text-amber-900 dark:text-amber-300 tracking-wide flex items-center gap-1.5">
          <span>🔍</span> ĐIỂM CẦN LƯU Ý & KHẮC PHỤC NGỮ ÂM:
        </h3>
        <div className="space-y-2 text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
          {improvements.map((imp, idx) => (
            <p key={idx}>
              <span className="font-semibold">{idx + 1}.</span> {imp}
            </p>
          ))}
        </div>
        {showPronunciationLink ? (
        <div className="pt-1">
          <button
            type="button"
            onClick={onViewPronunciationDetails}
            className="text-xs sm:text-sm font-bold text-[#990011] dark:text-red-400 hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            👉 Xem phân tích âm tiết chi tiết & Video khẩu hình 1-1 →
          </button>
        </div>
        ) : null}
      </div>
      ) : null}

      {/* 4. Saved Flashcards Card */}
      <div className="w-full bg-slate-50 dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-[#3F3F3F] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white tracking-wide flex items-center gap-1.5">
          <span>🎴</span> ĐÃ LƯU {savedVocabs.length} TỪ VỰNG VÀO FLASHCARD — SẼ NHẮC ÔN LẠI:
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {savedVocabs.map((vocab, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#272727] border border-slate-200/80 dark:border-[#3F3F3F] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-neutral-100 shadow-2xs"
            >
              {vocab.hanzi}
              {vocab.pinyin ? <span className="text-slate-400 dark:text-neutral-400 font-normal"> {vocab.pinyin}</span> : null}
              {vocab.meaning ? <span className="text-slate-500 dark:text-neutral-400 font-normal"> ({vocab.meaning})</span> : null}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Footer Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onPracticeFlashcards}
          className="px-6 py-3 rounded-xl bg-[#990011] hover:bg-[#85000f] text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          Ôn tập {savedVocabs.length} từ vựng này ngay
        </button>
        <button
          type="button"
          onClick={onGoHome}
          className="px-6 py-3 rounded-xl bg-white dark:bg-[#242424] hover:bg-slate-50 dark:hover:bg-[#2C2C2C] border border-slate-300 dark:border-[#3F3F3F] text-slate-700 dark:text-neutral-200 font-semibold text-xs sm:text-sm shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
        >
          Quay về Trang chủ
        </button>
      </div>
    </div>
    </div>
  )
}

export default ResultPage
