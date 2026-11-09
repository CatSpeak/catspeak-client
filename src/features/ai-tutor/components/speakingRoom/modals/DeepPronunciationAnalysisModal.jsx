import React, { useState } from "react"
import { Mic, Play, Bot, X } from "lucide-react"
import { createPortal } from "react-dom"

const DEFAULT_ANALYSIS_DATA = {
  hanzi: "苹果",
  pinyin: "píngguǒ",
  meaning: "Quả táo",
  accuracyScore: 68,
  accuracyStatus: "Cần sửa",
  syllables: [
    {
      index: 1,
      syllable: "píng",
      toneName: "Thanh 2: Sắc",
      status: "CHUẨN",
      score: 92,
      isCorrect: true,
    },
    {
      index: 2,
      syllable: "guǒ",
      toneName: "Thanh 3: Hỏi",
      status: "SAI",
      score: 45,
      isCorrect: false,
      note: "Thiếu độ võng sâu",
    },
  ],
  pitchComparison: {
    userPitch: "——¯¯¯——",
    userNote: "Cao độ bị ngang, không võng",
    aiPitch: "\\__/\\¯¯¯",
    aiNote: "Hạ sâu mức 1 rồi vút lên mức 4",
  },
  lastRetestScore: 88,
  lastRetestResult: "Xuất sắc!",
}

/**
 * ss12. Khi có dữ liệu thật (TASK-AI-15) container truyền thêm:
 *   words, selectedIndex, onSelectWord   danh sách từ cần luyện, chọn từ đang xem
 *   isRecording                           trạng thái thu âm do container giữ
 *   onPlayUser, onPlayModel               nghe lại giọng mình / nghe mẫu chậm
 *   loading, errorText                    lần mở đầu phải chờ chấm Azure vài giây
 * Không truyền thì modal chạy như bản giao diện gốc với dữ liệu mẫu.
 */
