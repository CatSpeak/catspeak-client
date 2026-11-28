// @vitest-environment happy-dom
import { configureStore } from "@reduxjs/toolkit"
import { beforeEach, describe, expect, it, vi } from "vitest"
import authReducer, { logout, setCredentials } from "../slices/authSlice"
import serverStatusReducer from "../slices/serverStatusSlice"
import { baseApi } from "./baseApi"
import {
  clearRegistrationCorrectionToken,
  extractRegistrationCorrectionToken,
  getRegistrationCorrectionToken,
  setRegistrationCorrectionToken,
} from "@/features/auth/utils/registrationCorrectionToken"
import { buildEmailCorrectionPayload } from "@/features/auth/utils/emailCorrection"
import { authApi } from "./authApi"

describe("CS-10 registration correction token (R6-2)", () => {
  beforeEach(() => {
    clearRegistrationCorrectionToken()
  })

  it("extracts the token from an RTK Query rejected action shape", () => {
    // Track 1 nests the token at `response.data.registrationCorrectionToken`;
    // RTK Query rejects with `{ error: FetchBaseQueryError }`.
    const rejected = {
      error: {
        status: 401,
        data: {
          success: false,
          data: { registrationCorrectionToken: "rtk-token" },
        },
      },
    }

    const body = rejected?.error?.data ?? rejected?.data
    expect(extractRegistrationCorrectionToken(body)).toBe("rtk-token")
  })

  it("extracts the token from direct and double-wrapped payloads", () => {
    expect(
      extractRegistrationCorrectionToken({
        registrationCorrectionToken: "flat-token",
      }),
    ).toBe("flat-token")
    expect(
      extractRegistrationCorrectionToken({
        data: { registrationCorrectionToken: "wrapped-token" },
      }),
    ).toBe("wrapped-token")
    expect(extractRegistrationCorrectionToken({ success: true })).toBeNull()
  })

  it("uses the password instead of a stale token when in fallback mode", () => {
    setRegistrationCorrectionToken("expired-token")

    const payload = buildEmailCorrectionPayload({
      email: "old@catspeak.edu.vn",
      newEmail: "new@catspeak.edu.vn",
      correctionToken: getRegistrationCorrectionToken(),
      requiresPassword: true,
      password: "MyPassword123",
    })

    expect(payload).toEqual({
      email: "old@catspeak.edu.vn",
      newEmail: "new@catspeak.edu.vn",
      password: "MyPassword123",
    })
    expect(payload).not.toHaveProperty("registrationCorrectionToken")
  })

  it("clears the rejected token so the next attempt cannot loop", () => {
    setRegistrationCorrectionToken("expired-token")
    clearRegistrationCorrectionToken()

    const payload = buildEmailCorrectionPayload({
      email: "old@catspeak.edu.vn",
      newEmail: "new@catspeak.edu.vn",
      correctionToken: getRegistrationCorrectionToken(),
      requiresPassword: true,
      password: "MyPassword123",
    })

    expect(getRegistrationCorrectionToken()).toBeNull()
    expect(payload.password).toBe("MyPassword123")
    expect(payload.registrationCorrectionToken).toBeUndefined()
  })

  it("sends the correction token when no password fallback is required", () => {
    setRegistrationCorrectionToken("valid-token")

    const payload = buildEmailCorrectionPayload({
      email: "old@catspeak.edu.vn",
      newEmail: "new@catspeak.edu.vn",
      correctionToken: getRegistrationCorrectionToken(),
      requiresPassword: false,
      password: "",
    })

    expect(payload).toEqual({
      email: "old@catspeak.edu.vn",
      newEmail: "new@catspeak.edu.vn",
      registrationCorrectionToken: "valid-token",
    })
  })
})

