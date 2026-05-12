import { useEffect, useState, useRef } from "react"

/**
 * Local elapsed-time timer that starts counting from when the hook mounts
 * (i.e., when the user joins the call).
 *
 * @param {number|null} durationMinutes - Room duration in minutes (from room.duration). If null, timer is hidden.
 * @returns {{ elapsedSeconds: number, formattedElapsed: string, formattedMax: string|null, hasDuration: boolean }}
 */
export const useSessionTimer = (durationMinutes = null) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const startTimeRef = useRef(Date.now())

  const hasDuration = durationMinutes != null

  useEffect(() => {
    if (!hasDuration) return

    const maxSeconds = durationMinutes * 60

    const updateElapsed = () => {
      const diff = Math.floor((Date.now() - startTimeRef.current) / 1000)
      // Cap at max duration
      setElapsedSeconds(diff > maxSeconds ? maxSeconds : diff)
    }

    updateElapsed()
    const intervalId = setInterval(updateElapsed, 1000)
    return () => clearInterval(intervalId)
  }, [hasDuration, durationMinutes])

  const formatDuration = (totalSeconds) => {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0))
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0")
    const seconds = String(safeSeconds % 60).padStart(2, "0")
    return `${minutes}:${seconds}`
  }

  const maxSeconds = hasDuration ? durationMinutes * 60 : 0
  const remainingSeconds = Math.max(0, maxSeconds - elapsedSeconds)

  return {
    elapsedSeconds,
    remainingSeconds,
    formattedRemaining: hasDuration ? formatDuration(remainingSeconds) : null,
    formattedMax: hasDuration ? formatDuration(maxSeconds) : null,
    hasDuration,
  }
}
