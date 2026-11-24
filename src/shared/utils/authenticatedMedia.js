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

const PROTECTED_PATH_PREFIXES = [
  "/api/media/",
  "/media/",
  "/api/social/chat/",
  "/api/chat/",
  "/api/instructor-profile/media/",
  "/api/payments/reports/",
]

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
  if (trimmed.startsWith("/")) {
    return PROTECTED_PATH_PREFIXES.some((prefix) => trimmed.startsWith(prefix)) ||
      trimmed.startsWith("/api/")
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const path = extractPath(trimmed)
    return PROTECTED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))
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

  const performFetch = async () => {
    const headers = {}
    if (isProtected) {
      const token = await getAccessToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }
    return fetch(targetUrl, {
      headers,
      signal,
      credentials: isProtected ? "same-origin" : "omit",
    })
  }

  const initialToken = isProtected ? await getAccessToken() : null
  let response = await performFetch()

  if (isProtected && response.status === 401 && initialToken) {
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
