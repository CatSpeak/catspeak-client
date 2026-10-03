import React, { useCallback, useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import {
  flashcardErrorCode,
  useLazyGetFlashcardSessionQuery,
  useStartFlashcardSessionMutation,
} from "../../api/flashcardReviewApi"
import useFlashcardSync from "../../hooks/useFlashcardSync"
import { createReviewQueue } from "../../utils/flashcardOfflineSync"
import { remainingCards } from "../../utils/flashcardReview"
import FillBlankExercise from "./exercises/FillBlankExercise"
import FlipCardExercise from "./exercises/FlipCardExercise"
import MultipleChoiceExercise from "./exercises/MultipleChoiceExercise"
import { OfflineBanner, SyncToast } from "./SyncStatus"

const EXERCISES = {
  flip: FlipCardExercise,
  fill_blank: FillBlankExercise,
  multiple_choice: MultipleChoiceExercise,
}

const MODE_LABEL = {
  due: "Ôn thẻ đến hạn",
  early: "Ôn ngay từ buổi nói",
  free: "Ôn tự do",
}

/**
 * fc02: phiên ôn. Ba kiểu bài xen kẽ, kiểu của từng thẻ do server gán.
 *
 * Mở phiên mới theo `mode` (due | early | free), hoặc vào lại phiên đang mở bằng
 * `resumeSessionId`. Thẻ đã có kết quả trên server hoặc đang chờ đồng bộ thì bỏ qua.
 *
 * Mỗi lượt chấm đi qua bộ đệm offline (useFlashcardSync): mất mạng vẫn ôn tiếp.
 * Hết thẻ thì gọi `onFinished(sessionId, { localResults, totalCards })`; fc03 tự
 * chờ đồng bộ xong rồi mới gọi /finish.
 */
const ReviewSession = ({
  mode = "due",
  deckId = null,
  sourceSessionId = null,
  resumeSessionId = null,
  timezone = null,
  onFinished,
  onExit,
}) => {
  const [startSession] = useStartFlashcardSessionMutation()
  const [loadSession] = useLazyGetFlashcardSessionQuery()
  const [session, setSession] = useState(null)
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const results = useRef(new Map())
  const sync = useFlashcardSync(session?.session_id)

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const request = resumeSessionId
      ? loadSession(resumeSessionId)
      : startSession({ mode, deckId, sourceSessionId, timezone })
    request
      .unwrap()
      .then((data) => {
        if (cancelled) return
        // Thẻ đã chấm nhưng chưa lên server (offline, tải lại trang) cũng tính là xong.
        const pendingIds = data.session_id
          ? createReviewQueue().forSession(data.session_id).map((i) => i.cardId)
          : []
        setSession(data)
        setQueue(remainingCards(data.cards, data.answered_card_ids, pendingIds))
        setIndex(0)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mode, deckId, sourceSessionId, resumeSessionId, timezone, startSession, loadSession, reloadKey])

  const retry = () => {
    setLoading(true)
    setError(null)
    setReloadKey((k) => k + 1)
  }

  const card = queue[index]
  const total = session?.total_cards || 0
  const doneBefore = total - queue.length
  const position = Math.min(total, doneBefore + index + 1)

  const handleResult = useCallback(
    ({ isCorrect, isOverride }) => {
      if (!card || !session?.session_id) return
      results.current.set(card.card_id, { cardId: card.card_id, word: card.word, isCorrect, isOverride })
      sync.submit({
        sessionId: session.session_id,
        cardId: card.card_id,
        exerciseType: card.exercise_type,
        isCorrect,
        isOverride,
      })
    },
    [card, session, sync],
  )

  const handleNext = useCallback(() => {
    if (index + 1 < queue.length) {
      setIndex(index + 1)
      return
    }
    onFinished?.(session.session_id, {
      localResults: [...results.current.values()],
      totalCards: total,
      mode: session.mode,
    })
  }, [index, queue.length, onFinished, session, total])

  if (loading) {
    return <LoadingSpinner className="flex flex-col items-center justify-center py-24" text="Đang chuẩn bị thẻ..." />
  }

  if (error) {
    const code = flashcardErrorCode(error)
    const offline = error?.status === "FETCH_ERROR"
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-base font-semibold text-slate-800">
          {offline ? "Chưa tải được thẻ vì đang mất mạng" : "Chưa mở được phiên ôn"}
        </p>
        <p className="text-sm text-slate-500 max-w-sm">
          {error?.data?.detail?.message || (offline ? "Kiểm tra kết nối rồi thử lại nhé." : code || "Bạn thử lại sau ít phút.")}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onExit} className="h-10 px-5 rounded-full border border-slate-300 bg-white text-sm font-medium">
            Quay lại
          </button>
          <button type="button" onClick={retry} className="h-10 px-5 rounded-full bg-[#990011] text-white text-sm font-medium">
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!session?.session_id || total === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <div className="text-4xl">🎉</div>
        <p className="text-lg font-semibold text-slate-800">
          {mode === "due" ? "Hôm nay bạn đã ôn hết thẻ rồi!" : "Chưa có thẻ nào để ôn ở đây"}
        </p>
        <p className="text-sm text-slate-500 max-w-sm">
          {mode === "due"
            ? "Thẻ tiếp theo sẽ đến hạn vào những ngày tới. Luyện nói với AI để thêm từ mới vào sổ."
            : "Luyện nói với AI để thêm từ vào sổ, rồi quay lại ôn nhé."}
        </p>
        <button type="button" onClick={onExit} className="mt-2 h-10 px-6 rounded-full bg-[#990011] text-white text-sm font-medium">
          Về sổ từ vựng
        </button>
      </div>
    )
  }

  if (!card) {
    // Mọi thẻ đã có kết quả (vào lại phiên đã ôn xong): sang fc03.
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-base font-semibold text-slate-800">Bạn đã ôn xong mẻ thẻ này.</p>
        <button
          type="button"
          onClick={() => onFinished?.(session.session_id, { localResults: [], totalCards: total, mode: session.mode })}
          className="h-10 px-6 rounded-full bg-[#990011] text-white text-sm font-medium"
        >
          Xem kết quả
        </button>
      </div>
    )
  }

  const Exercise = EXERCISES[card.exercise_type] || FlipCardExercise

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          aria-label="Thoát phiên ôn"
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
            <span>{MODE_LABEL[session.mode] || MODE_LABEL.due}</span>
            <span>
              Thẻ {position}/{total}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#990011] transition-all duration-300"
              style={{ width: `${(Math.max(0, position - 1) / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <OfflineBanner isOnline={sync.isOnline} />

      <Exercise key={card.card_id} card={card} onResult={handleResult} onNext={handleNext} />

      <SyncToast isOnline={sync.isOnline} isRetrying={sync.isRetrying} pendingCount={sync.pendingCount} />
    </div>
  )
}

export default ReviewSession
