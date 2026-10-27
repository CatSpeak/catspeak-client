import React from "react"
import { CloudOff, RefreshCw } from "lucide-react"

/** Khung xương khi đang tải (CHK-109): không để trắng màn. */
export const FlashcardSkeleton = ({ rows = 4 }) => (
  <div className="flex flex-col gap-4" aria-busy="true" aria-label="Đang tải sổ từ vựng" data-testid="flashcard-skeleton">
    <div className="h-40 animate-pulse rounded-2xl bg-rose-100/60" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
    ))}
  </div>
)

/**
 * Lỗi tải dữ liệu, nói rõ lý do và cho thử lại (CHK-098). Mất mạng thì nói là mất
 * mạng, không hiện câu lỗi chung chung.
 */
export const FlashcardLoadError = ({ offline, onRetry, what = "sổ từ vựng" }) => (
  <div
    role="alert"
    className="flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white px-6 py-12 text-center shadow-sm"
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
      {offline ? <CloudOff className="h-6 w-6" /> : <RefreshCw className="h-6 w-6" />}
    </div>
    <p className="text-base font-bold text-slate-900">
      {offline ? "Bạn đang offline" : `Chưa tải được ${what}`}
    </p>
    <p className="max-w-sm text-sm text-slate-500">
      {offline
        ? `Không tải được ${what} vì mất kết nối mạng. Kết nối lại rồi bấm thử lại nhé.`
        : "Có lỗi khi kết nối máy chủ. Bạn thử lại sau ít phút."}
    </p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 h-10 rounded-full bg-[#990011] px-6 text-sm font-semibold text-white hover:brightness-95"
      >
        Thử lại
      </button>
    )}
  </div>
)
