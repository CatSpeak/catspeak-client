import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/features/auth"
import { TourGuideContext } from "./TourGuideContext"
import { TOUR_STEPS, TOTAL_TOUR_STEPS } from "../config/tourGuideSteps"

export const TourGuideProvider = ({ children }) => {
  const { user } = useAuth()

  const [isOpen, setIsOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // Storage key is scoped to current user or guest
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

  const startTour = useCallback((fromStep = 0) => {
    const safeIndex = Math.max(0, Math.min(fromStep, TOTAL_TOUR_STEPS - 1))
    setCurrentStepIndex(safeIndex)
    setIsOpen(true)
  }, [])

  const completeTour = useCallback(() => {
    try {
      localStorage.setItem(storageKey, "true")
    } catch {
      // ignore storage errors
    }
    setHasCompletedTour(true)
    setIsOpen(false)
  }, [storageKey])

  const skipTour = useCallback(() => {
    try {
      localStorage.setItem(storageKey, "true")
    } catch {
      // ignore storage errors
    }
    setHasCompletedTour(true)
    setIsOpen(false)
  }, [storageKey])

  const resetTour = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // ignore storage errors
    }
    setHasCompletedTour(false)
    startTour(0)
  }, [storageKey, startTour])

  const nextStep = useCallback(() => {
    if (currentStepIndex < TOTAL_TOUR_STEPS - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    } else {
      completeTour()
    }
  }, [currentStepIndex, completeTour])

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }, [currentStepIndex])

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
