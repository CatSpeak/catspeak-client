import React, { useEffect, useRef, useState } from "react"
import { Brain, CheckCircle2, RotateCcw, Sparkles, TrendingUp } from "lucide-react"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import { useFinishFlashcardSessionMutation } from "../../api/flashcardReviewApi"
import useFlashcardSync from "../../hooks/useFlashcardSync"
import { localSummary, resultLines } from "../../utils/flashcardReview"
import { OfflineBanner, SyncToast } from "./SyncStatus"

const TONE = {
  main: { icon: CheckCircle2, cls: "text-slate-900" },
  good: { icon: TrendingUp, cls: "text-emerald-700" },
  warn: { icon: RotateCcw, cls: "text-amber-700" },
  celebrate: { icon: Sparkles, cls: "text-[#990011]" },
}

/**
 * fc03: kết quả phiên ôn, viết bằng ngôn ngữ người học (không nhắc "hộp").
 *
 * Chỉ gọi /finish khi mọi kết quả của phiên đã lên server, để số liệu tính đủ.
 * Trong lúc chờ (offline, đang gửi lại) thì hiện tổng kết tạm từ máy học viên.
 * /finish idempotent: tải lại trang này gọi lại cũng ra cùng số liệu.
 */
const ReviewResult = ({ sessionId, localResults = [], totalCards = 0, onContinue, onHome }) => {
  const [finish] = useFinishFlashcardSessionMutation()
  const sync = useFlashcardSync(sessionId)
  const [metrics, setMetrics] = useState(null)
  const [error, setError] = useState(null)
  const [retryTick, setRetryTick] = useState(0)
  const started = useRef(false)

  const ready = sync.isOnline && sync.pendingCount === 0

  useEffect(() => {
    if (!ready || started.current || !sessionId) return
    started.current = true
    finish(sessionId)
      .unwrap()
      .then((res) => setMetrics(res.metrics))
      .catch((err) => {
        started.current = false
        setError(err)
        setTimeout(() => setRetryTick((t) => t + 1), 5000)
      })
  }, [ready, sessionId, finish, retryTick])

  const shown = metrics || (localResults.length ? localSummary(localResults, totalCards) : null)
  const lines = resultLines(shown)
  const waiting = !metrics

  if (!shown) {
    return (
      <LoadingSpinner
        className="flex flex-col items-center justify-center py-24"
        text={sync.isOnline ? "Đang tổng kết phiên ôn..." : "Đang chờ có mạng để tổng kết..."}
      />
    )
  }

  const celebrate = (metrics?.entered_long_term || 0) > 0
  const nextBatch = metrics?.next_batch_due || 0

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-5">
      <OfflineBanner isOnline={sync.isOnline} />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs p-6 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
          {celebrate ? <Sparkles className="w-7 h-7 text-[#990011]" /> : <Brain className="w-7 h-7 text-[#990011]" />}
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {celebrate ? "Tuyệt vời, có từ đã nhớ lâu rồi!" : "Hoàn thành phiên ôn"}
        </h2>

        <ul className="w-full flex flex-col gap-2 text-left">
          {lines.map(({ key, text, tone }) => {
            const { icon: Icon, cls } = TONE[tone] || TONE.main
            return (
              <li key={key} className={`flex items-center gap-2 text-base ${cls}`}>
                <Icon className="w-5 h-5 shrink-0" />
                <span className={tone === "main" ? "font-semibold" : ""}>{text}</span>
              </li>
            )
          })}
        </ul>

        {shown.forgot_words?.length > 0 && (
          <div className="w-full text-left">
            <p className="text-xs font-medium text-slate-500 mb-1.5">Từ sẽ gặp lại sớm:</p>
            <div className="flex flex-wrap gap-2">
              {shown.forgot_words.map((w) => (
                <span key={w.card_id} lang="zh" className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
                  {w.word}
                </span>
              ))}
            </div>
          </div>
        )}

        {metrics?.long_term_words?.length > 0 && (
          <div className="w-full text-left">
            <p className="text-xs font-medium text-slate-500 mb-1.5">Đã vào bộ nhớ dài hạn:</p>
            <div className="flex flex-wrap gap-2">
              {metrics.long_term_words.map((w) => (
                <span key={w.card_id} lang="zh" className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-sm text-[#990011]">
                  {w.word}
                </span>
              ))}
            </div>
          </div>
        )}

        {waiting && (
          <p className="text-xs text-slate-500">
            {error ? "Chưa tổng kết được trên máy chủ, đang thử lại..." : "Số liệu đang được cập nhật khi kết quả đồng bộ xong."}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {nextBatch > 0 && (
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 h-11 rounded-full bg-[#990011] text-sm font-semibold text-white hover:brightness-95"
          >
            Ôn tiếp mẻ sau ({nextBatch} thẻ)
          </button>
        )}
        <button
          type="button"
          onClick={onHome}
          className={`flex-1 h-11 rounded-full text-sm font-semibold ${
            nextBatch > 0
              ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              : "bg-[#990011] text-white hover:brightness-95"
          }`}
        >
          Về sổ từ vựng
        </button>
      </div>

      <SyncToast isOnline={sync.isOnline} isRetrying={sync.isRetrying} pendingCount={sync.pendingCount} />
    </div>
  )
}

export default ReviewResult
