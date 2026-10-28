/**
 * Đánh dấu màn hiện tại tự xử lý được khi mất mạng (ví dụ Sổ tay từ vựng: ôn thẻ
 * offline rồi đồng bộ sau, NFR-FC-002). Khi cờ bật và trình duyệt đang offline,
 * ServerDownScreen không phủ kín màn hình: lỗi là do mạng của học viên, không phải
 * máy chủ, và màn đó đã có banner offline riêng.
 */
let active = 0
const listeners = new Set()
const emit = () => listeners.forEach((fn) => fn())

export const enterOfflineCapableRoute = () => {
  active += 1
  emit()
  return () => {
    active = Math.max(0, active - 1)
    emit()
  }
}

export const isOfflineCapableRoute = () => active > 0

export const subscribeOfflineCapableRoute = (fn) => {
  listeners.add(fn)
  const onNet = () => fn()
  if (typeof window !== "undefined") {
    window.addEventListener("online", onNet)
    window.addEventListener("offline", onNet)
  }
  return () => {
    listeners.delete(fn)
    if (typeof window !== "undefined") {
      window.removeEventListener("online", onNet)
      window.removeEventListener("offline", onNet)
    }
  }
}
