import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { setCredentials, logout } from "../slices/authSlice"
import { setServerDown, setServerUp } from "../slices/serverStatusSlice"
import { checkIsServerHealthy } from "@/shared/utils/healthCheck"
import { getBrowserTimeZone } from "@/shared/constants/timezones"

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
export function tokenSecondsRemaining(token) {
  if (!token) return -1
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return -1
  return payload.exp - Date.now() / 1000
}

// How many seconds before expiry we proactively refresh (0 = refresh when expired)
export const PROACTIVE_REFRESH_BUFFER = 0

// ─── Base Query ─────────────────────────────────────────────────────
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
  prepareHeaders: (headers, { getState, extraOptions }) => {
    if (!extraOptions?.skipAuthHeader) {
      const token = getState().auth.token
      if (token) {
        headers.set("authorization", `Bearer ${token}`)
      }
    }

    // Extract community language from URL (e.g., /zh/cat-speak/...)
    const match = window.location.pathname.match(/^\/([a-z]{2})(?:\/|$)/i)
    if (match) {
      headers.set("X-Community-Lang", match[1])
    }

    // Attach user timezone (e.g. "Asia/Ho_Chi_Minh")
    const userTz = getState()?.auth?.user?.timeZone || getBrowserTimeZone()
    headers.set("X-Time-Zone", userTz)

    // Attach local timezone offset in minutes (JS returns negative for UTC+X, e.g. -420 for UTC+7)
    headers.set(
      "X-Timezone-Offset",
      (-new Date().getTimezoneOffset()).toString(),
    )

    return headers
  },
})

const instructorBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_INSTRUCTOR_API_BASE_URL || "/api",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set("authorization", `Bearer ${token}`)
    }

    const match = window.location.pathname.match(/^\/([a-z]{2})(?:\/|$)/i)
    if (match) {
      headers.set("X-Community-Lang", match[1])
    }

    const userTz = getState()?.auth?.user?.timeZone || getBrowserTimeZone()
    headers.set("X-Time-Zone", userTz)

    headers.set(
      "X-Timezone-Offset",
      (-new Date().getTimezoneOffset()).toString(),
    )

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
 * If requestToken is provided and the token in Redux has already changed,
 * it returns true immediately without calling the backend refresh endpoint.
 */