const DeepPronunciationAnalysisModal = ({
  isOpen = false,
  onClose,
  data = DEFAULT_ANALYSIS_DATA,
  onRecordRetry,
  onWatchShorts,
  words,
  selectedIndex = 0,
  onSelectWord,
  isRecording: isRecordingProp,
  onPlayUser,
  onPlayModel,
  loading = false,
  errorText,
}) => {
  const [isRecordingLocal, setIsRecordingLocal] = useState(false)
  const isRecording = isRecordingProp ?? isRecordingLocal
  const analysis = { ...DEFAULT_ANALYSIS_DATA, ...data }

  if (!isOpen || typeof document === "undefined") return null

  const handleRecordClick = () => {
    if (isRecordingProp === undefined) setIsRecordingLocal((prev) => !prev)
    onRecordRetry?.()
  }

  return createPortal(
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Dialog Container */}
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#1A1A1A] border border-transparent dark:border-[#3F3F3F] rounded-3xl p-6 sm:p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
      >

            {/* Header */}
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                Phân tích ngữ âm chuyên sâu
              </h2>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#272727] hover:bg-slate-200 dark:hover:bg-[#333] flex items-center justify-center text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loading && (
              <div className="mt-6 py-10 text-center text-sm text-slate-500 dark:text-neutral-400 animate-pulse">
                Đang phân tích từng âm tiết trong buổi nói của bạn...
              </div>
            )}

            {!loading && errorText && (
              <div className="mt-6 py-8 px-4 rounded-2xl bg-slate-50 dark:bg-[#242424] border border-slate-100 dark:border-[#3F3F3F] text-center text-sm text-slate-600 dark:text-neutral-300">
                {errorText}
              </div>
            )}

            {!loading && !errorText && (
            <>
            {Array.isArray(words) && words.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {words.map((w, idx) => (
                  <button
                    key={`${w.seq}-${w.word}-${idx}`}
                    type="button"
                    onClick={() => onSelectWord?.(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      idx === selectedIndex
                        ? "bg-[#990011] border-[#990011] text-white"
                        : "bg-white dark:bg-[#242424] border-slate-200 dark:border-[#3F3F3F] text-slate-700 dark:text-neutral-200 hover:border-rose-200 dark:hover:border-rose-900/50"
                    }`}
                  >
                    {w.word}
                  </button>
                ))}
              </div>
            )}

            {/* Word Banner */}
            <div className="mt-4 p-4 sm:p-4.5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#990011] dark:text-red-400 tracking-wide">
                  {analysis.hanzi}
                </span>
                <span className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300">
                  ({analysis.pinyin} - {analysis.meaning})
                </span>
              </div>

              <span className="px-3 py-1.5 rounded-lg bg-[#990011] text-white text-xs font-semibold shadow-2xs shrink-0">
                Độ chính xác: {analysis.accuracyScore}% ({analysis.accuracyStatus})
              </span>
            </div>

            {/* Syllables & Tones Breakdown */}
            <div className="mt-3.5 p-4 sm:p-4.5 rounded-2xl bg-slate-50 dark:bg-[#242424] border border-slate-100 dark:border-[#3F3F3F] space-y-2">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                Bóc tách âm tiết & thanh điệu:
              </h3>

              <div className="space-y-1.5 text-xs sm:text-sm">
                {analysis.syllables.map((s) => (
                  <div
                    key={s.index}
                    className={`flex items-start gap-1.5 ${
                      s.isCorrect ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-rose-700 dark:text-rose-400 font-medium"
                    }`}
                  >
                    <span>•</span>
                    <span>
                      Âm {s.index}: &quot;{s.syllable}&quot; ({s.toneName}) ➔ Bạn phát âm:{" "}
                      <strong>
                        {s.status} ({s.score}%)
                      </strong>
                      {s.note ? ` - ${s.note}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pitch Curve Comparison */}
            <div className="mt-4 space-y-2 text-left">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                So sánh đường cong cao độ:
              </h3>

              <div className="space-y-2 text-xs sm:text-sm">
                {/* User Voice Curve */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onPlayUser}
                    disabled={!onPlayUser}
                    title="Nghe lại giọng bạn"
                    className="w-24 shrink-0 flex items-center gap-1.5 text-slate-600 dark:text-neutral-300 font-medium enabled:cursor-pointer enabled:hover:text-[#990011] dark:enabled:hover:text-red-400"
                  >
                    <Play className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                    <span>Giọng bạn:</span>
                  </button>
                  <div className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-[#242424] border border-slate-100 dark:border-[#3F3F3F] text-slate-600 dark:text-neutral-300 font-mono">
                    <span className="font-bold tracking-widest">{analysis.pitchComparison.userPitch}</span>{" "}
                    <span className="text-slate-500 dark:text-neutral-400 font-sans text-xs">
                      ({analysis.pitchComparison.userNote})
                    </span>
                  </div>
                </div>

                {/* AI Model Curve */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onPlayModel}
                    disabled={!onPlayModel}
                    title="Nghe phát âm mẫu tốc độ chậm"
                    className="w-24 shrink-0 flex items-center gap-1.5 text-[#990011] dark:text-red-400 font-semibold enabled:cursor-pointer enabled:hover:underline"
                  >
                    <Bot className="w-3.5 h-3.5 text-[#990011] dark:text-red-400" />
                    <span>AI mẫu:</span>
                  </button>
                  <div className="flex-1 p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-[#990011] dark:text-red-400 font-mono">
                    <span className="font-bold tracking-widest">{analysis.pitchComparison.aiPitch}</span>{" "}
                    <span className="font-sans text-xs font-semibold">
                      ({analysis.pitchComparison.aiNote})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Retake / Record Box */}
            <div className="mt-4 p-4 sm:p-4.5 rounded-2xl bg-rose-50/30 dark:bg-rose-950/20 border border-rose-100/80 dark:border-rose-900/40 flex flex-col items-center justify-center text-center space-y-2.5">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                Thu âm luyện lại âm tiết này ngay:
              </h4>

              <button
                type="button"
                onClick={handleRecordClick}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-95 cursor-pointer ${
                  isRecording ? "bg-red-600 ring-4 ring-red-200 animate-pulse" : "bg-[#990011] hover:bg-[#85000f]"
                }`}
                title="Nhấn để thu âm"
              >
                <Mic className="w-5 h-5" />
              </button>

              {isRecording && (
                <p className="text-xs text-slate-500 dark:text-neutral-400">Đang thu âm... bấm lần nữa để dừng</p>
              )}
              {analysis.lastRetestScore != null ? (
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Kết quả chấm lại vừa thực hiện: {analysis.lastRetestScore}%
                  {typeof analysis.lastRetestDelta === "number" && analysis.lastRetestDelta !== 0
                    ? ` (${analysis.lastRetestDelta > 0 ? "+" : ""}${analysis.lastRetestDelta})`
                    : ""}{" "}
                  - {analysis.lastRetestResult}
                </p>
              ) : analysis.lastRetestResult ? (
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{analysis.lastRetestResult}</p>
              ) : null}
            </div>
            </>
            )}

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-slate-50 dark:bg-[#242424] hover:bg-slate-100 dark:hover:bg-[#2c2c2c] text-slate-700 dark:text-neutral-200 font-medium text-xs sm:text-sm transition-colors cursor-pointer text-center"
              >
                Đóng cửa sổ
              </button>
                Đóng cửa sổ
              </button>

              <button
                type="button"
                onClick={() => {
                  onWatchShorts?.()
                  onClose?.()
                }}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#990011] hover:bg-[#85000f] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center shadow-md shadow-rose-950/20"
              >
                Xem video Shorts khẩu hình
              </button>
            </div>
          </div>
        </div>,
    document.body
  )
}


export default DeepPronunciationAnalysisModal
