import React, { useState } from "react"
import AudioButton from "@/features/ai-tutor/components/flashcard/AudioButton"
import CardBack from "@/features/ai-tutor/components/flashcard/exercises/CardBack"
import usePracticeSignals from "../../hooks/usePracticeSignals"
import usePracticeText from "../../hooks/usePracticeText"
import useShortcuts from "../../hooks/useShortcuts"
import { RATING } from "../../utils/practiceModes"
import { BTN_PRIMARY, PANEL } from "../ui"

const RATE_STYLE = {
  [RATING.AGAIN]: "border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40",
  [RATING.HARD]: "border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40",
  [RATING.GOOD]: "border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40",
  [RATING.EASY]: "border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/40",
}

/**
 * Flashcard (FE-02): mặt trước chữ Hán, lật xem nghĩa rồi tự chấm 1-4 (Again/Hard/Good/Easy).
 * Thời gian trả lời = từ lúc hiện thẻ tới lúc lật (FE-05). Chấm xong sang thẻ ngay;
 * lịch ôn của thẻ vừa chấm hiện ở thanh trên của lượt ôn.
 */
const FlashcardExercise = ({ item, onAnswered, onNext }) => {
  const { p } = usePracticeText()
  const signals = usePracticeSignals(item.card_id)
  const [flipped, setFlipped] = useState(false)
  const [rated, setRated] = useState(false)

  const flip = () => {
    if (flipped) return
    signals.stop()
    setFlipped(true)
  }

  const rate = (rating) => {
    if (!flipped || rated) return
    setRated(true)
    onAnswered({
      result: rating === RATING.AGAIN ? "wrong" : "correct",
      isCorrect: rating !== RATING.AGAIN,
      rating,
      elapsedMs: signals.stop(),
      hintsUsed: 0,
    })
    onNext()
  }

  useShortcuts({
    " ": flip,
    Enter: () => (flipped ? rate(RATING.GOOD) : flip()),
    1: () => rate(RATING.AGAIN),
    2: () => rate(RATING.HARD),
    3: () => rate(RATING.GOOD),
    4: () => rate(RATING.EASY),
  })

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className={`${PANEL} w-full min-h-[280px] px-4 py-8 flex flex-col items-center justify-center gap-4 text-center`}
        onClick={flip}
      >
        {!flipped ? (
          <>
            <div className="text-5xl sm:text-6xl font-semibold text-slate-900 dark:text-white" lang="zh">
              {item.word}
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <AudioButton audioPath={item.audio_url} pinyin={item.pinyin} />
            </div>
          </>
        ) : (
          <CardBack card={item} />
        )}
      </div>

      {!flipped ? (
        <button type="button" onClick={flip} autoFocus className={BTN_PRIMARY}>
          {p.flip}
        </button>
      ) : (
        <div className="flex w-full flex-col items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-neutral-400">{p.rateQuestion}</span>
          <div className="grid w-full max-w-lg grid-cols-4 gap-2">
            {[RATING.AGAIN, RATING.HARD, RATING.GOOD, RATING.EASY].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => rate(r)}
                disabled={rated}
                className={`flex h-14 flex-col items-center justify-center rounded-xl border bg-white dark:bg-[#1F1F1F] text-sm font-semibold cursor-pointer ${RATE_STYLE[r]}`}
              >
                {p.rate[r]}
                <kbd className="text-[10px] font-normal opacity-60">{r}</kbd>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FlashcardExercise
