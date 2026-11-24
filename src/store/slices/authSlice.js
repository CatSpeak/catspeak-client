import { createSlice } from "@reduxjs/toolkit"
import { clearPlacementCache } from "@/features/placement-test/utils/sessionStorage"

// Helper to safely parse user from localStorage
const getUserFromStorage = () => {
  try {
    if (typeof localStorage === "undefined") return null
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

const getStorageItem = (key) => {
  try {
    if (typeof localStorage === "undefined") return null
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const initialState = {
  user: getUserFromStorage(),
  token: getStorageItem("token") || null,
  refreshToken: getStorageItem("refreshToken") || null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
}

/** Decode UTF-8 JSON JWT payload safely */
export function decodeJwtPayload(token) {
  try {
    if (typeof token !== "string") return null
    const base64Url = token.split(".")[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    return JSON.parse(json)
  } catch {
    return null
  }
}

/** Decode JWT payload to read expiration */
function decodeJwtExp(token) {
  const payload = decodeJwtPayload(token)
  return payload?.exp ? new Date(payload.exp * 1000) : null
}

const AUTH_LOG = "[Auth]"

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload

      if (user !== undefined) state.user = user
      if (token) state.token = token
      if (refreshToken) state.refreshToken = refreshToken
      state.status = "succeeded"

      if (typeof localStorage !== "undefined") {
        if (state.user) localStorage.setItem("user", JSON.stringify(state.user))
        if (state.token) localStorage.setItem("token", state.token)
        if (state.refreshToken)
          localStorage.setItem("refreshToken", state.refreshToken)
      }

      // Diagnostic: log token expiry so we can correlate with 401 events
      const exp = decodeJwtExp(state.token)
      if (exp) {
        console.info(
          AUTH_LOG,
          `Credentials set — token expires at ${exp.toISOString()}`,
        )
      }
    },
    logout: (state) => {
      console.warn(AUTH_LOG, "Logout dispatched")
      state.user = null
      state.token = null
      state.refreshToken = null
      state.status = "idle"

      if (typeof localStorage !== "undefined") {
        try {
          localStorage.removeItem("user")
          localStorage.removeItem("token")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("ai_guest_token")
          localStorage.removeItem("ai_guest_id")
        } catch {
          /* ignore storage errors */
        }
      }
      if (typeof sessionStorage !== "undefined") {
        try {
          sessionStorage.removeItem("catspeak_active_inchat_call_session")
          sessionStorage.removeItem("catspeak_just_registered")
        } catch {
          /* ignore storage errors */
        }
      }
      clearPlacementCache()
    },
    setLoading: (state) => {
      state.status = "loading"
    },
    setError: (state) => {
      state.status = "failed"
    },
  },
})

export const { setCredentials, logout, setLoading, setError } =
  authSlice.actions

export default authSlice.reducer

// Selectors
export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentToken = (state) => state.auth.token
export const selectCurrentRefreshToken = (state) => state.auth.refreshToken
export const selectIsAuthenticated = (state) => !!state.auth.token
export const selectAuthStatus = (state) => state.auth.status
export const selectUserRole = (state) => state.auth.user?.roleName || "Guest"
