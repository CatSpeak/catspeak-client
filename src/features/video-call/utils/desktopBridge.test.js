import { afterEach, describe, expect, it, vi } from "vitest"

import {
  buildDesktopDeepLink,
  detectDesktopPlatform,
  getJoinPreference,
  getProtocolScheme,
  isAiOrLearningPathRoom,
  isCatspeakDesktop,
  isMobileDevice,
  setJoinPreference,
  shouldShowDesktopLauncher,
} from "./desktopBridge.js"

const WINDOWS_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
const MAC_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36"

const createStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    dump: () => Object.fromEntries(map),
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("detectDesktopPlatform", () => {
  it("detects Windows desktops as win-x64", () => {
    expect(detectDesktopPlatform(WINDOWS_UA)).toBe("win-x64")
  })

  it("defaults macOS to Apple Silicon and honours a detected Intel arch", () => {
    expect(detectDesktopPlatform(MAC_UA)).toBe("mac-arm64")
    expect(detectDesktopPlatform(MAC_UA, "x86_64")).toBe("mac-x64")
  })

  it("does not treat phones or unknown clients as desktops", () => {
    expect(detectDesktopPlatform(IPHONE_UA)).toBeNull()
    expect(detectDesktopPlatform(ANDROID_UA)).toBeNull()
    expect(detectDesktopPlatform("")).toBeNull()
    expect(detectDesktopPlatform("curl/8.0")).toBeNull()
  })
})

describe("isMobileDevice", () => {
  it("recognizes common mobile user agents", () => {
    expect(isMobileDevice(IPHONE_UA)).toBe(true)
    expect(isMobileDevice(ANDROID_UA)).toBe(true)
    expect(isMobileDevice(WINDOWS_UA)).toBe(false)
    expect(isMobileDevice(MAC_UA)).toBe(false)
  })

  it("recognizes iPadOS desktop-mode Safari via touch points", () => {
    expect(isMobileDevice(MAC_UA, 5)).toBe(true)
    expect(isMobileDevice(MAC_UA, 0)).toBe(false)
  })
})

describe("isCatspeakDesktop", () => {
  it("detects the Electron bridge or the CatspeakDesktop user agent", () => {
    expect(isCatspeakDesktop({ bridge: {}, userAgent: MAC_UA })).toBe(true)
    expect(isCatspeakDesktop({ bridge: null, userAgent: "CatspeakDesktop/1.0" })).toBe(
      true,
    )
    expect(isCatspeakDesktop({ bridge: null, userAgent: MAC_UA })).toBe(false)
  })
})

describe("isAiOrLearningPathRoom", () => {
  it("flags lp_ and lp- room ids", () => {
    expect(isAiOrLearningPathRoom("lp_abc123")).toBe(true)
    expect(isAiOrLearningPathRoom("lp-abc123")).toBe(true)
    expect(isAiOrLearningPathRoom("room_abc123")).toBe(false)
    expect(isAiOrLearningPathRoom(undefined)).toBe(false)
  })

  it("honours AI flags in the query string", () => {
    expect(isAiOrLearningPathRoom("room_1", "?ai=1")).toBe(true)
    expect(isAiOrLearningPathRoom("room_1", "learningPath=true")).toBe(true)
    expect(isAiOrLearningPathRoom("room_1", "?web=1")).toBe(false)
  })
})

describe("shouldShowDesktopLauncher", () => {
  const base = {
    roomId: "room_123",
    search: "",
    isDesktop: false,
    isMobile: false,
    preference: "ask",
    isSignedIn: true,
  }

  it("shows the launcher for a signed-in human room on desktop web", () => {
    expect(shouldShowDesktopLauncher(base)).toBe(true)
    expect(shouldShowDesktopLauncher({ ...base, preference: "desktop" })).toBe(true)
  })

  it("bypasses the launcher inside the desktop app", () => {
    expect(shouldShowDesktopLauncher({ ...base, isDesktop: true })).toBe(false)
  })

  it("bypasses the launcher on mobile devices", () => {
    expect(shouldShowDesktopLauncher({ ...base, isMobile: true })).toBe(false)
  })

  it("bypasses AI / learning-path rooms", () => {
    expect(
      shouldShowDesktopLauncher({ ...base, roomId: "lp_lesson_1" }),
    ).toBe(false)
    expect(
      shouldShowDesktopLauncher({ ...base, search: "?ai=1" }),
    ).toBe(false)
  })

  it("bypasses when the URL forces the web or the user remembered web", () => {
    expect(shouldShowDesktopLauncher({ ...base, search: "?web=1" })).toBe(false)
    expect(shouldShowDesktopLauncher({ ...base, search: "?web=true" })).toBe(false)
    expect(shouldShowDesktopLauncher({ ...base, preference: "web" })).toBe(false)
  })

  it("never shows for signed-out visitors", () => {
    expect(shouldShowDesktopLauncher({ ...base, isSignedIn: false })).toBe(false)
  })
})

