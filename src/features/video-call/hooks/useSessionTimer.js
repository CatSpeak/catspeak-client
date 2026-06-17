import { useEffect, useState, useRef } from "react"

/**
 * Local elapsed-time timer that starts counting from when the hook mounts
 * (i.e., when the user joins the call).
 *
 * @param {number|null} durationMinutes - Room duration in minutes (from room.duration). If null, timer is hidden.
 * @returns {{ elapsedSeconds: number, formattedElapsed: string, formattedMax: string|null, hasDuration: boolean }}
 */
export const useSessionTimer = (createdAt = null, durationMinutes = null) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const hasDuration = typeof durationMinutes === "number"

  useEffect(() => {
    // If no createdAt is provided, fallback to when the component mounted
    const startMs = createdAt ? new Date(createdAt).getTime() : Date.now()
    const maxSeconds = hasDuration ? durationMinutes * 60 : Infinity

    const updateElapsed = () => {
      const diff = Math.floor((Date.now() - startMs) / 1000)
      const safeDiff = diff > 0 ? diff : 0
      setElapsedSeconds(safeDiff > maxSeconds ? maxSeconds : safeDiff)
    }

    updateElapsed()
    const intervalId = setInterval(updateElapsed, 1000)
    return () => clearInterval(intervalId)
  }, [createdAt, durationMinutes, hasDuration])

  const formatDuration = (totalSeconds) => {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0))
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0")
    const seconds = String(safeSeconds % 60).padStart(2, "0")
    return `${minutes}:${seconds}`
  }

  const maxSeconds = hasDuration ? durationMinutes * 60 : Infinity
  const remainingSeconds = hasDuration ? Math.max(0, maxSeconds - elapsedSeconds) : null

  return {
    elapsedSeconds,
    remainingSeconds,
    formattedElapsed: formatDuration(elapsedSeconds),
    formattedRemaining: hasDuration ? formatDuration(remainingSeconds) : null,
    formattedMax: hasDuration ? formatDuration(maxSeconds) : null,
    hasDuration,
  }
}
