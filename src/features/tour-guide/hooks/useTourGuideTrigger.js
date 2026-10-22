import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { useTourGuide } from "../context/TourGuideContext"

/**
 * Automatically triggers Tour Guide on first arrival at the main app / rooms page
 * if the user has not completed or skipped the tour yet.
 */
export const useTourGuideTrigger = () => {
  const { hasCompletedTour, isOpen, startTour } = useTourGuide()
  const location = useLocation()
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    // If tour is already open or already completed, do nothing
    if (isOpen || hasCompletedTour || hasTriggeredRef.current) {
      return
    }

    // Check if on a qualifying main application route (not landing /auth /reset-password)
    const pathname = location.pathname
    const isExemptRoute =
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/reset-password" ||
      pathname.includes("/meet/") ||
      pathname.startsWith("/pricing")

    if (isExemptRoute) {
      return
    }

    // Trigger after a short delay so DOM elements have rendered
    const timer = setTimeout(() => {
      if (!hasCompletedTour && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true
        startTour(0)
      }
    }, 700)

    return () => clearTimeout(timer)
  }, [hasCompletedTour, isOpen, startTour, location.pathname])
}

export default useTourGuideTrigger
