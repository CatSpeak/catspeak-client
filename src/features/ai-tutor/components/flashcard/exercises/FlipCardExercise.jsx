import React, { useState } from "react"
import { RotateCcw } from "lucide-react"
import AudioButton from "../AudioButton"
import CardBack from "./CardBack"
import { isPronunciationCard } from "../../../utils/flashcardReview"

/**
 * Lật thẻ (fc02, kiểu 1). Học viên tự chấm "Nhớ" / "Quên".
 *
 *   Thẻ Nghĩa     mặt trước: chữ Hán + pinyin + audio
 *   Thẻ Phát âm   mặt trước: audio + pinyin, ẨN chữ Hán (nghe rồi nhớ lại từ)
 *   Mặt sau       nghĩa, loại từ, câu ví dụ
 */
const FlipCardExercise = ({ card, onResult, onNext }) => {
  const [flipped, setFlipped] = useState(false)
  const pronunciation = isPronunciationCard(card)

  const answer = (isCorrect) => {
    onResult({ isCorrect, isOverride: false })
    onNext()
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full min-h-[240px] rounded-2xl border border-slate-200 dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] shadow-2xs px-4 py-8 flex items-center justify-center">
        {!flipped ? (
          <div className="flex flex-col items-center gap-3 text-center">
            {pronunciation ? (
              <>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-neutral-400">Thẻ phát âm</span>
                <AudioButton audioPath={card.audio_url} pinyin={card.pinyin} size="lg" />
                {card.pinyin && <div className="text-xl text-slate-700 dark:text-neutral-200">{card.pinyin}</div>}
                <p className="text-sm text-slate-500 dark:text-neutral-400">Nghe, đọc theo, rồi nhớ lại từ này là chữ gì, nghĩa là gì.</p>
              </>
            ) : (
              <>
                <div className="text-5xl sm:text-6xl font-semibold text-slate-900 dark:text-white" lang="zh">
                  {card.word}
                </div>
                {card.pinyin && <div className="text-lg text-slate-600 dark:text-neutral-300">{card.pinyin}</div>}
                <AudioButton audioPath={card.audio_url} pinyin={card.pinyin} />
              </>
            )}
          </div>
        ) : (
          <CardBack card={card} />
        )}
      </div>

      {!flipped ? (
        <button
          type="button"
          onClick={() => setFlipped(true)}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#990011] text-white text-sm font-semibold hover:brightness-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Lật thẻ
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          <button
            type="button"
            onClick={() => answer(false)}
            className="h-11 rounded-full border border-slate-300 dark:border-[#3F3F3F] bg-white dark:bg-[#272727] text-sm font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-[#3D3D3D] cursor-pointer"
          >
            Quên
          </button>
          <button
            type="button"
            onClick={() => answer(true)}
            className="h-11 rounded-full bg-[#990011] text-sm font-semibold text-white hover:brightness-95 cursor-pointer"
          >
            Nhớ
          </button>
        </div>
      )}
    </div>
  )
}

export default FlipCardExercise
