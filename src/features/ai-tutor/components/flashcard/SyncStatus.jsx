import React from "react"
import { CloudOff, RefreshCw } from "lucide-react"

/**
 * E-FC-002: banner khi mất mạng giữa phiên ôn.
 * E-FC-006: toast nhỏ khi đã có mạng nhưng kết quả vẫn đang gửi lại ngầm.
 */
export const OfflineBanner = ({ isOnline }) => {
  if (isOnline) return null
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
    >
      <CloudOff className="w-4 h-4 shrink-0" />
      <span>Đang offline - kết quả sẽ đồng bộ khi có mạng. Bạn vẫn ôn tiếp được các thẻ đã tải.</span>
    </div>
  )
}

export const SyncToast = ({ isOnline, isRetrying, pendingCount }) => {
  if (!isOnline || !isRetrying || pendingCount === 0) return null
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-sm text-white shadow-lg"
    >
      <RefreshCw className="w-4 h-4 animate-spin" />
      <span>Đang đồng bộ kết quả ôn tập...</span>
    </div>
  )
}