describe("ISS-78: getProfile hydrates state.auth.user", () => {
  // baseApi proactively refreshes tokens close to expiry, so use valid JWTs.
  const makeJwt = (label) => {
    const payload = btoa(
      JSON.stringify({
        sub: label,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
    return `header.${payload}.signature`
  }
  const TOKEN_1 = makeJwt("one")
  const TOKEN_2 = makeJwt("two")

  const buildStore = () => {
    localStorage.clear()
    const store = configureStore({
      reducer: {
        auth: authReducer,
        serverStatus: serverStatusReducer,
        [baseApi.reducerPath]: baseApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
    })
    store.dispatch(setCredentials({ token: TOKEN_1 }))
    return store
  }

  const mockFetchJson = (body, status = 200) => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      }),
    )
  }

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("hydrates auth.user and localStorage.user when the token is unchanged", async () => {
    const store = buildStore()
    expect(store.getState().auth.user).toBeNull()
    mockFetchJson({
      success: true,
      data: {
        accountId: 446,
        accountType: "Student",
        username: "learner",
        fullName: "Learner One",
      },
    })

    await store.dispatch(authApi.endpoints.getProfile.initiate()).unwrap()
    await vi.waitFor(() => expect(store.getState().auth.user).not.toBeNull())

    const user = store.getState().auth.user
    expect(user).toMatchObject({
      accountId: 446,
      accountType: "Student",
      username: "learner",
      fullName: "Learner One",
    })
    expect(JSON.parse(localStorage.getItem("user"))).toMatchObject({
      accountId: 446,
      username: "learner",
    })
  })

  it("maps a profile id to accountId and defaults a missing accountType", async () => {
    const store = buildStore()
    mockFetchJson({ id: 474, email: "teacher@catspeak.edu.vn" })

    await store.dispatch(authApi.endpoints.getProfile.initiate()).unwrap()
    await vi.waitFor(() => expect(store.getState().auth.user).not.toBeNull())

    expect(store.getState().auth.user).toMatchObject({
      accountId: 474,
      accountType: "Student",
      email: "teacher@catspeak.edu.vn",
    })
  })

  it("does not dispatch after the user logged out while the request was in flight", async () => {
    const store = buildStore()
    let releaseFetch
    globalThis.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          releaseFetch = () =>
            resolve(
              new Response(
                JSON.stringify({ accountId: 446, accountType: "Student" }),
                { status: 200, headers: { "content-type": "application/json" } },
              ),
            )
        }),
    )

    const request = store.dispatch(authApi.endpoints.getProfile.initiate())
    await vi.waitFor(() => expect(globalThis.fetch).toHaveBeenCalled())
    store.dispatch(logout())
    releaseFetch()
    await request

    expect(store.getState().auth.user).toBeNull()
    expect(localStorage.getItem("user")).toBeNull()
  })

  it("does not dispatch after the token changed (role switch) while the request was in flight", async () => {
    const store = buildStore()
    let releaseFetch
    globalThis.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          releaseFetch = () =>
            resolve(
              new Response(
                JSON.stringify({ accountId: 446, accountType: "Student" }),
                { status: 200, headers: { "content-type": "application/json" } },
              ),
            )
        }),
    )

    const request = store.dispatch(authApi.endpoints.getProfile.initiate())
    await vi.waitFor(() => expect(globalThis.fetch).toHaveBeenCalled())
    store.dispatch(
      setCredentials({
        token: TOKEN_2,
        user: { accountId: 474, accountType: "Teacher" },
      }),
    )
    releaseFetch()
    await request

    expect(store.getState().auth.user).toMatchObject({
      accountId: 474,
      accountType: "Teacher",
    })
  })

  it("ignores non-identity payloads", async () => {
    const store = buildStore()
    mockFetchJson({ success: true })

    await store.dispatch(authApi.endpoints.getProfile.initiate()).unwrap()

    expect(store.getState().auth.user).toBeNull()
  })

  it("restores localStorage.user even when Redux still holds the same user", async () => {
    const store = buildStore()
    const cachedUser = {
      accountId: 446,
      accountType: "Student",
      username: "learner",
      fullName: "Learner One",
    }
    store.dispatch(setCredentials({ user: cachedUser }))
    localStorage.removeItem("user")

    mockFetchJson({
      accountId: 446,
      accountType: "Student",
      username: "learner",
      fullName: "Learner One",
    })

    await store.dispatch(authApi.endpoints.getProfile.initiate()).unwrap()

    await vi.waitFor(() => expect(localStorage.getItem("user")).not.toBeNull())
    expect(JSON.parse(localStorage.getItem("user"))).toMatchObject({
      accountId: 446,
      username: "learner",
    })
    expect(store.getState().auth.user).toMatchObject({ accountId: 446 })
  })
})
