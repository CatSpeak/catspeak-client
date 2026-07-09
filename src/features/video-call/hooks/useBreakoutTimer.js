import { useState, useEffect, useRef } from "react"
import { useGetBreakoutStatusQuery } from "@/store/api/roomsApi"

export const useBreakoutTimer = (parentSessionId, isBreakoutActive, onTimerEnd) => {
  const { data: breakoutStatus } = useGetBreakoutStatusQuery(parentSessionId, {
    skip: !parentSessionId,
  })

  const [countdownSeconds, setCountdownSeconds] = useState(null)

  const isSessionBreakoutActive = isBreakoutActive || breakoutStatus?.isBreakoutActive

  useEffect(() => {
    if (isSessionBreakoutActive && breakoutStatus?.remainingSeconds != null) {
      setCountdownSeconds(breakoutStatus.remainingSeconds)
    } else {
      setCountdownSeconds(null)
    }
  }, [isSessionBreakoutActive, breakoutStatus?.remainingSeconds])

  const isTimerRunning = countdownSeconds !== null && countdownSeconds > 0

  const prevCountdownRef = useRef(countdownSeconds)
  useEffect(() => {
    if (prevCountdownRef.current > 0 && countdownSeconds === 0) {
      if (onTimerEnd) onTimerEnd()
    }
    prevCountdownRef.current = countdownSeconds
  }, [countdownSeconds, onTimerEnd])

  useEffect(() => {
    if (!isTimerRunning) return
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [isTimerRunning])

  const formattedTime =
    countdownSeconds !== null && countdownSeconds >= 0
      ? `${String(Math.floor(countdownSeconds / 60)).padStart(2, "0")}:${String(
          countdownSeconds % 60,
        ).padStart(2, "0")}`
      : ""

  return { countdownSeconds, formattedTime, breakoutStatus, isSessionBreakoutActive }
}
