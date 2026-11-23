/**
 * Pure helpers for the desktop screen picker. They normalize whatever the
 * preload bridge returns so the React layer never has to trust its shape.
 */

export const MAC_SCREEN_PERMISSION_URL =
  "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture"

const sourceType = (raw) => {
  if (!raw || typeof raw.id !== "string") return null
  const id = raw.id.trim()
  if (id.startsWith("screen:")) return "screen"
  if (id.startsWith("window:")) return "window"
  return raw.type === "screen" || raw.type === "window" ? raw.type : null
}

const asDataUrl = (value) => (typeof value === "string" ? value : "")

export function normalizeScreenSource(raw) {
  if (!raw || typeof raw.id !== "string" || !raw.id.trim()) return null

  const type = sourceType(raw)
  if (!type) return null

  const displayId =
    type === "screen" && raw.displayId !== null && raw.displayId !== undefined
      ? String(raw.displayId).trim()
      : ""

  return {
    id: raw.id.trim(),
    name: typeof raw.name === "string" ? raw.name.trim() : "",
    type,
    displayId,
    thumbnailDataUrl: asDataUrl(raw.thumbnailDataUrl),
    appIconDataUrl: type === "window" ? asDataUrl(raw.appIconDataUrl) : "",
    isFullDisplay: type === "screen" && displayId !== "",
  }
}

export function normalizeScreenSources(rawSources) {
  if (!Array.isArray(rawSources)) return []
  return rawSources.map(normalizeScreenSource).filter(Boolean)
}

export function isFullDisplaySource(source) {
  return Boolean(
    source &&
      source.type === "screen" &&
      typeof source.displayId === "string" &&
      source.displayId,
  )
}

export function normalizeScreenPermission(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      platform: "",
      status: "unknown",
      granted: true,
      needsPermission: false,
      canOpenSettings: false,
      settingsUrl: "",
    }
  }

  const platform = typeof raw.platform === "string" ? raw.platform : ""

  if (platform !== "darwin") {
    return {
      platform,
      status: "granted",
      granted: true,
      needsPermission: false,
      canOpenSettings: false,
      settingsUrl: "",
    }
  }

  const status = typeof raw.status === "string" && raw.status ? raw.status : "unknown"
  const granted =
    typeof raw.granted === "boolean" ? raw.granted : status === "granted"

  return {
    platform,
    status,
    granted,
    needsPermission: !granted,
    canOpenSettings: raw.canOpenSettings !== false,
    settingsUrl:
      typeof raw.settingsUrl === "string" && raw.settingsUrl
        ? raw.settingsUrl
        : MAC_SCREEN_PERMISSION_URL,
  }
}

export function isMacScreenPermissionRequired(permission) {
  return Boolean(
    permission &&
      permission.platform === "darwin" &&
      permission.needsPermission === true,
  )
}

export function groupScreenSources(sources) {
  const list = Array.isArray(sources) ? sources.filter(Boolean) : []
  return {
    screens: list.filter((source) => source.type === "screen"),
    windows: list.filter((source) => source.type === "window"),
  }
}

export function findScreenSource(sources, sourceId) {
  if (!Array.isArray(sources) || !sourceId) return null
  return sources.find((source) => source.id === sourceId) || null
}

export function screenShareSelectionMetadata(source) {
  if (!source || !source.id) return null

  return {
    displayId:
      typeof source.displayId === "string" && source.displayId
        ? source.displayId
        : null,
    sourceId: source.id,
    isFullDisplay: isFullDisplaySource(source),
  }
}

export function toSelectSourcePayload(source, { audio = true } = {}) {
  if (!source || typeof source.id !== "string" || !source.id) return null

  return { sourceId: source.id, audio: audio === true }
}

/**
 * The desktop display-media handler deliberately omits audio on macOS;
 * requesting it there can reject the whole screen share.
 */
export function shouldRequestDesktopShareAudio(platform) {
  return platform !== "darwin"
}

export function normalizeScreenSourcesResponse(result) {
  if (Array.isArray(result)) {
    return {
      ok: true,
      sources: normalizeScreenSources(result),
      permission: null,
      error: null,
    }
  }

  if (!result || typeof result !== "object") {
    return {
      ok: false,
      sources: [],
      permission: null,
      error: "SCREEN_SOURCES_FAILED",
    }
  }

  if (result.ok === false) {
    return {
      ok: false,
      sources: [],
      permission: null,
      error:
        typeof result.error === "string" && result.error
          ? result.error
          : "SCREEN_SOURCES_FAILED",
    }
  }

  return {
    ok: true,
    sources: normalizeScreenSources(result.sources),
    permission: result.permission
      ? normalizeScreenPermission(result.permission)
      : null,
    error: null,
  }
}

/**
 * Loads sources and permission from the desktop bridge. Never throws: the hook
 * renders an error state instead of leaving the picker spinning.
 */
export async function loadDesktopScreenSources(bridge) {
  if (!bridge || typeof bridge.getScreenSources !== "function") {
    return {
      ok: false,
      sources: [],
      permission: null,
      error: "BRIDGE_UNAVAILABLE",
    }
  }

  let raw
  try {
    raw = await bridge.getScreenSources()
  } catch {
    return {
      ok: false,
      sources: [],
      permission: null,
      error: "SCREEN_SOURCES_FAILED",
    }
  }

  const normalized = normalizeScreenSourcesResponse(raw)
  if (!normalized.ok) return normalized

  if (!normalized.permission && typeof bridge.getScreenPermission === "function") {
    try {
      const response = await bridge.getScreenPermission()
      const permission = response?.permission ?? response
      if (permission) {
        normalized.permission = normalizeScreenPermission(permission)
      }
    } catch {
      // Sources are still usable; the picker simply omits the permission panel.
    }
  }

  return normalized
}
