import { createSlice } from "@reduxjs/toolkit"

// Helper to safely parse user from localStorage
const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  } catch (e) {
    return null
  }
}

const initialState = {
  user: getUserFromStorage(),
  token: localStorage.getItem("token") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
}

/** Decode JWT payload to read expiration */
function decodeJwtExp(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(atob(base64))
    return payload.exp ? new Date(payload.exp * 1000) : null
  } catch {
    return null
  }
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

      if (state.user) localStorage.setItem("user", JSON.stringify(state.user))
      if (state.token) localStorage.setItem("token", state.token)
      if (state.refreshToken)
        localStorage.setItem("refreshToken", state.refreshToken)

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

      localStorage.removeItem("user")
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
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
export const selectIsAuthenticated = (state) => !!state.auth.token
export const selectAuthStatus = (state) => state.auth.status
export const selectUserRole = (state) => state.auth.user?.roleName || "Guest"
