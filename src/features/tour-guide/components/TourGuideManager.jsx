import React from "react"
import TourGuideContainer from "./TourGuideContainer"
import { useTourGuideTrigger } from "../hooks/useTourGuideTrigger"

export const TourGuideManager = () => {
  useTourGuideTrigger()
  return <TourGuideContainer />
}

export default TourGuideManager
