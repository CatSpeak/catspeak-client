import React, { useState, useEffect } from "react"
import Confetti from "react-confetti"
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import Modal from "@/shared/components/ui/Modal"

const CycleSummaryModal = ({
  isOpen,
  onClose,
  summary,
  onStartNewCycle,
}) => {
  const [windowDimension, setWindowDimension] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 800,
    height: typeof window !== "undefined" ? window.innerHeight : 600,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!isOpen || !summary) return null

  const completed = summary.completedSessionsCount ?? 0
  const total = summary.totalSessions ?? 5
  const avgScore =
    summary.averageScore !== null && summary.averageScore !== undefined
      ? Math.round(summary.averageScore)
      : null

  const showConfetti = (avgScore !== null && avgScore >= 75) || completed >= 4

  const mastered = summary.masteredTopics || []
  const needsPractice = summary.needsPracticeTopics || []
  const highPriority = summary.highPriorityTopics || []

  const handleConfirm = () => {
    onClose?.()
    onStartNewCycle?.()
  }

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[1400]">
          <Confetti
            width={windowDimension.width}
            height={windowDimension.height}
            numberOfPieces={180}
            recycle={false}
            gravity={0.25}
          />
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        fullScreenOnMobile={false}
        className="md:max-w-lg bg-white dark:bg-gray-850 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 sm:p-7 flex flex-col gap-5 text-center">
          {/* Header Trophy Banner */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-cath-red-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 mb-3">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Tổng kết chu kỳ học!
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Bạn đã hoàn thành chu kỳ luyện nói 5 ngày ({summary.hskLevel || "HSK"})
            </p>
          </div>

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60">
            <div className="flex flex-col items-center justify-center border-r border-gray-200 dark:border-gray-700/60 pr-2">
              <span className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                Số buổi hoàn thành
              </span>
              <span className="text-2xl font-extrabold text-cath-red-700 dark:text-cath-red-400 mt-0.5">
                {completed}/{total}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center pl-2">
              <span className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                Điểm trung bình
              </span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                {avgScore !== null ? `⭐ ${avgScore}%` : "--"}
              </span>
            </div>
          </div>

          {/* Topics Breakdown */}
          <div className="flex flex-col gap-3 text-left">
            {/* Mastered Topics */}
            {mastered.length > 0 && (
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chủ đề đã nắm vững (≥ 75 điểm):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {mastered.map((topic, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800 shadow-2xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Needs Practice / Weak Topics */}
            {(needsPractice.length > 0 || highPriority.length > 0) && (
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chủ đề sẽ được củng cố trong chu kỳ tới:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[...highPriority, ...needsPractice].map((topic, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800 shadow-2xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Adaptive Notice */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-gradient-to-r from-cath-red-50/40 via-white to-amber-50/30 dark:from-gray-800 dark:to-gray-800 border border-cath-red-100 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 text-left">
            <Sparkles className="w-4 h-4 text-cath-red-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Lộ trình thích ứng đã phân tích kết quả của bạn và tự động thiết
              lập 5 buổi học tiếp theo nhằm tối ưu hóa khả năng phản xạ và ghi nhớ.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-cath-red-700 via-cath-red-600 to-cath-red-700 hover:brightness-110 shadow-lg shadow-cath-red-600/20 active:scale-98 transition-all"
            >
              <span>Bắt đầu chu kỳ mới</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default CycleSummaryModal
