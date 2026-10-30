import { createContext, useContext } from "react"

export const TourGuideContext = createContext(null)

const defaultContextValue = {
  isOpen: false,
  currentStepIndex: 0,
  currentStep: null,
  totalSteps: 8,
  hasCompletedTour: true,
  startTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  skipTour: () => {},
  completeTour: () => {},
  resetTour: () => {},
}

export const useTourGuide = () => {
  const context = useContext(TourGuideContext)
  return context || defaultContextValue
}

export default TourGuideContext