export async function ensureRefresh(
  api,
  extraOptions,
  reason,
  requestToken = null,
) {
  const currentToken = api.getState?.().auth?.token

  // If this request failed with requestToken, but the store's token has ALREADY been updated
  // by another concurrent refresh call, skip initiating a second refresh call.
  if (requestToken && currentToken && currentToken !== requestToken) {
    console.info(
      AUTH_LOG,
      "Token already updated by another call — skipping duplicate refresh",
      { reason },
    )
    return true
  }

  if (refreshPromise) {
    console.info(AUTH_LOG, "Refresh already in progress, waiting…", { reason })
    return refreshPromise
  }

  // Snapshot the credentials RIGHT NOW — before any concurrent call can
  // update them — so we send a matched token + refreshToken pair.
  const { token, refreshToken } = api.getState().auth
  const lsToken = token || localStorage.getItem("token")
  const lsRefreshToken = refreshToken || localStorage.getItem("refreshToken")

  if (!lsRefreshToken || !lsToken) {
    console.warn(AUTH_LOG, "No refresh token available — logging out")
    api.dispatch(logout())
    return false
  }

  console.info(
    AUTH_LOG,
    `Starting token refresh (reason: ${reason})`,
    `token prefix: ${lsToken?.substring(0, 12)}...`,
    `refreshPrefix: ${lsRefreshToken?.substring(0, 12)}...`,
  )

  refreshPromise = (async () => {
    try {
      const refreshResult = await baseQuery(
        {
          url: "/Auth/refresh-token",
          method: "POST",
          body: { token: lsToken, refreshToken: lsRefreshToken },
        },
        api,
        { ...extraOptions, skipAuthHeader: true },
      )

      if (refreshResult.error) {
        const status = refreshResult.error.status

        const isServerError =
          status === "FETCH_ERROR" ||
          (typeof status === "number" && status >= 500)

        if (isServerError) {
          const isHealthy = await checkIsServerHealthy()
          if (!isHealthy) {
            console.warn(
              AUTH_LOG,
              `Refresh failed with server/network error (${status}) — server down, skipping logout`,
              { reason },
            )
            api.dispatch(setServerDown())
            return false
          }

          console.warn(
            AUTH_LOG,
            `Refresh failed with server error (${status}) but server is healthy — logging out`,
            { reason },
          )
          api.dispatch(logout())
          return false
        }

        const remaining = tokenSecondsRemaining(lsToken)
        if (reason === "proactive" || remaining > 0) {
          console.warn(
            AUTH_LOG,
            `Refresh returned status ${status} during proactive check, but access token is still valid (${Math.round(remaining)}s remaining) — skipping premature logout`,
            { reason },
          )
          return false
        }

        console.error(
          AUTH_LOG,
          `Refresh failed with status ${status} — logging out`,
          { reason },
        )
        api.dispatch(logout())
        return false
      }

      if (refreshResult.data?.data) {
        const payload = refreshResult.data.data
        api.dispatch(setCredentials(payload))
        console.info(
          AUTH_LOG,
          "Token refresh successful — new credentials stored",
        )
        return true
      }

      console.error(AUTH_LOG, "Refresh returned no data — logging out", {
        reason,
      })
      api.dispatch(logout())
      return false
    } catch {
      console.error(AUTH_LOG, "Refresh threw an exception — logging out", {
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

/**
 * Higher-order baseQuery function that adds proactive token refresh,
 * 401 interceptor mutex re-authentication, and server health check handling.
 */
export function createReauthBaseQuery(queryResolver) {
  return async (args, api, extraOptions) => {
    const url = typeof args === "string" ? args : args?.url
    const isAuthEndpoint =
      url === "/Auth/refresh-token" || url === "/Auth/login"

    const requestToken = api.getState().auth.token

    // ── Proactive refresh: if token is close to expiring, refresh first ──
    if (!isAuthEndpoint && requestToken) {
      const remaining = tokenSecondsRemaining(requestToken)
      if (remaining < PROACTIVE_REFRESH_BUFFER) {
        console.info(
          AUTH_LOG,
          `Token nearing expiry — proactively refreshing before ${url}`,
        )
        await ensureRefresh(api, extraOptions, "proactive", requestToken)
      }
    }

    // ── Execute the actual request ────────────────────────────────────
    let result = await queryResolver(args, api, extraOptions)

    // ── Handle 401 ────────────────────────────────────────────────────
    if (result.error?.status === 401) {
      console.warn(AUTH_LOG, `401 on ${url}`)

      // Never retry auth endpoints to avoid infinite loops
      if (isAuthEndpoint) {
        return result
      }

      const success = await ensureRefresh(
        api,
        extraOptions,
        `401 on ${url}`,
        requestToken,
      )

      if (success) {
        // Retry the original request with the new token
        result = await queryResolver(args, api, extraOptions)
        if (result.error) {
          console.error(
            AUTH_LOG,
            `Retry of ${url} still failed with status ${result.error.status}`,
          )
        }
      }
    }

    // ── Handle server-down / network errors ─────────────────────────
    const isAborted = api.signal.aborted || result.error?.name === "AbortError"

    const status = result.error?.status
    const isServerError =
      status === "FETCH_ERROR" || (typeof status === "number" && status >= 500)

    if (!isAborted && isServerError) {
      const isHealthy = await checkIsServerHealthy()
      if (!isHealthy) {
        console.warn(
          AUTH_LOG,
          `Server unreachable for ${url} (health check failed) — not an auth issue, skipping logout`,
        )
        api.dispatch(setServerDown())
      } else {
        console.warn(
          AUTH_LOG,
          `Fetch error on ${url} but server is healthy — not setting server down`,
        )
      }
    }

    // ── Recovery: clear server-down flag when a request succeeds ───
    if (!result.error && api.getState().serverStatus.isServerDown) {
      console.info(
        AUTH_LOG,
        "Server is reachable again — clearing server-down flag",
      )
      api.dispatch(setServerUp())
    }

    // ── Global Data Normalization & Unwrapping ───────────────────────
    // Supports both Old API ({ data, additionalData }) and New API ({ success, data: { data, additionalData } })
    if (result.data && typeof result.data === "object") {
      const res = result.data

      // New API (Double-nested: { success: true, data: { data: [...], additionalData: {...} } })
      if (
        res.success &&
        res.data &&
        typeof res.data === "object" &&
        "data" in res.data
      ) {
        result.data = res.data
      }
      // Standard New API envelope ({ success: true, data: { ... } })
      else if (res.success && res.data !== undefined) {
        result.data = res.data
      }
      // Old API ({ data: [...], additionalData: {...} })
      // Keep result.data as-is without unwrapping so top-level additionalData is preserved!
    }

    return result
  }
}

// ─── Main base query with reauth ────────────────────────────────────
const baseQueryWithReauth = createReauthBaseQuery(
  async (args, api, extraOptions) => {
    const url = typeof args === "string" ? args : args?.url
    const isCoursesRoute =
      url &&
      (url.toLowerCase().startsWith("/teacher/") ||
        url.toLowerCase().startsWith("/student/") ||
        url.toLowerCase().startsWith("/explore/") ||
        url.toLowerCase().startsWith("/personal-materials") ||
        url.toLowerCase().startsWith("/v1/instructor") ||
        url.toLowerCase().startsWith("/v1/instructors"))
    const activeQuery = isCoursesRoute ? instructorBaseQuery : baseQuery
    return activeQuery(args, api, extraOptions)
  },
)

// ─── Base API slice ─────────────────────────────────────────────────
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "User",
    "Rooms",
    "Stories",
    "MyStories",
    "Conversations",
    "Messages",
    "Events",
    "Post",
    "PostComment",
    "Recordings",
    "Storage",
    "InstructorProfile",
    "Locations",
    "Reels",
    "ReelComments",
    "Courses",
    "Classes",
    "StudentCourses",
    "StudentClasses",
    "CourseDetail",
    "ClassDetail",
    "ClassGrading",
    "ClassMaterials",
    "Schedule",
    "Commission",
    "HonoredInstructors",
    "Curriculum",
    "Breakout",
    "CustomRooms",
    "Quizzes",
    "QuizDetail",
    "QuizGrading",
    "QuizStats",
    "QuizStudents",
    "StudentQuizzes",
    "StudentQuizResult",
    "Analytics",
    "InstructorBankAccounts",
    "RefundHistory",
    "PersonalMaterials",
    "Reviews",
  ],
  endpoints: () => ({}),
})
