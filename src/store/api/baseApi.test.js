// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { store } from "../index"
import { decodeJwtPayload, logout, setCredentials } from "../slices/authSlice"
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
    vi.useRealTimers()
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

  it("decodes UTF-8 non-ASCII JWT payloads accurately", () => {
    const jsonPayload = JSON.stringify({
      sub: "123",
      name: "Nguyễn Văn A — Tiếng Việt",
      exp: 9999999999,
    })
    const bytes = new TextEncoder().encode(jsonPayload)
    const base64Url = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")

    const decoded = decodeJwtPayload(`hdr.${base64Url}.sig`)
    expect(decoded?.name).toBe("Nguyễn Văn A — Tiếng Việt")
    expect(decoded?.exp).toBe(9999999999)
  })

  it("holds refreshPromise mutex across transient 5xx retries until refresh settles", async () => {
    vi.useFakeTimers()
    localStorage.setItem("token", "header.eyJleHAiOjF9.sig")
    localStorage.setItem("refreshToken", "rt-valid")

    let refreshAttempts = 0
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      refreshAttempts += 1
      if (refreshAttempts === 1) {
        return new Response(JSON.stringify({ message: "Busy" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      }
      return new Response(
        JSON.stringify({
          token: "header.eyJleHAiOjk5OTk5OTk5OTl9.sig",
          refreshToken: "rt-new",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )
    })

    const queryResolver = vi.fn(async (args, api) => {
      if (args?.url === "/protected-resource") {
        const currentTok = api.getState().auth.token
        if (currentTok === "header.eyJleHAiOjk5OTk5OTk5OTl9.sig") {
          return { data: { ok: true } }
        }
        return { error: { status: 401, data: { message: "Expired" } } }
      }
      return { data: { ok: true } }
    })

    let authState = {
      token: "header.eyJleHAiOjF9.sig",
      refreshToken: "rt-valid",
    }
    const dispatch = vi.fn((action) => {
      if (action?.type === "auth/setCredentials") {
        authState = {
          token: action.payload.token,
          refreshToken: action.payload.refreshToken,
        }
      }
    })
    const makeApi = () => ({
      dispatch,
      getState: () => ({
        auth: authState,
        videoCall: { isInCall: false },
        serverStatus: { isServerDown: false },
      }),
      signal: new AbortController().signal,
    })

    const wrappedQuery = createReauthBaseQuery(queryResolver)
    const p1 = wrappedQuery({ url: "/protected-resource", method: "GET" }, makeApi(), {})
    await vi.advanceTimersByTimeAsync(10)
    const p2 = wrappedQuery({ url: "/protected-resource", method: "GET" }, makeApi(), {})

    await vi.advanceTimersByTimeAsync(2000)
    const [r1, r2] = await Promise.all([p1, p2])

    expect(refreshAttempts).toBe(2)
    expect(r1.data).toEqual({ ok: true })
    expect(r2.data).toEqual({ ok: true })
    expect(authState.token).toBe("header.eyJleHAiOjk5OTk5OTk5OTl9.sig")
  })
})
