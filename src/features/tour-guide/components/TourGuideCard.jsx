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
    const comboWidth = Math.min(490, window.innerWidth - 32)
    const cardEstHeight = 220
    const margin = 16

    if (!targetRect) {
      // Centered fallback if target is temporarily measuring
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: `${comboWidth}px`,
      }
    }

    let top = 0
    let left = 0

    switch (step.preferredPosition) {
      case "bottom-left":
        top = targetRect.bottom + margin
        left = targetRect.left - 24
        break
      case "bottom-right":
        top = targetRect.bottom + margin
        left = targetRect.right - comboWidth + 16
        break
      case "bottom-center":
        top = targetRect.bottom + margin
        left = targetRect.left + (targetRect.width - comboWidth) / 2
        break
      case "top-center":
        top = targetRect.top - cardEstHeight - margin
        left = (window.innerWidth - comboWidth) / 2
        break
      case "right-center":
        top = Math.max(80, window.innerHeight * 0.25)
        left = targetRect.right + margin
        break
      default:
        top = targetRect.bottom + margin
        left = targetRect.left
    }

    // Viewport boundary clamping
    left = Math.max(16, Math.min(left, window.innerWidth - comboWidth - 16))

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
      width: `${comboWidth}px`,
    }
  }, [targetRect, step.preferredPosition])

  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      style={positionStyle}
      className="fixed z-[9995] flex items-center select-none"
    >
      {/* Floating Mascot standing on the left */}
      <div className="shrink-0 -mr-6 sm:-mr-8 z-10 w-28 sm:w-36 md:w-40 pointer-events-none drop-shadow-md">
        <TourGuideMascot
          src={step.mascot}
          alt={step.mascotAlt}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Tooltip Card Body */}
      <div className="bg-white rounded-[26px] sm:rounded-[28px] pl-8 sm:pl-10 pr-6 sm:pr-7 pt-4 sm:pt-5 pb-5 sm:pb-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)] border border-[#ffe6ea] max-w-[390px] w-full text-left relative">
        {/* Top-right "Bỏ qua" button in RED */}
        <div className="flex justify-end -mt-1 -mr-1 mb-1">
          <button
            onClick={onSkip}
            className="text-[#980019] hover:text-[#800015] font-semibold text-xs sm:text-[13px] cursor-pointer transition-colors px-1"
          >
            Bỏ qua
          </button>
        </div>

        {/* Headings */}
        <div className="min-w-0 pr-1">
          <h3 className="text-lg sm:text-xl md:text-[22px] font-extrabold tracking-tight leading-snug">
            <div className="text-gray-900">{step.titleLine1}</div>
            <div className="text-[#980019]">{step.titleLine2}</div>
          </h3>

          <p className="text-gray-600 text-xs sm:text-[13px] md:text-[13.5px] leading-relaxed mt-2.5">
            {step.description}
          </p>
        </div>

        {/* Footer: Step Counter on left, Action buttons on right (NO divider line) */}
        <div className="flex items-center justify-between mt-5">
          <span className="text-xs sm:text-[13px] font-medium text-gray-400">
            {step.stepIndex}/{totalSteps}
          </span>

          <div className="flex items-center gap-2.5">
            {step.stepIndex > 1 && (
              <button
                onClick={onPrev}
                className="px-4 sm:px-5 py-1.5 rounded-full border-[1.5px] border-[#980019] text-[#980019] bg-white hover:bg-rose-50 font-semibold text-xs sm:text-[13px] transition-colors cursor-pointer"
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
      </div>
    </Motion.div>
  )
}

export default TourGuideCard
