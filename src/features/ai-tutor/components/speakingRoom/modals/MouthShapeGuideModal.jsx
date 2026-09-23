import React, { useState } from "react"
import { Play, Lightbulb, X } from "lucide-react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

const DEFAULT_GUIDE_DATA = {
  toneTitle: "HƯỚNG DẪN KHẨU HÌNH: THANH 3 (三声)",
  videoTitle: "Bí quyết nói chuẩn Thanh 3 tiếng Trung",
  videoDuration: "0:45",
  steps: [
    "1. Khởi đầu: Đặt âm ở cao độ trung bình (mức 2).",
    "2. Hạ sâu: Nén luồng hơi, ép giọng xuống đáy cổ họng (mức 1).",
    "3. Vút nhẹ: Nhả hơi nhẹ nhàng vút lên cao (mức 4).",
  ],
  aiTip: "Hơi gật nhẹ đầu xuống khi hạ giọng ở bước 2 sẽ giúp âm chuẩn hơn nhiều!",
}

const MouthShapeGuideModal = ({
  isOpen = false,
  onClose,
  data = DEFAULT_GUIDE_DATA,
  onPracticeNow,
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const guide = { ...DEFAULT_GUIDE_DATA, ...data }

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 uppercase">
                {guide.toneTitle}
              </h2>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2 Columns Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left Column: Video Shorts Player Frame */}
              <div className="md:col-span-5 w-full h-72 sm:h-80 rounded-2xl bg-gradient-to-b from-slate-900 via-[#101426] to-slate-950 relative p-4 sm:p-4.5 flex flex-col justify-between text-white shadow-lg overflow-hidden shrink-0">
                {/* Top badge or subtle indicator */}
                <div className="flex justify-end">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/40 backdrop-blur-sm border border-white/10 text-slate-200 uppercase">
                    Shorts
                  </span>
                </div>

                {/* Center Play Button */}
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-14 h-14 rounded-full bg-[#990011] hover:bg-[#85000f] text-white flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all mx-auto"
                  aria-label="Play video"
                >
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </button>

                {/* Bottom Video Meta */}
                <div className="space-y-0.5">
                  <h3 className="font-bold text-xs sm:text-sm leading-snug text-white">
                    {guide.videoTitle}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Thời lượng: {guide.videoDuration} · CatSpeak
                  </p>
                </div>
              </div>

              {/* Right Column: 3 Steps & AI Tip & CTA */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-3.5">
                {/* 3 Steps Box */}
                <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-left">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wide">
                    3 bước khẩu hình chuẩn:
                  </h3>

                  <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {guide.steps.map((step, idx) => (
                      <p key={idx}>{step}</p>
                    ))}
                  </div>
                </div>

                {/* AI Tip Box */}
                <div className="p-4 sm:p-4.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Mẹo từ AI Tutor CatSpeak:</span>
                  </div>
                  <p className="text-xs text-amber-900/90 italic leading-relaxed pl-5">
                    &quot;{guide.aiTip}&quot;
                  </p>
                </div>

                {/* CTA Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    onPracticeNow?.()
                    onClose?.()
                  }}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#990011] hover:bg-[#85000f] text-white font-bold text-xs sm:text-sm tracking-wide transition-colors cursor-pointer text-center shadow-md shadow-rose-950/20"
                >
                  Đã hiểu khẩu hình, Luyện tập ngay
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default MouthShapeGuideModal
