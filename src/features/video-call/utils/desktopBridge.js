/**
 * Desktop bridge helpers shared by the web launcher gate and (ticket 06) the
 * auth handoff. All browser globals are read lazily so the helpers stay pure
 * enough to unit test in Node.
 */

const JOIN_PREFERENCE_KEY = "catspeak:desktop:joinPreference"
const JOIN_PREFERENCES = ["ask", "desktop", "web"]

const getDefaultStorage = () => {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const getDefaultUserAgent = () =>
  typeof navigator !== "undefined" ? navigator.userAgent || "" : ""

export function isMobileDevice(
  userAgent = getDefaultUserAgent(),
  maxTouchPoints =
    typeof navigator !== "undefined" ? navigator.maxTouchPoints || 0 : 0,
) {
  const ua = userAgent || ""
  if (/Android|iPhone|iPad|iPod|Windows Phone|IEMobile|Opera Mini|Mobile/i.test(ua))
    return true
  // iPadOS 13+ reports a Macintosh desktop UA in Safari; touch points reveal it.
  return /Macintosh/i.test(ua) && maxTouchPoints > 1
}

export function isCatspeakDesktop({ bridge, userAgent } = {}) {
  const desktopBridge =
    bridge !== undefined
      ? bridge
      : typeof window !== "undefined"
        ? window.catspeakDesktop
        : undefined
  const ua = userAgent !== undefined ? userAgent : getDefaultUserAgent()

  return Boolean(desktopBridge) || /CatspeakDesktop/i.test(ua || "")
}

export function isAiOrLearningPathRoom(roomId, search = "") {
  if (/^lp[_-]/i.test(String(roomId || ""))) return true

  try {
    const params = new URLSearchParams(
      String(search || "").startsWith("?")
        ? String(search).slice(1)
        : String(search || ""),
    )
    const flag = params.get("ai") ?? params.get("learningPath") ?? params.get("lp")
    return flag === "1" || flag === "true"
  } catch {
    return false
  }
}

export function shouldShowDesktopLauncher({
  roomId,
  search = "",
  isDesktop = isCatspeakDesktop(),
  isMobile = isMobileDevice(),
  preference = getJoinPreference(),
  isSignedIn = true,
} = {}) {
  if (!isSignedIn) return false
  if (isDesktop) return false
  if (isMobile) return false
  if (isAiOrLearningPathRoom(roomId, search)) return false

  try {
    const params = new URLSearchParams(
      String(search || "").startsWith("?")
        ? String(search).slice(1)
        : String(search || ""),
    )
    const web = params.get("web")
    if (web === "1" || web === "true") return false
  } catch {
    // Malformed query string: fall through to the preference check.
  }

  return preference !== "web"
}

export function getJoinPreference(storage = getDefaultStorage()) {
  if (!storage) return "ask"
  try {
    const value = storage.getItem(JOIN_PREFERENCE_KEY)
    return JOIN_PREFERENCES.includes(value) ? value : "ask"
  } catch {
    return "ask"
  }
}

export function setJoinPreference(preference, storage = getDefaultStorage()) {
  if (!JOIN_PREFERENCES.includes(preference) || !storage) return false
  try {
    if (preference === "ask") storage.removeItem(JOIN_PREFERENCE_KEY)
    else storage.setItem(JOIN_PREFERENCE_KEY, preference)
    return true
  } catch {
    return false
  }
}

export function detectDesktopPlatform(
  userAgent = getDefaultUserAgent(),
  architecture = "",
) {
  const ua = String(userAgent || "")
  if (!ua) return null
  if (isMobileDevice(ua)) return null

  if (/Macintosh|Mac OS X|Mac_PowerPC/i.test(ua)) {
    return /x86_64|x64|intel|amd64/i.test(String(architecture || ""))
      ? "mac-x64"
      : "mac-arm64"
  }

  if (/Windows|Win32|Win64/i.test(ua)) return "win-x64"

  return null
}

export function getProtocolScheme(releaseInfo) {
  const fromApi = releaseInfo?.protocolScheme
  if (typeof fromApi === "string" && fromApi.trim()) return fromApi.trim()

  const fromEnv = import.meta.env?.VITE_DESKTOP_PROTOCOL
  if (typeof fromEnv === "string" && fromEnv.trim()) return fromEnv.trim()

  return "catspeak"
}

export function buildDesktopDeepLink({ scheme, roomId, lang, code } = {}) {
  const resolvedScheme =
    typeof scheme === "string" && scheme.trim()
      ? scheme.trim()
      : getProtocolScheme()

  const params = new URLSearchParams()
  if (roomId != null && roomId !== "") params.set("roomId", String(roomId))
  if (lang) params.set("lang", String(lang))
  if (code) params.set("code", String(code))

  const query = params.toString()
  return `${resolvedScheme}://join${query ? `?${query}` : ""}`
}
