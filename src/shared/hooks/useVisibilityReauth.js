import { useEffect } from "react"
import { useStore } from "react-redux"
import { setCredentials, logout } from "@/store/slices/authSlice"
import {
  ensureRefresh,
  tokenSecondsRemaining,
  PROACTIVE_REFRESH_BUFFER,
} from "@/store/api/baseApi"

/**
 * Hook to proactively refresh authentication token when tab becomes visible or receives focus,
 * and sync token changes across multiple open tabs via window 'storage' events.
 * Solves iOS Safari issue where timers are suspended in background, causing expired tokens
 * when user resumes the app after 30+ minutes.
 */
export function useVisibilityReauth() {
  const store = useStore()

  useEffect(() => {
    const handleVisibilityOrFocus = async () => {
      if (document.visibilityState !== "visible") return

      const state = store.getState()
      const token = state.auth?.token
      if (!token) return

      const remaining = tokenSecondsRemaining(token)
      if (remaining <= PROACTIVE_REFRESH_BUFFER) {
        console.info(
          "[AuthVisibilitySync] Tab resumed/focused with token near or past expiry — triggering proactive refresh",
          { remainingSeconds: remaining },
        )
        await ensureRefresh(store, undefined, "visibilitychange/focus")
      }
    }

    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "refreshToken" || e.key === "user") {
        const lsToken = localStorage.getItem("token")
        const lsRefreshToken = localStorage.getItem("refreshToken")
        const userStr = localStorage.getItem("user")

        if (!lsToken) {
          console.info("[AuthVisibilitySync] Token removed in another tab — syncing logout")
          store.dispatch(logout())
        } else if (lsToken !== store.getState().auth?.token) {
          console.info("[AuthVisibilitySync] Token updated in another tab — syncing credentials")
          try {
            const user = userStr ? JSON.parse(userStr) : store.getState().auth?.user
            store.dispatch(
              setCredentials({
                token: lsToken,
                refreshToken: lsRefreshToken,
                user,
              }),
            )
          } catch {
            // handle JSON parse error if any
          }
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityOrFocus)
    window.addEventListener("focus", handleVisibilityOrFocus)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus)
      window.removeEventListener("focus", handleVisibilityOrFocus)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [store])
}

/**
 * Empty component that can be mounted in the App tree to enable visibility sync.
 */
export function AuthVisibilitySync() {
  useVisibilityReauth()
  return null
}

export default useVisibilityReauth
