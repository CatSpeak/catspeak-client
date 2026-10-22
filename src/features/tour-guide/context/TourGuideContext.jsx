import { createContext, useContext } from "react"

export const TourGuideContext = createContext(null)

export const useTourGuide = () => {
  const context = useContext(TourGuideContext)
  if (!context) {
    throw new Error("useTourGuide must be used within a TourGuideProvider")
  }
  return context
}

export default TourGuideContext