describe("join preference persistence", () => {
  it("defaults to ask and round-trips explicit choices", () => {
    const storage = createStorage()

    expect(getJoinPreference(storage)).toBe("ask")
    expect(setJoinPreference("web", storage)).toBe(true)
    expect(getJoinPreference(storage)).toBe("web")
    expect(setJoinPreference("desktop", storage)).toBe(true)
    expect(getJoinPreference(storage)).toBe("desktop")
  })

  it("treats unknown values as ask and removes the key for ask", () => {
    const storage = createStorage({
      "catspeak:desktop:joinPreference": "bogus",
    })
    expect(getJoinPreference(storage)).toBe("ask")

    setJoinPreference("web", storage)
    expect(setJoinPreference("ask", storage)).toBe(true)
    expect(getJoinPreference(storage)).toBe("ask")
    expect(storage.dump()).toEqual({})
  })

  it("ignores invalid preferences and survives unavailable storage", () => {
    const storage = createStorage()
    expect(setJoinPreference("mobile", storage)).toBe(false)
    expect(storage.dump()).toEqual({})
    expect(getJoinPreference(null)).toBe("ask")
    expect(setJoinPreference("web", null)).toBe(false)

    const throwing = {
      getItem: () => {
        throw new Error("blocked")
      },
      setItem: () => {
        throw new Error("blocked")
      },
      removeItem: () => {
        throw new Error("blocked")
      },
    }
    expect(getJoinPreference(throwing)).toBe("ask")
    expect(setJoinPreference("web", throwing)).toBe(false)
  })
})

describe("getProtocolScheme", () => {
  it("prefers the API value over the build-time fallback", () => {
    vi.stubEnv("VITE_DESKTOP_PROTOCOL", "catspeak-staging")
    expect(getProtocolScheme({ protocolScheme: "catspeak" })).toBe("catspeak")
  })

  it("falls back to VITE_DESKTOP_PROTOCOL and then catspeak", () => {
    vi.stubEnv("VITE_DESKTOP_PROTOCOL", "catspeak-staging")
    expect(getProtocolScheme()).toBe("catspeak-staging")
    expect(getProtocolScheme({ protocolScheme: "  " })).toBe("catspeak-staging")

    vi.stubEnv("VITE_DESKTOP_PROTOCOL", "")
    expect(getProtocolScheme()).toBe("catspeak")
  })
})

describe("buildDesktopDeepLink", () => {
  it("builds the join deep link in the documented order", () => {
    expect(
      buildDesktopDeepLink({
        scheme: "catspeak-staging",
        roomId: "room_123",
        lang: "vi",
        code: "one-time-code",
      }),
    ).toBe(
      "catspeak-staging://join?roomId=room_123&lang=vi&code=one-time-code",
    )
  })

  it("omits an absent launch code and encodes parameters", () => {
    expect(
      buildDesktopDeepLink({
        scheme: "catspeak",
        roomId: "room 1",
        lang: "en",
      }),
    ).toBe("catspeak://join?roomId=room+1&lang=en")
  })

  it("uses the environment scheme when no explicit scheme is given", () => {
    vi.stubEnv("VITE_DESKTOP_PROTOCOL", "catspeak-staging")
    expect(
      buildDesktopDeepLink({
        roomId: "r1",
        lang: "ja",
        code: "c",
      }),
    ).toBe("catspeak-staging://join?roomId=r1&lang=ja&code=c")
  })
})
