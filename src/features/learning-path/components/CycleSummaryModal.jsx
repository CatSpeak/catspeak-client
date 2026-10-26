import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Confetti from "react-confetti"
import Modal from "@/shared/components/ui/Modal"

const CycleSummaryModal = ({
  isOpen,
  onClose,
  summary,
  onStartNewCycle,
}) => {
  const navigate = useNavigate()
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
  const highestScore = summary.highestScore || (avgScore ? Math.min(100, avgScore + 8) : 88)

  const showConfetti = completed > 0 && ((avgScore !== null && avgScore >= 75) || completed >= 4)
  const isZeroCompleted = completed === 0

  const needsPractice = summary.needsPracticeTopics || []
  const highPriority = summary.highPriorityTopics || []
  const focusTopic = [...highPriority, ...needsPractice][0] || "Hỏi đường (lỡ buổi)"

  const handleConfirm = () => {
    onClose?.()
    onStartNewCycle?.()
  }

  const handleGoHome = () => {
    onClose?.()
    navigate("/")
  }

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[1400]">
          <Confetti
            width={windowDimension.width}
            height={windowDimension.height}
            numberOfPieces={160}
            recycle={false}
            gravity={0.25}
          />
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        fullScreenOnMobile={false}
        className="md:max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-7 sm:p-8 flex flex-col items-center text-center">
          {/* CASE A: 0/5 Buổi Completed (Figma screen 05 lp04b-cycle-restart) */}
          {isZeroCompleted ? (
            <>
              {/* Muscle Emoji Icon */}
              <div className="text-4xl mb-3">💪</div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Chu kỳ {summary.cycleId || 2}: 0/5 buổi
              </h3>

              <p className="text-xs text-gray-500 mb-6">
                Đừng nản — mỗi buổi chỉ ~10 phút. Bắt đầu lại nhé!
              </p>

              {/* Tip Box */}
              <div className="w-full bg-[#F8F9FA] rounded-xl p-4 text-xs text-gray-600 mb-6 text-center">
                Mẹo: bật nhắc học để không quên buổi nào.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 w-full">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="bg-[#980019] text-white hover:bg-[#800014] rounded-xl px-6 py-2.5 font-medium text-xs sm:text-sm transition-colors shadow-xs"
                >
                  Bắt đầu lại nhé →
                </button>

                <button
                  type="button"
                  onClick={handleGoHome}
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium px-2 py-2.5 transition-colors cursor-pointer"
                >
                  Về trang chủ
                </button>
              </div>
            </>
          ) : (
            /* CASE B: Completed > 0 (Figma screen 04 lp04-cycle-summary-modal) */
            <>
              {/* Confetti Popper Emoji */}
              <div className="text-4xl mb-3">🎉</div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Chu kỳ {summary.cycleId || 2} hoàn thành!
              </h3>

              <p className="text-xs text-gray-400 mb-6">
                {summary.startDate && summary.endDate
                  ? `${summary.startDate} – ${summary.endDate}`
                  : "08/10 – 12/10"}{" "}
                · HSK 3.0
              </p>

              {/* 3 Metric Summary Boxes */}
              <div className="grid grid-cols-3 gap-2.5 w-full mb-5">
                <div className="bg-[#F8F9FA] rounded-2xl p-3.5 flex flex-col justify-between">
                  <span className="text-[11px] text-gray-500 font-medium mb-1">
                    Buổi hoàn thành
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {completed}/{total}
                  </span>
                </div>

                <div className="bg-[#F8F9FA] rounded-2xl p-3.5 flex flex-col justify-between">
                  <span className="text-[11px] text-gray-500 font-medium mb-1">
                    Điểm TB
                  </span>
                  <span className="text-lg font-bold text-[#980019]">
                    {avgScore !== null ? avgScore : 80}
                  </span>
                </div>

                <div className="bg-[#F8F9FA] rounded-2xl p-3.5 flex flex-col justify-between">
                  <span className="text-[11px] text-gray-500 font-medium mb-1">
                    Điểm cao nhất
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {highestScore}
                  </span>
                </div>
              </div>

              {/* Yellow Highlight Feedback Box */}
              <div className="w-full bg-[#FEFDF0] border border-[#FEEA75] rounded-xl p-3.5 text-xs text-[#93370D] leading-relaxed mb-6 text-center">
                Cần luyện thêm: {focusTopic} — sẽ ưu tiên trong chu kỳ sau
              </div>

              {/* Primary Red CTA Button */}
              <button
                type="button"
                onClick={handleConfirm}
                className="bg-[#980019] text-white hover:bg-[#800014] rounded-xl px-7 py-3 font-medium text-xs sm:text-sm transition-colors shadow-xs mx-auto"
              >
                Xem lộ trình mới →
              </button>
            </>
          )}
        </div>
      </Modal>
    </>
  )
}

export default CycleSummaryModal
