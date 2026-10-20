import React, { useEffect, useRef, useState } from "react"
import { Brain, CheckCircle2, Flame, RotateCcw, Sparkles, TrendingUp } from "lucide-react"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import { useFinishFlashcardSessionMutation } from "../../api/flashcardReviewApi"
import useFlashcardSync from "../../hooks/useFlashcardSync"
import { localSummary, resultLines } from "../../utils/flashcardReview"
import { isNetworkFailure, reportNetworkError } from "../../utils/onlineStatus"
import { OfflineBanner, SyncToast } from "./SyncStatus"

const TONE = {
  main: { icon: CheckCircle2, cls: "text-slate-900" },
  good: { icon: TrendingUp, cls: "text-emerald-700" },
  warn: { icon: RotateCcw, cls: "text-amber-700" },
  celebrate: { icon: Sparkles, cls: "text-[#990011]" },
}

// Có mạng mà máy chủ chưa trả số liệu sau chừng này thì hiện tạm số liệu trên máy.
const LOCAL_FALLBACK_MS = 6000

/**
 * fc03: kết quả phiên ôn, viết bằng ngôn ngữ người học (không nhắc "hộp").
 *
 * Số liệu lấy từ /finish (đủ "nhớ tốt hơn", "N thẻ vào bộ nhớ dài hạn", số thẻ còn
 * đến hạn cho nút "Ôn tiếp", streak). Chỉ gọi khi mọi kết quả của phiên đã lên
 * server. Đang offline, hoặc máy chủ chậm quá vài giây, thì hiện tạm tổng kết trên
 * máy và nói rõ là đang chờ đồng bộ. /finish idempotent và luôn tính lại từ log:
 * kết quả đồng bộ muộn thì gọi lại để cập nhật số liệu.
 */
const ReviewResult = ({ sessionId, localResults = [], totalCards = 0, onContinue, onHome }) => {
  const [finish] = useFinishFlashcardSessionMutation()
  const sync = useFlashcardSync(sessionId)
  const [metrics, setMetrics] = useState(null)
  const [error, setError] = useState(null)
  const [retryTick, setRetryTick] = useState(0)
  const [slow, setSlow] = useState(false)
  const inFlight = useRef(false)
  const fetchedAtPending = useRef(null)

  const ready = sync.isOnline && sync.pendingCount === 0

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), LOCAL_FALLBACK_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!ready || inFlight.current || !sessionId) return
    if (metrics && fetchedAtPending.current === 0) return
    inFlight.current = true
    finish(sessionId)
      .unwrap()
      .then((res) => {
        fetchedAtPending.current = 0
        setMetrics(res.metrics)
        setError(null)
      })
      .catch((err) => {
        if (isNetworkFailure(err)) reportNetworkError()
        setError(err)
        setTimeout(() => setRetryTick((t) => t + 1), 5000)
      })
      .finally(() => {
        inFlight.current = false
      })
  }, [ready, sessionId, finish, retryTick, metrics])

  // Có kết quả mới vào hàng đợi sau khi đã lấy số liệu: lấy lại khi đồng bộ xong.
  useEffect(() => {
    if (sync.pendingCount > 0 && metrics) fetchedAtPending.current = sync.pendingCount
  }, [sync.pendingCount, metrics])

  const showLocal = !metrics && (!sync.isOnline || slow || error)
  const shown = metrics || (showLocal && localResults.length ? localSummary(localResults, totalCards) : null)
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
  const streakDays = metrics?.streak_days || 0

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-5">
      <OfflineBanner
        isOnline={sync.isOnline}
        message="Đang offline - kết quả đã lưu trên máy, sẽ đồng bộ và cập nhật số liệu khi có mạng lại."
      />

      {streakDays > 0 && (
        <div
          data-testid="flashcard-streak-banner"
          className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 px-4 py-3"
        >
          <Flame className="h-6 w-6 shrink-0 text-amber-500" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-bold text-slate-900">Chuỗi {streakDays} ngày học liên tiếp</p>
            <p className="text-slate-600">
              {metrics?.studied_today ? "Hôm nay bạn đã ôn rồi, giữ nhịp này nhé!" : "Ôn mỗi ngày để giữ chuỗi."}
            </p>
          </div>
        </div>
      )}

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
            <p className="text-xs font-medium text-slate-500 mb-1.5">Vào bộ nhớ dài hạn:</p>
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
            Ôn tiếp ({nextBatch} thẻ còn đến hạn)
          </button>
        )}
        <button
          type="button"
          onClick={onHome}
          aria-label="Về trang chủ Sổ tay từ vựng"
          className={`flex-1 h-11 rounded-full text-sm font-semibold ${
            nextBatch > 0
              ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              : "bg-[#990011] text-white hover:brightness-95"
          }`}
        >
          Về trang chủ
        </button>
      </div>

      <SyncToast isOnline={sync.isOnline} isRetrying={sync.isRetrying} pendingCount={sync.pendingCount} />
    </div>
  )
}

export default ReviewResult
