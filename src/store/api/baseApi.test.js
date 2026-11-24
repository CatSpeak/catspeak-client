// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { store } from "../index"
import { logout, setCredentials } from "../slices/authSlice"
import { createReauthBaseQuery } from "./baseApi"

vi.mock("@/shared/utils/healthCheck", () => ({
  checkIsServerHealthy: vi.fn(async () => true),
}))

vi.mock("@/shared/utils/networkStatus", () => ({
  isBrowserOffline: vi.fn(() => false),
}))

describe("baseApi auth revocation, rate-limit, and logout reset", () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("logs out immediately on 401 TOKEN_REVOKED without calling refresh", async () => {
    const dispatch = vi.fn()
    const queryResolver = vi.fn(async () => ({
      error: {
        status: 401,
        data: { errorCode: "TOKEN_REVOKED", message: "Token revoked" },
      },
    }))

    const wrappedQuery = createReauthBaseQuery(queryResolver)
    await wrappedQuery(
      { url: "/courses/my-courses", method: "GET" },
      {
        dispatch,
        getState: () => ({
          auth: { token: "header.eyJleHAiOjk5OTk5OTk5OTl9.sig", refreshToken: "rt" },
        }),
        signal: new AbortController().signal,
      },
      {},
    )

    expect(dispatch).toHaveBeenCalledWith(logout())
    expect(queryResolver).toHaveBeenCalledTimes(1)
  })

  it("normalizes HTTP 429 Retry-After headers into structured rate-limit metadata", async () => {
    const queryResolver = vi.fn(async () => ({
      error: {
        status: 429,
        data: { message: "Too fast" },
      },
      meta: {
        response: {
          headers: new Headers({ "Retry-After": "42" }),
        },
      },
    }))

    const wrappedQuery = createReauthBaseQuery(queryResolver)
    const result = await wrappedQuery(
      { url: "/rooms", method: "GET" },
      {
        dispatch: vi.fn(),
        getState: () => ({ auth: { token: null } }),
        signal: new AbortController().signal,
      },
      {},
    )

    expect(result.error.retryAfterSeconds).toBe(42)
    expect(result.error.data.code).toBe("RATE_LIMITED")
    expect(result.error.data.retryAfterSeconds).toBe(42)
  })

  it("resets Redux state and guest/session storage on logout", () => {
    localStorage.setItem("ai_guest_token", "guest-tok")
    localStorage.setItem("ai_guest_id", "guest-1")
    sessionStorage.setItem("catspeak_active_inchat_call_session", "call-1")
    sessionStorage.setItem("catspeak_just_registered", "true")

    store.dispatch(
      setCredentials({
        user: { accountId: 42, username: "alice" },
        token: "tok",
        refreshToken: "ref",
      }),
    )

    store.dispatch(logout())

    expect(store.getState().auth.user).toBeNull()
    expect(store.getState().auth.token).toBeNull()
    expect(localStorage.getItem("ai_guest_token")).toBeNull()
    expect(localStorage.getItem("ai_guest_id")).toBeNull()
    expect(
      sessionStorage.getItem("catspeak_active_inchat_call_session"),
    ).toBeNull()
    expect(sessionStorage.getItem("catspeak_just_registered")).toBeNull()
  })
})
