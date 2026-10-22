import React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence } from "framer-motion"
import { useTourGuide } from "../context/TourGuideContext"
import { useTourTarget } from "../hooks/useTourTarget"
import TourGuideOverlay from "./TourGuideOverlay"
import TourGuideCard from "./TourGuideCard"
import TourGuideModal from "./TourGuideModal"

export const TourGuideContainer = () => {
  const {
    isOpen,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
  } = useTourGuide()

  const { targetRect } = useTourTarget(currentStep?.targetSelector, isOpen)

  // Backdrop click does NOT dismiss the tour (no-op absorption)
  const handleBackdropClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation()
  }

  // Clicking the highlighted spotlight target zone auto-advances to next step without closing tour
  const handleTargetClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation()
    nextStep()
  }

  if (typeof document === "undefined" || !isOpen || !currentStep) {
    return null
  }

  return createPortal(
    <AnimatePresence mode="wait">
      <div key="tour-guide-portal-root" className="tour-guide-root font-sans">
        {/* SVG Spotlight mask backdrop */}
        <TourGuideOverlay
          targetRect={currentStep.isModal ? null : targetRect}
          onBackdropClick={handleBackdropClick}
          onTargetClick={handleTargetClick}
        />

        {/* Modal mode (Steps 1 & 8) vs Tooltip mode (Steps 2-7) */}
        {currentStep.isModal ? (
          <TourGuideModal
            key={`tour-modal-${currentStep.stepIndex}`}
            step={currentStep}
            totalSteps={totalSteps}
            onNext={nextStep}
            onSkip={skipTour}
          />
        ) : (
          <TourGuideCard
            key={`tour-card-${currentStep.stepIndex}`}
            step={currentStep}
            totalSteps={totalSteps}
            targetRect={targetRect}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipTour}
          />
        )}
      </div>
    </AnimatePresence>,
    document.body
  )
}

export default TourGuideContainer
