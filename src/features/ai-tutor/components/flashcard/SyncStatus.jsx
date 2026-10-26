import React, { useEffect, useState } from "react"
import { CloudOff, RefreshCw } from "lucide-react"

/**
 * E-FC-002: banner khi mất mạng giữa phiên ôn. role="alert" để trình đọc màn hình
 * đọc ngay khi mất mạng.
 */
export const OfflineBanner = ({ isOnline, message }) => {
  if (isOnline) return null
  return (
    <div
      role="alert"
      data-testid="flashcard-offline-banner"
      className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
    >
      <CloudOff className="w-4 h-4 shrink-0" />
      <span>
        {message ||
          "Đang offline - bạn vẫn ôn được các thẻ đã tải, kết quả sẽ đồng bộ khi có mạng lại."}
      </span>
    </div>
  )
}

/**
 * E-FC-006: toast nhỏ khi đã có mạng và còn kết quả ôn đang gửi lên máy chủ (vừa có
 * mạng lại, hoặc gửi lỗi đang thử lại ngầm).
 */
export const SyncToast = ({ isOnline, isRetrying, pendingCount }) => {
  // Lượt chấm bình thường lên server trong vài trăm mili giây: chỉ hiện toast khi
  // đang thử lại, hoặc còn kết quả chờ quá 1,5 giây, để toast không nháy mỗi thẻ.
  const [slow, setSlow] = useState(false)
  const waiting = isOnline && pendingCount > 0
  useEffect(() => {
    if (!waiting) return undefined
    const t = setTimeout(() => setSlow(true), 1500)
    return () => {
      clearTimeout(t)
      setSlow(false)
    }
  }, [waiting])
  if (!waiting || !(isRetrying || slow)) return null
  return (
    <div
      role="status"
      data-testid="flashcard-sync-toast"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-sm text-white shadow-lg"
    >
      <RefreshCw className="w-4 h-4 animate-spin" />
      <span>Đang đồng bộ kết quả ôn tập...</span>
    </div>
  )
}
