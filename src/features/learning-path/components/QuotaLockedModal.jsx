import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Lock, Sparkles, Zap, Check, ArrowRight, Clock } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { formatResetsIn } from "../utils/learningPathUtils"

const QuotaLockedModal = ({ isOpen, onClose, quotaInfo }) => {
  const navigate = useNavigate()
  const [prevResetsIn, setPrevResetsIn] = useState(quotaInfo?.resetsInSeconds)
  const [secondsRemaining, setSecondsRemaining] = useState(
    quotaInfo?.resetsInSeconds || 0,
  )

  if (quotaInfo?.resetsInSeconds !== prevResetsIn) {
    setPrevResetsIn(quotaInfo?.resetsInSeconds)
    setSecondsRemaining(quotaInfo?.resetsInSeconds || 0)
  }

  useEffect(() => {
    if (!isOpen) return
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen])

  if (!isOpen) return null

  const dailyLimit = quotaInfo?.dailyLimit ?? 2
  const resetsFormatted = formatResetsIn(secondsRemaining)

  const handleUpgrade = () => {
    onClose?.()
    navigate("/pricing")
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      fullScreenOnMobile={false}
      className="md:max-w-md bg-white dark:bg-gray-850 rounded-3xl overflow-hidden shadow-2xl"
    >
      <div className="p-6 sm:p-7 flex flex-col items-center text-center">
        {/* Animated Icon Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 via-amber-500/20 to-orange-500/20 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        {/* Title & Message */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Đã đạt giới hạn hôm nay
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
          Bạn đã dùng hết{" "}
          <strong className="text-gray-900 dark:text-white font-semibold">
            {dailyLimit} buổi miễn phí
          </strong>{" "}
          hôm nay. Lượt học mới sẽ tự động mở lại vào{" "}
          <span className="font-semibold text-cath-red-600 dark:text-cath-red-400">
            00:00 đêm nay
          </span>
          .
        </p>

        {/* Live Countdown Ticker */}
        <div className="w-full my-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          <Clock className="w-4 h-4 text-cath-red-600 animate-spin" style={{ animationDuration: "12s" }} />
          <span>Mở lại sau:</span>
          <span className="font-mono font-bold text-cath-red-700 dark:text-cath-red-400 text-sm tracking-widest bg-white dark:bg-gray-900 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
            {resetsFormatted}
          </span>
        </div>

        {/* Premium Upgrade Value Banner */}
        <div className="w-full text-left p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border border-amber-200/80 dark:border-amber-700/50 mb-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Mở khóa với Premium:</span>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>Không giới hạn số buổi luyện nói mỗi ngày</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>Học sớm toàn bộ chu kỳ không bị ngắt quãng</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>AI sửa phát âm và phân tích thanh điệu chuyên sâu</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleUpgrade}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-cath-red-700 hover:brightness-110 shadow-lg shadow-orange-500/20 active:scale-98 transition-all"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Nâng cấp Premium ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Để mai học tiếp
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default QuotaLockedModal
