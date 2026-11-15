import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  readActiveSession,
  readResult,
  saveActiveSession,
  saveResult,
} from "./sessionStorage"

const memoryStorage = () => {
  const map = new Map()
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    clear: () => map.clear(),
    key: (index) => [...map.keys()][index] ?? null,
    get length() {
      return map.size
    },
  }
}

let storage

const signInAs = (accountId, username = `user-${accountId}`) =>
  storage.setItem("user", JSON.stringify({ accountId, username }))

beforeEach(() => {
  storage = memoryStorage()
  vi.stubGlobal("window", { localStorage: storage })
  vi.stubGlobal("localStorage", storage)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("placement cache ownership", () => {
  it("does not return the previous account's result to the next account", () => {
    signInAs(101)
    saveResult({ band: 2, code: "psess_a", vocabulary: 67 })

    signInAs(202)

    expect(readResult()).toBeNull()
  })

  it("does not return the previous account's active session to the next account", () => {
    signInAs(101)
    saveActiveSession({ id: "psess_a", status: "in_progress" })

    signInAs(202)

    expect(readActiveSession()).toBeNull()
  })

  it("returns the cached result to the account that saved it", () => {
    signInAs(101)
    saveResult({ band: 2, code: "psess_a", vocabulary: 67 })

    expect(readResult()).toEqual({ band: 2, code: "psess_a", vocabulary: 67 })
  })

  it("drops a cache entry written before ownership scoping", () => {
    signInAs(202)
    storage.setItem(
      "catspeak_pt_result",
      JSON.stringify({ band: 2, code: "psess_a", vocabulary: 67 }),
    )

    expect(readResult()).toBeNull()
    expect(storage.getItem("catspeak_pt_result")).toBeNull()
  })

  it("wipes the placement cache when the auth session logs out", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    signInAs(101)
    saveResult({ band: 2, code: "psess_a" })
    saveActiveSession({ id: "psess_a", status: "in_progress" })
    storage.setItem("catspeak_pt_future_key", "{}")

    const { default: authReducer, logout } = await import(
      "@/store/slices/authSlice"
    )
    authReducer(undefined, logout())

    expect(storage.getItem("catspeak_pt_result")).toBeNull()
    expect(storage.getItem("catspeak_pt_active_session")).toBeNull()
    expect(storage.getItem("catspeak_pt_future_key")).toBeNull()
  })
})
