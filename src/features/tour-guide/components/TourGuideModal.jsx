import React from "react"
import { motion } from "framer-motion"
import Confetti from "react-confetti"
import TourGuideMascot from "./TourGuideMascot"

export const TourGuideModal = ({
  step,
  totalSteps,
  onNext,
  onSkip,
}) => {
  const isCompletionStep = step.stepIndex === totalSteps

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4">
      {/* Confetti celebration on completion */}
      {isCompletionStep && (
        <div className="pointer-events-none fixed inset-0 z-[9996]">
          <Confetti
            recycle={false}
            numberOfPieces={260}
            gravity={0.15}
            width={window.innerWidth}
            height={window.innerHeight}
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -16 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-white rounded-[32px] p-6 sm:p-8 md:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.25)] border border-rose-100 max-w-[640px] w-full text-left select-none"
      >
        {/* Top-right "Bỏ qua" button */}
        <div className="flex justify-end -mt-1 -mr-1 mb-2">
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600 text-xs sm:text-[13px] font-medium cursor-pointer transition-colors px-1"
          >
            Bỏ qua
          </button>
        </div>

        {/* Content body with Mascot on left and text on right */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-7">
          <div className="w-40 sm:w-48 md:w-56 shrink-0 flex items-center justify-center">
            <TourGuideMascot
              src={step.mascot}
              alt={step.mascotAlt}
              className="w-full h-auto"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-[28px] font-extrabold text-gray-900 tracking-tight leading-snug">
              {step.titlePrefix}
              {step.titleHighlight && (
                <span className="text-[#980019]">{step.titleHighlight}</span>
              )}
              {step.titleSuffix}
            </h2>

            <p className="text-gray-600 text-xs sm:text-[14px] md:text-[15px] leading-relaxed mt-3">
              {step.description}
            </p>
          </div>
        </div>

        {/* Footer: Step Counter on left, Action buttons on right */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <span className="text-xs sm:text-[13px] font-medium text-gray-400">
            {step.stepIndex}/{totalSteps}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onSkip}
              className="px-5 sm:px-6 py-2 rounded-full border border-rose-300 text-rose-800 font-semibold text-xs sm:text-sm hover:bg-rose-50 transition-colors cursor-pointer"
            >
              {step.secondaryText}
            </button>

            <button
              onClick={onNext}
              className="px-6 sm:px-7 py-2 rounded-full bg-[#980019] hover:bg-[#800015] text-white font-semibold text-xs sm:text-sm shadow-md transition-all hover:shadow cursor-pointer"
            >
              {step.primaryText}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default TourGuideModal
