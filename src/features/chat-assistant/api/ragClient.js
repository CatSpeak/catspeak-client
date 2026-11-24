import { store } from "@/store"
import { ensureRefresh } from "@/store/api/baseApi"
import { parseRetryAfterSeconds } from "@/store/api/utils/rateLimit"

const BASE =
  import.meta.env.VITE_AI_API_BASE_URL?.replace(/\/$/, "") || "/api/ai"

/**
 * Token used for all AI API requests, reading Redux first with localStorage fallback
 * so refreshed tokens take effect immediately across widget and quota checks.
 */
export function storedToken() {
  const reduxToken = store.getState?.()?.auth?.token
  if (reduxToken) return reduxToken
  try {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem("token")
      : null
  } catch {
    return null
  }
}

const GUEST_TOKEN_KEY = "ai_guest_token"
const GUEST_ID_KEY = "ai_guest_id"

const AUTH_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "/api"

export function guestToken() {
  try {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem(GUEST_TOKEN_KEY)
      : null
  } catch {
    return null
  }
}

export function guestId() {
  try {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem(GUEST_ID_KEY)
      : null
  } catch {
    return null
  }
}

export function clearGuestToken() {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(GUEST_TOKEN_KEY)
      localStorage.removeItem(GUEST_ID_KEY)
    }
  } catch {
    /* ignore storage errors */
  }
}

let guestPending = null

export async function ensureGuestToken({ force = false } = {}) {
  if (!force) {
    const co = guestToken()
    if (co) return co
  }
  if (guestPending) return guestPending

  guestPending = (async () => {
    try {
      const res = await fetch(`${AUTH_BASE}/Auth/guest-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new RagHttpError(
          res.status,
          res.statusText,
          body,
          parseRetryAfterSeconds({ headers: res.headers }),
        )
      }
      const data = await res.json()
      const token = data.token || data.Token
      if (!token) throw new Error("guest-token: missing token field")
      localStorage.setItem(GUEST_TOKEN_KEY, token)
      const id = data.guestId || data.GuestId
      if (id) localStorage.setItem(GUEST_ID_KEY, id)
      return token
    } finally {
      guestPending = null
    }
  })()

  return guestPending
}

function activeToken() {
  return storedToken() || guestToken()
}

function authHeaders() {
  const token = activeToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function tryRefreshRagAuth(usedUserToken) {
  if (usedUserToken) {
    const api = {
      getState: store.getState,
      dispatch: store.dispatch,
    }
    return ensureRefresh(api, {}, "rag-401", usedUserToken)
  }

  if (guestToken()) {
    try {
      await ensureGuestToken({ force: true })
      return true
    } catch {
      return false
    }
  }

  return false
}

async function fetchWithAuthRetry(url, options = {}) {
  const send = () =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...authHeaders(),
      },
    })

  const initialUserToken = storedToken()
  let res = await send()

  if (res.status === 401) {
    const refreshed = await tryRefreshRagAuth(initialUserToken)
    if (refreshed) {
      res = await send()
    }
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    const retryAfterSeconds =
      res.status === 429 ? parseRetryAfterSeconds({ headers: res.headers }) : null
    throw new RagHttpError(res.status, res.statusText, body, retryAfterSeconds)
  }

  return res
}

export function callerFrom(user, language = "vi") {
  if (!user) {
    return { tier: "Guest", level: null, language, language_community: null }
  }
  return {
    tier: user?.tier || user?.Tier || "Free",
    level: user?.level || user?.Level || null,
    language,
    language_community:
      user?.languageCommunity || user?.LanguageCommunity || null,
  }
}

export class RagHttpError extends Error {
  constructor(status, statusText, body, retryAfterSeconds = null) {
    super(`${status} ${statusText} ${body}`.trim())
    this.name = "RagHttpError"
    this.status = status
    this.body = body
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export async function askQuestion({ question, history, caller, signal }) {
  const res = await fetchWithAuthRetry(`${BASE}/v1/rag/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history, caller }),
    signal,
  })
  return res.json()
}

function processSseEventBlock(raw, callbacks) {
  let event = "message"
  const dataLines = []
  for (const line of raw.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim()
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim())
  }
  if (!dataLines.length) return null

  let payload
  try {
    payload = JSON.parse(dataLines.join("\n"))
  } catch {
    return null
  }
  if (event === "meta") callbacks.onMeta?.(payload)
  else if (event === "delta") callbacks.onDelta?.(payload.text || "")
  else if (event === "done") return payload
  return null
}

export async function askQuestionStream({
  question,
  history,
  caller,
  onMeta,
  onDelta,
  signal,
}) {
  const res = await fetchWithAuthRetry(`${BASE}/v1/rag/query/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history, caller }),
    signal,
  })
  if (!res.body) {
    throw new RagHttpError(res.status, res.statusText, "")
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let done = null

  const drainBuffer = (flushFinal = false) => {
    buffer = buffer.replace(/\r\n/g, "\n")
    let sep
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)
      const donePayload = processSseEventBlock(raw, { onMeta, onDelta })
      if (donePayload !== null) done = donePayload
    }
    if (flushFinal && buffer.trim()) {
      const donePayload = processSseEventBlock(buffer, { onMeta, onDelta })
      if (donePayload !== null) done = donePayload
      buffer = ""
    }
  }

  for (;;) {
    const { value, done: finished } = await reader.read()
    if (finished) {
      buffer += decoder.decode()
      drainBuffer(true)
      break
    }
    buffer += decoder.decode(value, { stream: true })
    drainBuffer(false)
  }

  if (!done) throw new Error("Stream ended without done event")
  return done
}

export async function fetchQuota(tier = "Free") {
  const res = await fetchWithAuthRetry(
    `${BASE}/v1/rag/quota?tier=${encodeURIComponent(tier)}`,
  )
  return res.json()
}

const KHOA_GOI_Y = "catspeak.chat.suggestions.v1"
const HAN_GOI_Y = 7 * 24 * 60 * 60 * 1000

export function suggestionsDaLuu() {
  try {
    const raw = localStorage.getItem(KHOA_GOI_Y)
    if (!raw) return null
    const { items, at } = JSON.parse(raw)
    if (!Array.isArray(items) || !items.length) return null
    if (Date.now() - at > HAN_GOI_Y) return null
    return items
  } catch {
    return null
  }
}

function luuSuggestions(items) {
  try {
    if (Array.isArray(items) && items.length) {
      localStorage.setItem(KHOA_GOI_Y, JSON.stringify({ items, at: Date.now() }))
    }
  } catch {
    /* ignore storage errors */
  }
}

export async function fetchSuggestions() {
  const res = await fetchWithAuthRetry(`${BASE}/v1/rag/suggestions`)
  const data = await res.json()
  luuSuggestions(data.items)
  return data
}

export async function fetchSource(chunkId) {
  const res = await fetchWithAuthRetry(
    `${BASE}/v1/rag/sources/${encodeURIComponent(chunkId)}`,
  )
  return res.json()
}

export async function sendFeedback(queryLogId, value, { reason, note } = {}) {
  const res = await fetchWithAuthRetry(`${BASE}/v1/rag/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query_log_id: queryLogId,
      value,
      ...(reason ? { reason } : {}),
      ...(note ? { note } : {}),
    }),
  })
  return res.json()
}
