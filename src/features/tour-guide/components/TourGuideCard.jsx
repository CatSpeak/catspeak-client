import React, { useMemo } from "react"
import { motion as Motion } from "framer-motion"
import TourGuideMascot from "./TourGuideMascot"

export const TourGuideCard = ({
  step,
  totalSteps,
  targetRect,
  onNext,
  onPrev,
  onSkip,
}) => {
  // Compute floating coordinates with boundary safety
  const positionStyle = useMemo(() => {
    if (!targetRect) {
      // Centered fallback if target is not ready
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }
    }

    const cardWidth = Math.min(520, window.innerWidth - 32)
    const cardEstHeight = 220
    const margin = 16

    let top = 0
    let left = 0

    switch (step.preferredPosition) {
      case "bottom-left":
        top = targetRect.bottom + margin
        left = targetRect.left
        break
      case "bottom-right":
        top = targetRect.bottom + margin
        left = targetRect.right - cardWidth
        break
      case "bottom-center":
        top = targetRect.bottom + margin
        left = targetRect.left + (targetRect.width - cardWidth) / 2
        break
      case "top-center":
        top = targetRect.top - cardEstHeight - margin
        left = targetRect.left + (targetRect.width - cardWidth) / 2
        break
      case "right-center":
        top = targetRect.top + 40
        left = targetRect.right + margin
        break
      default:
        top = targetRect.bottom + margin
        left = targetRect.left
    }

    // Viewport boundary clamping
    left = Math.max(16, Math.min(left, window.innerWidth - cardWidth - 16))

    // Flip top if overflowing bottom
    if (top + cardEstHeight > window.innerHeight - 16) {
      if (targetRect.top - cardEstHeight - margin > 70) {
        top = targetRect.top - cardEstHeight - margin
      } else {
        top = Math.max(70, window.innerHeight - cardEstHeight - 20)
      }
    }

    if (top < 70) {
      top = 70
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
    }
  }, [targetRect, step.preferredPosition])

  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      style={positionStyle}
      className="fixed z-[9995] bg-white rounded-[26px] p-5 sm:p-6 md:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.22)] border border-rose-100/90 text-left select-none"
    >
      {/* Top row: Close / Skip button */}
      <div className="flex justify-end -mt-1 -mr-1 mb-1">
        <button
          onClick={onSkip}
          className="text-gray-400 hover:text-gray-600 text-xs sm:text-[13px] font-medium cursor-pointer transition-colors px-1"
        >
          {step.secondaryText === "Bỏ qua" ? "Bỏ qua" : "Bỏ qua"}
        </button>
      </div>

      {/* Main content body with mascot on left and text on right */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="w-28 sm:w-36 md:w-44 shrink-0 flex items-center justify-center">
          <TourGuideMascot
            src={step.mascot}
            alt={step.mascotAlt}
            className="w-full h-auto"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight leading-snug">
            {step.titlePrefix}
            <span className="text-[#980019]">{step.titleHighlight}</span>
            {step.titleSuffix}
          </h3>

          <p className="text-gray-600 text-xs sm:text-[13.5px] md:text-[14px] leading-relaxed mt-2 line-clamp-4 sm:line-clamp-none">
            {step.description}
          </p>
        </div>
      </div>

      {/* Footer: Step Counter on left, Action buttons on right */}
      <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-100/80">
        <span className="text-xs sm:text-[13px] font-medium text-gray-400">
          {step.stepIndex}/{totalSteps}
        </span>

        <div className="flex items-center gap-2.5">
          {step.stepIndex > 1 && (
            <button
              onClick={onPrev}
              className="px-4 sm:px-5 py-1.5 rounded-full border border-rose-300 text-rose-800 font-semibold text-xs sm:text-[13px] hover:bg-rose-50 transition-colors cursor-pointer"
            >
              Quay lại
            </button>
          )}

          <button
            onClick={onNext}
            className="px-5 sm:px-6 py-1.5 rounded-full bg-[#980019] hover:bg-[#800015] text-white font-semibold text-xs sm:text-[13px] shadow-sm transition-all hover:shadow cursor-pointer"
          >
            {step.primaryText}
          </button>
        </div>
      </div>
    </Motion.div>
  )
}

export default TourGuideCard
