import React from "react"
import { motion as Motion } from "framer-motion"
import Confetti from "react-confetti"
import TourGuideMascot from "./TourGuideMascot"

export const TourGuideModal = ({
  step,
  totalSteps,
  onNext,
  onSkip,
  isNudging = false,
}) => {
  const isCompletionStep = step.stepIndex === totalSteps

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4">
      {/* Confetti celebration on completion */}
      {isCompletionStep && (
        <div className="pointer-events-none fixed inset-0 z-[9996]">
          <Confetti
            recycle={false}
            numberOfPieces={280}
            gravity={0.15}
            width={window.innerWidth}
            height={window.innerHeight}
          />
        </div>
      )}

      <Motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          x: isNudging ? [-6, 6, -4, 4, -2, 2, 0] : 0,
        }}
        exit={{ opacity: 0, scale: 0.9, y: -16 }}
        transition={{
          duration: isNudging ? 0.45 : 0.3,
          ease: "easeOut",
        }}
        className="relative bg-white rounded-[32px] p-7 sm:p-9 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.25)] border border-[#ffe6ea] max-w-[660px] w-full text-left select-none"
      >
        {/* Content body with Mascot on left and text on right */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <div className="w-40 sm:w-48 md:w-56 shrink-0 flex items-center justify-center">
            <TourGuideMascot
              src={step.mascot}
              alt={step.mascotAlt}
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            {step.stepIndex === 1 ? (
              <h2 className="text-xl sm:text-2xl md:text-[28px] font-extrabold tracking-tight leading-snug">
                <div className="text-gray-900">{step.titleLine1}</div>
                <div className="text-gray-900">
                  với <span className="text-[#980019]">Cat Speak</span> 👋
                </div>
              </h2>
            ) : (
              <h2 className="text-xl sm:text-2xl md:text-[28px] font-extrabold text-[#980019] tracking-tight leading-snug">
                {step.titleLine1}
              </h2>
            )}

            <p className="text-gray-600 text-xs sm:text-[13.5px] md:text-[14.5px] leading-relaxed mt-3">
              {step.description}
            </p>

            {/* Footer: Step Counter on left, Action buttons on right (NO divider line) */}
            <div className="flex items-center justify-between mt-6">
              <span className="text-xs sm:text-[13px] font-medium text-gray-400">
                {step.stepIndex}/{totalSteps}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={onSkip}
                  className="px-5 sm:px-6 py-2 rounded-full border-[1.5px] border-[#980019] text-[#980019] bg-white hover:bg-rose-50 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  {step.secondaryText}
                </button>

                <button
                  onClick={onNext}
                  className="px-6 sm:px-8 py-2 rounded-full bg-[#980019] hover:bg-[#800015] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all hover:shadow cursor-pointer"
                >
                  {step.primaryText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Motion.div>
    </div>
  )
}

export default TourGuideModal
