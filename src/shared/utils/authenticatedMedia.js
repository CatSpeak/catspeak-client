import { useEffect, useState } from "react"
import { store } from "@/store"
import { ensureRefresh } from "@/store/api/baseApi"

const CORE_API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "")
const INSTRUCTOR_API_BASE = (
  import.meta.env.VITE_INSTRUCTOR_API_BASE_URL || "/api"
).replace(/\/+$/, "")
const SOCIAL_API_BASE = (
  import.meta.env.VITE_SOCIAL_API_BASE_URL || "/api/social"
).replace(/\/+$/, "")
const AI_API_BASE = (import.meta.env.VITE_AI_API_BASE_URL || "/api/ai").replace(
  /\/+$/,
  "",
)

// CS-07 (Track 4 contract): Post media gateway `/api/Post/{postId}/media/{mediaId}`
// must be fetched with the bearer token so Private/FriendsOnly posts resolve.
const PROTECTED_PATH_PREFIXES = [
  "/api/media/",
  "/media/",
  "/api/social/chat/",
  "/api/chat/",
  "/api/instructor-profile/media/",
  "/api/payments/reports/",
  "/api/post/",
]

// CS-15: Never attach `Authorization: Bearer` to an absolute URL that is not a
// first-party API origin. The allowlist is built from the configured VITE_*
// API base URLs plus the production API origins and the current origin.
const STATIC_TRUSTED_API_ORIGINS = [
  "https://api.catspeak.com.vn",
  "https://social-api.catspeak.com.vn",
  "https://instructor-api.catspeak.com.vn",
  "https://ai.catspeak.com.vn",
]

function isLocalHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
}

function buildTrustedApiOrigins() {
  const origins = new Set(STATIC_TRUSTED_API_ORIGINS)
  if (typeof window !== "undefined" && window.location?.origin) {
    origins.add(window.location.origin)
  }
  for (const base of [CORE_API_BASE, INSTRUCTOR_API_BASE, SOCIAL_API_BASE, AI_API_BASE]) {
    if (!base || base.startsWith("/") || base.startsWith("//")) continue
    try {
      origins.add(new URL(base).origin)
    } catch {
      /* ignore malformed env values */
    }
  }
  return origins
}

const TRUSTED_API_ORIGINS = buildTrustedApiOrigins()

/**
 * CS-15: true only for same-stack relative paths or an absolute URL whose
 * origin exactly matches a trusted API origin.
 */
export function isTrustedApiOrigin(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return false
  const trimmed = rawUrl.trim()
  if (!trimmed) return false
  if (trimmed.startsWith("//")) return false
  if (trimmed.startsWith("/")) return true

  let parsed
  try {
    parsed = new URL(trimmed)
  } catch {
    return false
  }

  const isAllowedLocalHttp =
    import.meta.env.DEV &&
    parsed.protocol === "http:" &&
    isLocalHostname(parsed.hostname)
  if (parsed.protocol !== "https:" && !isAllowedLocalHttp) return false
  return TRUSTED_API_ORIGINS.has(parsed.origin)
}

function matchesProtectedPath(path) {
  const normalized = String(path || "").toLowerCase()
  return PROTECTED_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix))
}

function extractPath(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return ""
  const trimmed = rawUrl.trim()
  if (!trimmed) return ""
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed)
      return parsed.pathname + parsed.search
    } catch {
      return ""
    }
  }
  return trimmed
}

export function isProtectedMediaUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return false
  const trimmed = rawUrl.trim()
  if (!trimmed || trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return false
  }
  if (trimmed.startsWith("//")) return false
  if (trimmed.startsWith("/")) {
    return matchesProtectedPath(trimmed) || trimmed.startsWith("/api/")
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // Only first-party API origins are considered protected media sources.
    if (!isTrustedApiOrigin(trimmed)) return false
    return matchesProtectedPath(extractPath(trimmed))
  }
  return false
}

export function resolveProtectedMediaFetchUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return rawUrl
  const trimmed = rawUrl.trim()

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }

  if (trimmed.startsWith("/media/")) {
    return `${INSTRUCTOR_API_BASE}${trimmed}`
  }
  if (trimmed.startsWith("/api/media/")) {
    const subPath = trimmed.slice("/api".length)
    return `${INSTRUCTOR_API_BASE}${subPath}`
  }
  if (trimmed.startsWith("/api/social/")) {
    const subPath = trimmed.slice("/api/social".length)
    return `${SOCIAL_API_BASE}${subPath}`
  }
  if (trimmed.startsWith("/api/chat/")) {
    const subPath = trimmed.slice("/api".length)
    return `${SOCIAL_API_BASE}${subPath}`
  }
  // CS-07: Post media gateway lives on the Social API.
  if (trimmed.toLowerCase().startsWith("/api/post/")) {
    const subPath = trimmed.slice("/api".length)
    return `${SOCIAL_API_BASE}${subPath}`
  }
  if (trimmed.startsWith("/api/")) {
    const subPath = trimmed.slice("/api".length)
    return `${CORE_API_BASE}${subPath}`
  }
  return trimmed
}

async function getAccessToken() {
  const reduxToken = store.getState?.()?.auth?.token
  if (reduxToken) return reduxToken
  try {
    return typeof localStorage !== "undefined" ? localStorage.getItem("token") : null
  } catch {
    return null
  }
}

export async function fetchAuthenticatedBlob(rawUrl, { signal } = {}) {
  const isProtected = isProtectedMediaUrl(rawUrl)
  const targetUrl = resolveProtectedMediaFetchUrl(rawUrl)
  // CS-15: attach the bearer token ONLY when the resolved target is a trusted
  // first-party API origin (or a same-stack relative path).
  const canAttachAuth = isProtected && isTrustedApiOrigin(targetUrl)

  const performFetch = async () => {
    const headers = {}
    if (canAttachAuth) {
      const token = await getAccessToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }
    return fetch(targetUrl, {
      headers,
      signal,
      credentials: canAttachAuth ? "same-origin" : "omit",
    })
  }

  const initialToken = canAttachAuth ? await getAccessToken() : null
  let response = await performFetch()

  if (canAttachAuth && response.status === 401 && initialToken) {
    const refreshed = await ensureRefresh(
      { getState: store.getState, dispatch: store.dispatch },
      {},
      "media-401",
      initialToken,
    )
    if (refreshed) {
      response = await performFetch()
    }
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch media (${response.status})`)
  }

  return response.blob()
}

export async function downloadAuthenticatedFile(rawUrl, fileName = "download") {
  if (!rawUrl) return
  const blob = await fetchAuthenticatedBlob(rawUrl)
  const objectUrl = window.URL.createObjectURL(blob)
  try {
    const link = document.createElement("a")
    link.href = objectUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    window.URL.revokeObjectURL(objectUrl)
  }
}

export async function openAuthenticatedMediaInNewTab(rawUrl) {
  if (!rawUrl) return
  if (!isProtectedMediaUrl(rawUrl)) {
    window.open(rawUrl, "_blank", "noopener,noreferrer")
    return
  }
  const blob = await fetchAuthenticatedBlob(rawUrl)
  const objectUrl = window.URL.createObjectURL(blob)
  window.open(objectUrl, "_blank", "noopener,noreferrer")
  setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl)
  }, 60_000)
}

export function useAuthenticatedMediaUrl(rawUrl) {
  const needsAuthFetch = isProtectedMediaUrl(rawUrl)
  const [resolved, setResolved] = useState({
    source: null,
    url: null,
    error: null,
  })

  useEffect(() => {
    if (!rawUrl || !needsAuthFetch) {
      return undefined
    }

    const controller = new AbortController()
    let objectUrl = null

    fetchAuthenticatedBlob(rawUrl, { signal: controller.signal })
      .then((blob) => {
        if (controller.signal.aborted) return
        objectUrl = window.URL.createObjectURL(blob)
        setResolved({ source: rawUrl, url: objectUrl, error: null })
      })
      .catch((err) => {
        if (controller.signal.aborted || err?.name === "AbortError") return
        setResolved({ source: rawUrl, url: null, error: err })
      })

    return () => {
      controller.abort()
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl)
      }
    }
  }, [rawUrl, needsAuthFetch])

  if (!rawUrl || !needsAuthFetch) {
    return {
      source: rawUrl,
      url: rawUrl || null,
      isLoading: false,
      error: null,
    }
  }

  const isCurrent = resolved.source === rawUrl
  return {
    source: rawUrl,
    url: isCurrent ? resolved.url : null,
    isLoading: !isCurrent,
    error: isCurrent ? resolved.error : null,
  }
}
