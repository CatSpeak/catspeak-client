import { useEffect, useState, useRef } from "react"

/**
 * Local elapsed-time timer that starts counting from when the hook mounts
 * (i.e., when the user joins the call).
 *
 * @param {number|null} durationMinutes - Room duration in minutes (from room.duration). If null, timer is hidden.
 * @returns {{ elapsedSeconds: number, formattedElapsed: string, formattedMax: string|null, hasDuration: boolean }}
 */
export const useSessionTimer = (createdAt = null, durationMinutes = null, serverRemainingSeconds = null) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const hasDuration = typeof durationMinutes === "number"
  const startMsRef = useRef(createdAt ? new Date(createdAt).getTime() : Date.now())

  // If the server provides an authoritative remaining time, adjust our anchor timestamp
  // so the local timer perfectly aligns with the server and naturally ticks down.
  useEffect(() => {
    if (serverRemainingSeconds !== null && hasDuration) {
      const maxSeconds = durationMinutes * 60
      const expectedElapsed = Math.max(0, maxSeconds - serverRemainingSeconds)
      startMsRef.current = Date.now() - expectedElapsed * 1000
      setElapsedSeconds(expectedElapsed)
    }
  }, [serverRemainingSeconds, hasDuration, durationMinutes])

  useEffect(() => {
    const maxSeconds = hasDuration ? durationMinutes * 60 : Infinity

    const updateElapsed = () => {
      const diff = Math.floor((Date.now() - startMsRef.current) / 1000)
      const safeDiff = diff > 0 ? diff : 0
      setElapsedSeconds(safeDiff > maxSeconds ? maxSeconds : safeDiff)
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
