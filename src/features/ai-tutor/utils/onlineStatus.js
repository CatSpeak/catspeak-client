/**
 * Trạng thái mạng dùng chung cho các màn flashcard (E-FC-002, CHK-063, CHK-098..100).
 *
 * Chỉ dựa vào `navigator.onLine` thì không đủ: trình duyệt có thể vẫn báo online khi
 * mạng thật đã rớt (wifi còn kết nối nhưng không ra Internet, hoặc trình giả lập mạng
 * chỉ chặn request). Vì vậy còn hai tín hiệu nữa:
 *
 *   reportNetworkError()   một request gọi API thất bại vì không tới được máy chủ
 *   reportNetworkOk()      một request vừa thành công
 *
 * Khi đang ở trạng thái offline, cứ vài giây thử một request nhẹ (HEAD trang hiện tại)
 * để phát hiện có mạng lại kể cả khi trình duyệt không bắn sự kiện "online".
 */

const PROBE_MS = 4000

let online = typeof navigator === "undefined" ? true : navigator.onLine !== false
const listeners = new Set()
let probeTimer = null
let started = false

const emit = () => listeners.forEach((fn) => fn(online))

const stopProbe = () => {
  if (probeTimer) {
    clearInterval(probeTimer)
    probeTimer = null
  }
}

const probe = async () => {
  if (typeof fetch === "undefined" || typeof window === "undefined") return
  if (typeof navigator !== "undefined" && navigator.onLine === false) return
  try {
    const res = await fetch(`${window.location.origin}/favicon-48x48.png?probe=${Date.now()}`, {
      method: "HEAD",
      cache: "no-store",
    })
    if (res) setOnline(true)
  } catch {
    // vẫn mất mạng
  }
}

const startProbe = () => {
  if (probeTimer || typeof window === "undefined") return
  probeTimer = setInterval(probe, PROBE_MS)
}

export function setOnline(value) {
  const next = Boolean(value)
  if (next === online) return
  online = next
  if (online) stopProbe()
  else startProbe()
  emit()
}

const ensureStarted = () => {
  if (started || typeof window === "undefined") return
  started = true
  window.addEventListener("online", () => setOnline(true))
  window.addEventListener("offline", () => setOnline(false))
  if (!online) startProbe()
}

export const isOnlineNow = () => online

export const subscribeOnline = (fn) => {
  ensureStarted()
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const reportNetworkError = () => setOnline(false)
export const reportNetworkOk = () => setOnline(true)

/** Lỗi kiểu RTK Query có phải do mất mạng không. */
export const isNetworkFailure = (error) => {
  const status = error?.status ?? error?.originalStatus
  return status === "FETCH_ERROR" || status === "TIMEOUT_ERROR"
}

/** Chỉ dùng trong test. */
export const __resetOnlineStatus = (value = true) => {
  stopProbe()
  online = value
  listeners.clear()
}
