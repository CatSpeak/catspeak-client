// @vitest-environment happy-dom
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { beforeEach, describe, expect, it, vi } from "vitest"
import authReducer, { setCredentials, logout } from "@/store/slices/authSlice"
import { AuthVisibilitySync } from "./useVisibilityReauth"

const mocks = vi.hoisted(() => ({
  profileOptions: null,
  initiate: vi.fn(),
}))

vi.mock("@/store/api/authApi", () => ({
  useGetProfileQuery: (arg, options) => {
    mocks.profileOptions = options
    return { data: undefined, isLoading: false }
  },
  authApi: {
    endpoints: {
      getProfile: {
        initiate: (...args) => {
          mocks.initiate(...args)
          return { type: "test/getProfile" }
        },
      },
    },
  },
}))

const makeJwt = (label) => {
  const payload = btoa(
    JSON.stringify({ sub: label, exp: Math.floor(Date.now() / 1000) + 3600 }),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
  return `header.${payload}.signature`
}

const buildStore = () => configureStore({ reducer: { auth: authReducer } })

let storageHandler = null

const mount = (store) => {
  const originalAddEventListener = window.addEventListener.bind(window)
  vi.spyOn(window, "addEventListener").mockImplementation(
    (type, handler, options) => {
      if (type === "storage") storageHandler = handler
      return originalAddEventListener(type, handler, options)
    },
  )

  const container = document.createElement("div")
  const root = createRoot(container)
  act(() => {
    root.render(
      <Provider store={store}>
        <AuthVisibilitySync />
      </Provider>,
    )
  })
  return { root }
}

describe("ISS-78: AuthVisibilitySync auto-hydrates getProfile", () => {
  beforeEach(() => {
    localStorage.clear()
    mocks.initiate.mockReset()
    storageHandler = null
    vi.restoreAllMocks()
  })

  it("triggers getProfile when a token exists but the user is missing", () => {
    const store = buildStore()
    store.dispatch(setCredentials({ token: makeJwt("one"), user: null }))

    mount(store)

    expect(mocks.profileOptions).toEqual({ skip: false })
  })

  it("skips getProfile when the user is already cached", () => {
    const store = buildStore()
    store.dispatch(
      setCredentials({
        token: makeJwt("two"),
        user: { accountId: 446, accountType: "Student" },
      }),
    )

    mount(store)

    expect(mocks.profileOptions).toEqual({ skip: true })
  })

  it("skips getProfile for a guest without a token", () => {
    const store = buildStore()
    store.dispatch(logout())

    mount(store)

    expect(mocks.profileOptions).toEqual({ skip: true })
  })

  it("re-hydrates from the API when another tab clears localStorage.user", () => {
    const store = buildStore()
    store.dispatch({
      type: "auth/setCredentials",
      payload: { token: makeJwt("three"), user: null },
    })
    localStorage.removeItem("user")
    localStorage.setItem("token", store.getState().auth.token)

    mount(store)

    act(() => {
      storageHandler({ key: "user" })
    })

    expect(mocks.initiate).toHaveBeenCalledWith(undefined, {
      forceRefetch: true,
    })
  })

  it("mirrors a user written by another tab while the token is unchanged", () => {
    const store = buildStore()
    store.dispatch(setCredentials({ token: makeJwt("four"), user: null }))
    localStorage.setItem("token", store.getState().auth.token)

    mount(store)

    localStorage.setItem("user", JSON.stringify({ accountId: 446 }))
    act(() => {
      storageHandler({ key: "user" })
    })

    expect(store.getState().auth.user).toMatchObject({ accountId: 446 })
  })
})
