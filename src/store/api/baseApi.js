import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { setCredentials, logout } from "../slices/authSlice"
import { setServerDown, setServerUp } from "../slices/serverStatusSlice"

// ─── Helpers ────────────────────────────────────────────────────────
const AUTH_LOG = "[Auth]"

/** Decode JWT payload without a library */
function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

/** Seconds until the token expires (negative = already expired) */
function tokenSecondsRemaining(token) {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return -1
  return payload.exp - Date.now() / 1000
}

// How many seconds before expiry we proactively refresh
const PROACTIVE_REFRESH_BUFFER = 60

// ─── Base Query ─────────────────────────────────────────────────────
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set("authorization", `Bearer ${token}`)
    }
    return headers
  },
})

// ─── Refresh logic ──────────────────────────────────────────────────
let refreshPromise = null

/** Expose the in-flight refresh promise so other modules (e.g. SignalR) can wait for it */
export function getRefreshPromise() {
  return refreshPromise
}

/**
 * Attempt to refresh the token. Returns true on success.
 * Uses a mutex so only one refresh happens at a time.
 */
async function ensureRefresh(api, extraOptions, reason) {
  if (refreshPromise) {
    console.info(AUTH_LOG, "Refresh already in progress, waiting…")
    return refreshPromise
  }

  // Snapshot the credentials RIGHT NOW — before any concurrent call can
  // update them — so we send a matched token + refreshToken pair.
  const { token, refreshToken } = api.getState().auth
  const lsToken = token || localStorage.getItem("token")
  const lsRefresh = refreshToken || localStorage.getItem("refreshToken")

  if (!lsRefresh || !lsToken) {
    console.warn(AUTH_LOG, "No refresh token available — logging out", {
      reason,
    })
    api.dispatch(logout())
    return false
  }

  console.info(AUTH_LOG, `Starting token refresh (reason: ${reason})`, {
    tokenExp: decodeJwtPayload(lsToken)?.exp
      ? new Date(decodeJwtPayload(lsToken).exp * 1000).toISOString()
      : "unknown",
    tokenSecondsLeft: Math.round(tokenSecondsRemaining(lsToken)),
    tokenExpired: tokenSecondsRemaining(lsToken) < 0,
    refreshTokenPreview: lsRefresh?.slice(-8),
    stateHasToken: !!api.getState().auth.token,
    stateHasRefresh: !!api.getState().auth.refreshToken,
    lsHasToken: !!localStorage.getItem("token"),
    lsHasRefresh: !!localStorage.getItem("refreshToken"),
    stateAndLsTokenMatch:
      api.getState().auth.token === localStorage.getItem("token"),
    stateAndLsRefreshMatch:
      api.getState().auth.refreshToken === localStorage.getItem("refreshToken"),
  })

  refreshPromise = (async () => {
    try {
      const refreshResult = await baseQuery(
        {
          url: "/Auth/refresh-token",
          method: "POST",
          body: { token: lsToken, refreshToken: lsRefresh },
        },
        api,
        extraOptions,
      )

      if (refreshResult.error) {
        const status = refreshResult.error.status
        const details = refreshResult.error.data
        console.error(
          AUTH_LOG,
          `Refresh failed with status ${status} — logging out`,
          { reason, details, fullError: refreshResult.error },
        )
        api.dispatch(logout())
        return false
      }

      if (refreshResult.data) {
        const { user } = api.getState().auth
        api.dispatch(
          setCredentials({
            ...refreshResult.data,
            user: refreshResult.data.user || user,
          }),
        )
        const remaining = tokenSecondsRemaining(refreshResult.data.token)
        console.info(
          AUTH_LOG,
          `Refresh successful — new token expires in ${Math.round(remaining)}s`,
        )
        return true
      }

      console.error(AUTH_LOG, "Refresh returned no data — logging out", {
        reason,
      })
      api.dispatch(logout())
      return false
    } catch (err) {
      console.error(AUTH_LOG, "Refresh threw an exception — logging out", err, {
        reason,
      })
      api.dispatch(logout())
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// ─── Custom base query ──────────────────────────────────────────────
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const url = typeof args === "string" ? args : args?.url

  // Skip proactive refresh for auth endpoints
  const isAuthEndpoint = url === "/Auth/refresh-token" || url === "/Auth/login"

  // ── Proactive refresh: if token is close to expiring, refresh first ──
  if (!isAuthEndpoint) {
    const currentToken = api.getState().auth.token
    if (currentToken) {
      const remaining = tokenSecondsRemaining(currentToken)
      if (remaining < PROACTIVE_REFRESH_BUFFER) {
        console.info(
          AUTH_LOG,
          `Token expires in ${Math.round(remaining)}s — proactively refreshing before ${url}`,
        )
        await ensureRefresh(
          api,
          extraOptions,
          `proactive (${Math.round(remaining)}s left)`,
        )
      }
    }
  }

  // ── Execute the actual request ────────────────────────────────────
  let result = await baseQuery(args, api, extraOptions)

  // ── Handle 401 ────────────────────────────────────────────────────
  if (result.error?.status === 401) {
    console.warn(AUTH_LOG, `401 on ${url}`)

    // Never retry auth endpoints to avoid infinite loops
    if (isAuthEndpoint) {
      return result
    }

    const success = await ensureRefresh(api, extraOptions, `401 on ${url}`)

    if (success) {
      // Retry the original request with the new token
      result = await baseQuery(args, api, extraOptions)
      if (result.error) {
        console.error(
          AUTH_LOG,
          `Retry of ${url} still failed with status ${result.error.status}`,
        )
      }
    }
  }

  // ── Handle server-down / network errors ─────────────────────────
  if (
    result.error?.status === "FETCH_ERROR" ||
    result.error?.status === 502 ||
    result.error?.status === 503
  ) {
    console.warn(
      AUTH_LOG,
      `Server unreachable for ${url} — not an auth issue, skipping logout`,
    )
    api.dispatch(setServerDown())
  }

  // ── Recovery: clear server-down flag when a request succeeds ───
  if (!result.error && api.getState().serverStatus.isServerDown) {
    console.info(
      AUTH_LOG,
      "Server is reachable again — clearing server-down flag",
    )
    api.dispatch(setServerUp())
  }

  return result
}

// ─── Base API slice ─────────────────────────────────────────────────
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "User",
    "VideoSessions",
    "Rooms",
    "Stories",
    "MyStories",
    "Conversations",
    "Messages",
    "Events",
    "Post",
    "Recordings",
    "Storage",
    "InstructorProfile",
  ],
  endpoints: () => ({}),
})
