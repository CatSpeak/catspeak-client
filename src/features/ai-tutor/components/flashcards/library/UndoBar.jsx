import React, { useEffect } from "react"
import { RotateCcw, X } from "lucide-react"

/**
 * Thanh "Hoàn tác" sau khi xoá thẻ (FR-FC-018, CHK-134). Tự ẩn sau `duration` ms.
 */
const UndoBar = ({ message, onUndo, onClose, duration = 6000 }) => {
  useEffect(() => {
    if (!message) return undefined
    const t = setTimeout(() => onClose?.(), duration)
    return () => clearTimeout(t)
  }, [message, duration, onClose])

  if (!message) return null
  return (
    <div
      role="status"
      data-testid="flashcard-undo-bar"
      className="fixed bottom-6 left-1/2 z-[1200] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onUndo}
        className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-bold hover:bg-white/25"
      >
        <RotateCcw className="h-4 w-4" />
        Hoàn tác
      </button>
      <button type="button" onClick={onClose} aria-label="Đóng" className="text-white/70 hover:text-white">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default UndoBar
