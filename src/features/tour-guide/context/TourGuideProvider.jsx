import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { TourGuideContext } from "./TourGuideContext"
import { TOUR_STEPS, TOTAL_TOUR_STEPS } from "../config/tourGuideSteps"

const PENDING_TOUR_STEP_KEY = "catspeak_pending_tour_step"

export const TourGuideProvider = ({ children }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [isOpen, setIsOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // Storage key is scoped to current user
  const storageKey = useMemo(() => {
    const id = user?.accountId || user?.id || "guest"
    return `catspeak_tour_completed_${id}`
  }, [user])

  const checkHasCompletedTour = useCallback(() => {
    try {
      return localStorage.getItem(storageKey) === "true"
    } catch {
      return false
    }
  }, [storageKey])

  const [hasCompletedTour, setHasCompletedTour] = useState(checkHasCompletedTour)

  useEffect(() => {
    setHasCompletedTour(checkHasCompletedTour())
  }, [checkHasCompletedTour])

  const currentStep = useMemo(
    () => TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0],
    [currentStepIndex]
  )

  // Route navigation helper ensuring the current step's route is active
  const ensureRoute = useCallback(
    (step) => {
      if (!step) return
      const communityLang = localStorage.getItem("communityLanguage") || "zh"
      const stepRoute = step.route || "/community"
      const targetPath = `/${communityLang}${stepRoute}`

      if (!location.pathname.startsWith(targetPath)) {
        navigate(targetPath)
      }
    },
    [location.pathname, navigate]
  )

  const startTour = useCallback(
    (fromStep = 0) => {
      const safeIndex = Math.max(0, Math.min(fromStep, TOTAL_TOUR_STEPS - 1))
      try {
        sessionStorage.setItem(PENDING_TOUR_STEP_KEY, String(safeIndex))
      } catch {
        // ignore storage error
      }
      ensureRoute(TOUR_STEPS[safeIndex])
      setCurrentStepIndex(safeIndex)
      setIsOpen(true)
    },
    [ensureRoute]
  )

  // Sync pending tour step across route transitions (e.g. if navigating to community page)
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem(PENDING_TOUR_STEP_KEY)
      if (pending !== null) {
        const stepNum = parseInt(pending, 10)
        if (!isNaN(stepNum)) {
          setCurrentStepIndex(stepNum)
          setIsOpen(true)
        }
      }
    } catch {
      // ignore storage error
    }
  }, [location.pathname])

  const completeTour = useCallback(() => {
    try {
      localStorage.setItem(storageKey, "true")
      sessionStorage.removeItem(PENDING_TOUR_STEP_KEY)
    } catch {
      // ignore storage errors
    }
    setHasCompletedTour(true)
    setIsOpen(false)
  }, [storageKey])

  const skipTour = useCallback(() => {
    try {
      localStorage.setItem(storageKey, "true")
      sessionStorage.removeItem(PENDING_TOUR_STEP_KEY)
    } catch {
      // ignore storage errors
    }
    setHasCompletedTour(true)
    setIsOpen(false)
  }, [storageKey])

  const resetTour = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
      sessionStorage.removeItem(PENDING_TOUR_STEP_KEY)
    } catch {
      // ignore storage errors
    }
    setHasCompletedTour(false)
    startTour(0)
  }, [storageKey, startTour])

  const nextStep = useCallback(() => {
    if (currentStepIndex < TOTAL_TOUR_STEPS - 1) {
      const nextIdx = currentStepIndex + 1
      try {
        sessionStorage.setItem(PENDING_TOUR_STEP_KEY, String(nextIdx))
      } catch {
        // ignore
      }
      ensureRoute(TOUR_STEPS[nextIdx])
      setCurrentStepIndex(nextIdx)
    } else {
      completeTour()
    }
  }, [currentStepIndex, completeTour, ensureRoute])

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1
      try {
        sessionStorage.setItem(PENDING_TOUR_STEP_KEY, String(prevIdx))
      } catch {
        // ignore
      }
      ensureRoute(TOUR_STEPS[prevIdx])
      setCurrentStepIndex(prevIdx)
    }
  }, [currentStepIndex, ensureRoute])

  // Expose global debug helpers for quick testing in browser console
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.startCatSpeakTour = (step = 0) => startTour(step)
      window.resetCatSpeakTour = () => resetTour()
    }
    return () => {
      delete window.startCatSpeakTour
      delete window.resetCatSpeakTour
    }
  }, [startTour, resetTour])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault()
        skipTour()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        nextStep()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        prevStep()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, skipTour, nextStep, prevStep])

  // Prevent background scroll for centered modal steps (1 and 8)
  useEffect(() => {
    if (!isOpen) return
    const isModalStep = currentStep.isModal
    if (isModalStep) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen, currentStep])

  const value = useMemo(
    () => ({
      isOpen,
      currentStepIndex,
      currentStep,
      totalSteps: TOTAL_TOUR_STEPS,
      hasCompletedTour,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      completeTour,
      resetTour,
    }),
    [
      isOpen,
      currentStepIndex,
      currentStep,
      hasCompletedTour,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      completeTour,
      resetTour,
    ]
  )

  return (
    <TourGuideContext.Provider value={value}>
      {children}
    </TourGuideContext.Provider>
  )
}

export default TourGuideProvider
