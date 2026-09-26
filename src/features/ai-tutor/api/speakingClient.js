/**
 * Client gọi API cho tính năng AI Speaking Session (TASK-AI-15).
 */

const BASE =
  import.meta.env.VITE_AI_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8080"

export function storedToken() {
  return localStorage.getItem("token")
}

function authHeaders(extra = {}) {
  const token = storedToken()
  const headers = {
    "Content-Type": "application/json",
    ...extra,
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

export class SpeakingApiError extends Error {
  constructor(status, statusText, body) {
    super(`Speaking API Error ${status} ${statusText}: ${typeof body === "object" ? JSON.stringify(body) : body}`.trim())
    this.name = "SpeakingApiError"
    this.status = status
    this.body = body
  }
}

async function handleResponse(res) {
  if (!res.ok) {
    let errorBody
    try {
      errorBody = await res.json()
    } catch {
      errorBody = await res.text().catch(() => "")
    }
    throw new SpeakingApiError(res.status, res.statusText, errorBody)
  }
  return res.json()
}

/**
 * Fetch available speaking topics for an HSK level (1..6)
 */
export async function fetchSpeakingTopics(hskLevel = null, signal) {
  const query = hskLevel ? `?hsk_level=${encodeURIComponent(hskLevel)}` : ""
  const url = `${BASE}/api/speaking/topics${query}`
  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
    signal,
  })
  return handleResponse(res)
}

/**
 * Fetch user daily speaking quota
 */
export async function fetchSpeakingQuota(tier = "standard", signal) {
  const url = `${BASE}/api/speaking/quota?tier=${encodeURIComponent(tier)}`
  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
    signal,
  })
  return handleResponse(res)
}

/**
 * Start or reconnect an interactive Speaking Session
 */
export async function startSpeakingSession({
  topic_id,
  hsk_level = 1,
  voice = "female",
  speed = 1.0,
  tier = "standard",
  accountId = "user_default",
} = {}) {
  const url = `${BASE}/api/speaking/sessions`
  const headers = authHeaders({
    "X-Account-Id": accountId,
    "X-Tier": tier,
  })

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      topic_id,
      hsk_level: Number(hsk_level),
      voice,
      speed: Number(speed),
    }),
  })
  return handleResponse(res)
}

/**
 * Get active session detail and metadata
 */
export async function fetchSpeakingSession(sessionId, signal) {
  const url = `${BASE}/api/speaking/sessions/${encodeURIComponent(sessionId)}`
  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
    signal,
  })
  return handleResponse(res)
}

/**
 * Explicitly end speaking session
 */
export async function endSpeakingSession(sessionId, { end_reason = "learner_quit", duration_ms = null } = {}) {
  const url = `${BASE}/api/speaking/sessions/${encodeURIComponent(sessionId)}/end`
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      end_reason,
      duration_ms,
    }),
  })
  return handleResponse(res)
}

/**
 * Fetch completed pedagogical session report
 */
export async function fetchSpeakingReport(sessionId, signal) {
  const url = `${BASE}/api/speaking/sessions/${encodeURIComponent(sessionId)}/report`
  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
    signal,
  })
  return handleResponse(res)
}
