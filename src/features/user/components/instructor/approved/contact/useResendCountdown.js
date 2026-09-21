import { useCallback, useEffect, useRef, useState } from "react"

export const RESEND_COOLDOWN_SECONDS = 60

export const formatCountdown = (totalSeconds) => {
  const safe = Math.max(0, Math.floor(totalSeconds || 0))
  const minutes = String(Math.floor(safe / 60)).padStart(2, "0")
  const seconds = String(safe % 60).padStart(2, "0")
  return `${minutes}:${seconds}`
}

/**
 * Server-enforced resend cooldown. The countdown is a UX mirror only — the
 * backend rejects a resend before its own 60s window regardless of this timer.
 */
const useResendCountdown = (initialSeconds = 0) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const intervalRef = useRef(null)

  const clear = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(
    (seconds = RESEND_COOLDOWN_SECONDS) => {
      clear()
      setSecondsLeft(seconds)
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clear()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    [clear],
  )

  const reset = useCallback(() => {
    clear()
    setSecondsLeft(0)
  }, [clear])

  useEffect(() => clear, [clear])

  return { secondsLeft, isCoolingDown: secondsLeft > 0, start, reset }
}

export default useResendCountdown
