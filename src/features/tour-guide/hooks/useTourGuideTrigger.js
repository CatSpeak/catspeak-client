import { useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { useTourGuide } from "../context/TourGuideContext"

/**
 * Automatically triggers Tour Guide ONLY for newly registered users
 * (detected via sessionStorage flag set upon registration OTP verification).
 * Unauthenticated guests and existing users will NEVER be auto-triggered.
 */
export const useTourGuideTrigger = () => {
  const { isAuthenticated } = useAuth()
  const { hasCompletedTour, isOpen, startTour } = useTourGuide()
  const location = useLocation()
  const navigate = useNavigate()
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    // 1. Strictly require authenticated user. Unregistered / guest visitors NEVER trigger.
    if (!isAuthenticated) {
      return
    }

    // 2. If tour is already open, already completed, or already triggered in this session, do nothing.
    if (isOpen || hasCompletedTour || hasTriggeredRef.current) {
      return
    }

    // 3. Strictly require new user registration flag.
    const isJustRegistered =
      typeof window !== "undefined" &&
      sessionStorage.getItem("catspeak_just_registered") === "true"

    if (!isJustRegistered) {
      return
    }

    // 4. Exclude sensitive / non-app routes (e.g. active video call meet)
    const pathname = location.pathname
    if (pathname.includes("/meet/")) {
      return
    }

    // 5. Consume registration flag immediately to prevent repeat triggers
    hasTriggeredRef.current = true
    try {
      sessionStorage.removeItem("catspeak_just_registered")
    } catch {
      // ignore storage error
    }

    // 6. Navigate to community page if needed and start the tour
    const timer = setTimeout(() => {
      const communityLang =
        localStorage.getItem("communityLanguage") || "zh"
      const targetCommunityPath = `/${communityLang}/community`

      if (!location.pathname.startsWith(targetCommunityPath)) {
        navigate(targetCommunityPath, { replace: true })
      }

      startTour(0)
    }, 600)

    return () => clearTimeout(timer)
  }, [
    isAuthenticated,
    hasCompletedTour,
    isOpen,
    startTour,
    location.pathname,
    navigate,
  ])
}

export default useTourGuideTrigger
