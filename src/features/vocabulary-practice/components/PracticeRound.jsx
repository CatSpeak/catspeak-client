import React, { useCallback, useEffect, useRef, useState } from "react"
import { WifiOff, X } from "lucide-react"
import { fmt } from "../i18n"
import usePracticeSync from "../hooks/usePracticeSync"
import usePracticeText from "../hooks/usePracticeText"
import { GRADED_MODES, PRACTICE_MODES } from "../utils/practiceModes"
import FlashcardExercise from "./exercises/FlashcardExercise"
import SentenceExercise from "./exercises/SentenceExercise"
import TypingExercise from "./exercises/TypingExercise"
import PracticeSummary from "./PracticeSummary"
import ScheduleNote from "./ScheduleNote"

const EXERCISES = {
  [PRACTICE_MODES.WORD]: TypingExercise,
  [PRACTICE_MODES.LISTEN]: TypingExercise,
  [PRACTICE_MODES.SENTENCE]: SentenceExercise,
  [PRACTICE_MODES.FLASHCARD]: FlashcardExercise,
}

/**
 * Một lượt ôn (FE-02 + FE-05): hiện từng thẻ, nhận kết quả, chuyển câu, gửi nhãn FSRS.
 *
 * Mỗi thẻ chỉ tính lần trả lời đầu. Nhãn đi qua hàng đợi offline (usePracticeSync) nên
 * mất mạng vẫn ôn tiếp. Lịch ôn trả về của thẻ gần nhất hiện ở dưới thanh tiến độ.
 */
const PracticeRound = ({ mode, items, fsrsEnabled, onExit, onAgain }) => {
  const { p } = usePracticeText()
  const graded = fsrsEnabled && GRADED_MODES.has(mode)
  const sync = usePracticeSync({ enabled: graded })
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState([])
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    indexRef.current = index
  }, [index])

  const item = items[index]

  const answered = useRef(new Set())
  const handleAnswered = useCallback(
    (signal) => {
      if (!item || answered.current.has(item.card_id)) return
      answered.current.add(item.card_id)
      const reviewId =
        graded && signal.rating
          ? sync.submit({
              cardId: item.card_id,
              rating: signal.rating,
              mode,
              isCorrect: signal.isCorrect,
              elapsedMs: signal.elapsedMs,
              hintsUsed: signal.hintsUsed,
            })
          : null
      setResults((prev) => [...prev, { cardId: item.card_id, word: item.word, ...signal, reviewId }])
    },
    [item, graded, sync, mode],
  )

  // Chặn bấm "Tiếp" hai lần (hoặc hẹn giờ tự chuyển + bấm tay) làm nhảy cóc một thẻ.
  const goNext = useCallback(
    (fromIndex) => {
      if (fromIndex !== indexRef.current) return
      if (fromIndex + 1 < items.length) {
        indexRef.current = fromIndex + 1
        setIndex(fromIndex + 1)
      } else setDone(true)
    },
    [items.length],
  )

  if (done || !item) {
    return (
      <PracticeSummary
        results={results}
        total={items.length}
        schedules={sync.schedules}
        graded={graded}
        onExit={onExit}
        onAgain={onAgain}
      />
    )
  }

  const last = results[results.length - 1]
  const lastSchedule = last?.reviewId ? sync.schedules[last.reviewId] : null
  const lastQueued = Boolean(last?.reviewId && !lastSchedule && sync.pendingCount > 0)
  const current = results.find((r) => r.cardId === item.card_id)
  const Exercise = EXERCISES[mode] || TypingExercise

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          aria-label={p.exit}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-[#2A2A2A]"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-neutral-400 mb-1.5">
            <span>{p.modes[mode]?.name}</span>
            <span>{fmt(p.position, { i: index + 1, n: items.length })}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-[#2A2A2A] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#990011] transition-all duration-300"
              style={{ width: `${(index / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex min-h-5 flex-wrap items-center justify-between gap-2">
        {mode === PRACTICE_MODES.FLASHCARD && last ? (
          <ScheduleNote schedule={lastSchedule} queued={lastQueued} word={last.word} />
        ) : (
          <span />
        )}
        {graded && sync.pendingCount > 0 && (
          <span className="text-xs text-slate-500 dark:text-neutral-400">{fmt(p.pending, { n: sync.pendingCount })}</span>
        )}
      </div>

      {!sync.isOnline && graded && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
          <WifiOff className="w-4 h-4 shrink-0" /> {p.offline}
        </div>
      )}
      {!fsrsEnabled && GRADED_MODES.has(mode) && index === 0 && (
        <p className="text-xs text-slate-500 dark:text-neutral-400">{p.fsrsOff}</p>
      )}

      <Exercise
        key={item.card_id}
        item={item}
        mode={mode}
        onAnswered={handleAnswered}
        onNext={() => goNext(index)}
        scheduleNote={
          current?.reviewId ? (
            <ScheduleNote
              schedule={sync.schedules[current.reviewId]}
              queued={!sync.schedules[current.reviewId] && sync.pendingCount > 0}
            />
          ) : null
        }
      />

      <p className="hidden sm:block text-center text-[11px] text-slate-400 dark:text-neutral-500">{p.shortcuts}</p>
    </div>
  )
}

export default PracticeRound
