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
    const code =
      body?.code ||
      body?.detail?.code ||
      body?.error ||
      (status === 401
        ? "UNAUTHORIZED"
        : status === 403
        ? "FORBIDDEN"
        : status === 404
        ? "NOT_FOUND"
        : status === 409
        ? "CONFLICT"
        : "SPEAKING_API_ERROR")

    const message =
      body?.message ||
      body?.detail?.message ||
      (typeof body?.detail === "string" && body.detail ? body.detail : null) ||
      (typeof body === "string" && body.length > 0 ? body : null) ||
      (status === 401
        ? "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
        : status === 403
        ? "Bạn không có quyền thực hiện thao tác này hoặc đã vượt quá hạn mức."
        : status === 404
        ? "Không tìm thấy dữ liệu yêu cầu trên máy chủ."
        : status === 409
        ? "Tài khoản đang có một phiên luyện nói đang mở ở thiết bị khác."
        : `Yêu cầu thất bại (${status} ${statusText})`)

    super(message)
    this.name = "SpeakingApiError"
    this.status = status
    this.statusText = statusText
    this.code = code
    this.body = body
    this.details = body?.details || body?.detail?.details || null
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
 * Normalized to always return an array of topics.
 */
export async function fetchSpeakingTopics(hskLevel = null, signal) {
  const query = hskLevel ? `?hsk_level=${encodeURIComponent(hskLevel)}` : ""
  const url = `${BASE}/api/speaking/topics${query}`
  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
    signal,
  })
  const data = await handleResponse(res)
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.topics)) return data.topics
  return []
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
  const data = await handleResponse(res)
  return {
    used_sessions: data.used_sessions ?? 0,
    max_sessions: data.max_sessions ?? 2,
    remaining_sessions: data.remaining_sessions ?? 2,
    quota_date: data.quota_date || "",
    is_premium: Boolean(data.is_premium),
    can_start_session: data.can_start_session ?? true,
    reset_time: data.reset_time || "00:00 hàng ngày",
  }
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
export async function endSpeakingSession(
  sessionId,
  { end_reason = "learner_quit", duration_ms = null } = {}
) {
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
