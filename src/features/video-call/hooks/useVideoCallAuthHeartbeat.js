import { useEffect, useRef } from "react"
import { useSelector, useStore } from "react-redux"
import { ensureRefresh, tokenSecondsRemaining } from "@/store/api/baseApi"

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000 // Run check every 2 minutes
const TOKEN_REFRESH_THRESHOLD_SECONDS = 10 * 60 // Refresh if less than 10 minutes remain

/**
 * Periodically checks Access Token validity while in an active video call.
 * Proactively refreshes the token before it expires so the user's session
 * remains active during long calls without relying on user interaction or navigation.
 */
export function useVideoCallAuthHeartbeat() {
  const isInCall = useSelector((state) => state.videoCall?.isInCall)
  const store = useStore()
  const isRefreshingRef = useRef(false)

  useEffect(() => {
    if (!isInCall) return

    const checkAndRefreshToken = async () => {
      if (isRefreshingRef.current) return

      const state = store.getState()
      const token = state.auth?.token || localStorage.getItem("token")
      if (!token) return

      const remaining = tokenSecondsRemaining(token)

      if (remaining <= TOKEN_REFRESH_THRESHOLD_SECONDS) {
        console.info(
          "[VideoCallAuthHeartbeat] Token near expiry during call — triggering heartbeat refresh",
          {
            remainingSeconds: Math.round(remaining),
            thresholdSeconds: TOKEN_REFRESH_THRESHOLD_SECONDS,
          },
        )

        try {
          isRefreshingRef.current = true
          await ensureRefresh(store, undefined, "call-heartbeat")
        } catch (error) {
          console.warn("[VideoCallAuthHeartbeat] Heartbeat refresh failed:", error)
        } finally {
          isRefreshingRef.current = false
        }
      }
    }

    // Run an initial check shortly after entering the call
    const initialTimer = setTimeout(() => {
      checkAndRefreshToken()
    }, 5000)

    // Periodic heartbeat check
    const intervalId = setInterval(checkAndRefreshToken, HEARTBEAT_INTERVAL_MS)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(intervalId)
    }
  }, [isInCall, store])
}

export default useVideoCallAuthHeartbeat
