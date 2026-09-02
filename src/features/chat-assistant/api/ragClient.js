/**
 * Client gọi AI API cho trợ lý chatbot (TASK-AI-08).
 *
 * Không dùng RTK Query như các api khác trong src/store/api vì hai lý do:
 *   1. Endpoint streaming trả server-sent events, RTK Query không mô hình hoá được
 *      một response chảy dần.
 *   2. AI API là một service khác, base URL khác, không dùng chung baseApi.
 *
 * Client gọi THẲNG AI API, không qua gateway catspeak-api. Chốt kiến trúc ngày
 * 24/08 nói phải đi qua gateway; chốt lại ngày 02/09 là gọi thẳng qua biến
 * VITE_AI_API_BASE_URL, và đó là cách chính thức chứ không còn là giải pháp tạm.
 *
 * Hệ quả: mọi request là request chéo tên miền, nên CORS_ALLOWED_ORIGINS bên AI API
 * phải liệt kê đủ tên miền của client. Thiếu một dòng thì Console báo lỗi CORS —
 * rất dễ đọc nhầm thành "API chết".
 */

// Máy dev để trống thì rơi về container local. Staging và production PHẢI đặt biến
// này, ví dụ https://ai-staging-api.catspeak.com.vn/ai — có đuôi /ai vì gateway
// chuyển tiếp theo tiền tố đó.
const BASE =
  import.meta.env.VITE_AI_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8080"

/**
 * Token dung cho MOI request tren AI API.
 *
 * Widget phai gac bang DUNG ham nay, dung doc rieng token trong Redux: hai cho lech
 * nhau thi widget hien ra, o chat chay (vi request doc localStorage) ma goi y voi
 * quota lai im lang khong goi (vi effect gac bang Redux). Do la loi ngay 30/08.
 */
export function storedToken() {
  return localStorage.getItem("token")
}

function authHeaders() {
  const token = storedToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Tier và level: JWT do catspeak-api phát KHÔNG chứa hai trường này, nên client
 *  phải gửi kèm. Server chỉ lấy account_id từ token, không lấy từ body. */
export function callerFrom(user, language = "vi") {
  return {
    tier: user?.tier || user?.Tier || "Free",
    level: user?.level || user?.Level || null,
    language,
    language_community:
      user?.languageCommunity || user?.LanguageCommunity || null,
  }
}

/** Lỗi có mang theo mã trạng thái, để phía trên phân biệt được 401 với 500. */
export class RagHttpError extends Error {
  constructor(status, statusText, body) {
    super(`${status} ${statusText} ${body}`.trim())
    this.name = "RagHttpError"
    this.status = status
    this.body = body
  }
}

async function json(res) {
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new RagHttpError(res.status, res.statusText, body)
  }
  return res.json()
}

export async function askQuestion({ question, history, caller, signal }) {
  const res = await fetch(`${BASE}/v1/rag/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ question, history, caller }),
    signal,
  })
  return json(res)
}

/**
 * Bản streaming. Gọi onDelta cho từng mảnh, trả về payload của sự kiện `done`.
 *
 * Payload `done` LÀ bản chính thức của câu trả lời, không phải các mảnh delta ghép
 * lại: hậu kiểm trích dẫn và kiểm duyệt đầu ra chạy sau khi đã phát hết và có thể
 * đổi nội dung.
 */
export async function askQuestionStream({
  question,
  history,
  caller,
  onMeta,
  onDelta,
  signal,
}) {
  const res = await fetch(`${BASE}/v1/rag/query/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ question, history, caller }),
    signal,
  })
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "")
    throw new RagHttpError(res.status, res.statusText, body)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let done = null

  for (;;) {
    const { value, done: finished } = await reader.read()
    if (finished) break
    buffer += decoder.decode(value, { stream: true })

    // Mỗi sự kiện SSE kết thúc bằng một dòng trống.
    let sep
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)

      let event = "message"
      const dataLines = []
      for (const line of raw.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim()
        else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim())
      }
      if (!dataLines.length) continue

      let payload
      try {
        payload = JSON.parse(dataLines.join("\n"))
      } catch {
        continue
      }
      if (event === "meta") onMeta?.(payload)
      else if (event === "delta") onDelta?.(payload.text || "")
      else if (event === "done") done = payload
    }
  }

  if (!done) throw new Error("Luồng kết thúc mà không có sự kiện done")
  return done
}

export async function fetchQuota(tier = "Free") {
  const res = await fetch(
    `${BASE}/v1/rag/quota?tier=${encodeURIComponent(tier)}`,
    { headers: authHeaders() },
  )
  return json(res)
}

export async function fetchSuggestions() {
  const res = await fetch(`${BASE}/v1/rag/suggestions`, {
    headers: authHeaders(),
  })
  return json(res)
}

/** Nguyên văn đoạn trích, cho drawer khi chunk không có source_url. */
export async function fetchSource(chunkId) {
  const res = await fetch(
    `${BASE}/v1/rag/sources/${encodeURIComponent(chunkId)}`,
    { headers: authHeaders() },
  )
  return json(res)
}

/**
 * value: 1 hữu ích, -1 không hữu ích, 0 gỡ đánh giá.
 *
 * `reason` và `note` chỉ có nghĩa khi value = -1, và server bỏ qua chúng ở các giá
 * trị khác. Gọi lại lần hai với cùng queryLogId là GHI ĐÈ chứ không cộng dồn: bảng
 * khoá theo id dòng nhật ký, nên gửi lý do sau khi đã bấm không làm số liệu đếm hai
 * lần.
 */
export async function sendFeedback(queryLogId, value, { reason, note } = {}) {
  const res = await fetch(`${BASE}/v1/rag/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      query_log_id: queryLogId,
      value,
      ...(reason ? { reason } : {}),
      ...(note ? { note } : {}),
    }),
  })
  return json(res)
}
