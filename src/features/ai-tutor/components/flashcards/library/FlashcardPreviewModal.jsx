import React, { useState } from "react"
import { Lock, RotateCcw } from "lucide-react"
import AudioButton from "../../flashcard/AudioButton"
import CardBack from "../../flashcard/exercises/CardBack"
import FlashcardModal from "../../flashcard/FlashcardModal"
import { isPronunciationCard } from "../../../utils/flashcardReview"

/**
 * Modal xem thẻ flashcard ở chế độ chỉ đọc (fc05, TC-FC-092, FR-FC-016).
 *
 * Cho phép lật qua lại mặt trước / mặt sau, nghe audio phát âm mẫu, xem nghĩa và
 * câu ví dụ mà không ảnh hưởng tới tiến trình hoặc lịch ôn SRS.
 */
const FlashcardPreviewModal = ({ card, isOpen, onClose }) => {
  const [flipped, setFlipped] = useState(false)

  if (!card) return null

  const pronunciation = isPronunciationCard(card)

  const title = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-lg font-bold text-slate-900 dark:text-white">Chi tiết thẻ</span>
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 text-xs font-bold text-[#680411] dark:text-red-400">
        <Lock className="h-3 w-3" />
        Chỉ đọc - không ảnh hưởng lịch ôn
      </span>
    </div>
  )

  const footer = (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="text-xs text-slate-500 dark:text-neutral-400">
        {card.hsk_level ? `HSK ${card.hsk_level}` : "Từ vựng"}
        {card.is_known && " • Đã biết"}
        {card.is_long_term && " • Nhớ lâu dài"}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="h-10 rounded-xl border border-slate-200 dark:border-[#3F3F3F] bg-white dark:bg-[#272727] px-5 text-sm font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-[#333]"
      >
        Đóng
      </button>
    </div>
  )

  return (
    <FlashcardModal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footer={footer}
      maxWidth="max-w-lg"
      labelledBy="flashcard-preview-title"
    >
      <div className="flex flex-col items-center gap-5 py-2">
        <div className="relative flex min-h-[250px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-[#3F3F3F] bg-slate-50/60 dark:bg-[#202020] p-6 shadow-2xs transition-all">
          <span className="absolute left-4 top-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
            {!flipped ? "Mặt trước" : "Mặt sau"}
          </span>

          {!flipped ? (
            <div className="flex flex-col items-center gap-3 text-center">
              {pronunciation ? (
                <>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">
                    Thẻ phát âm
                  </span>
                  <AudioButton audioPath={card.audio_url} pinyin={card.pinyin} size="lg" />
                  {card.pinyin && <div className="text-xl text-slate-700 dark:text-neutral-200">{card.pinyin}</div>}
                  <p className="max-w-xs text-sm text-slate-500 dark:text-neutral-400">
                    Nghe, đọc theo, rồi nhớ lại từ này là chữ gì, nghĩa là gì.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-5xl font-semibold text-slate-900 dark:text-white sm:text-6xl" lang="zh">
                    {card.word}
                  </div>
                  {card.pinyin && <div className="text-lg text-slate-600 dark:text-neutral-300">{card.pinyin}</div>}
                  <AudioButton audioPath={card.audio_url} pinyin={card.pinyin} label={`Nghe phát âm ${card.word}`} />
                </>
              )}
            </div>
          ) : (
            <div className="flex w-full flex-col items-center gap-3 text-center">
              <CardBack card={card} />
              {!card.example_sentence && (
                <p className="mt-1 text-xs italic text-slate-400 dark:text-neutral-500">
                  Chưa có câu ví dụ cho thẻ này.
                </p>
              )}
              <div className="mt-1">
                <AudioButton audioPath={card.audio_url} pinyin={card.pinyin} label={`Nghe lại phát âm ${card.word}`} />
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          data-testid="flip-card-btn"
          onClick={() => setFlipped((v) => !v)}
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-[#990011] dark:bg-cath-red-700 px-6 text-sm font-semibold text-white transition-all hover:brightness-95"
        >
          <RotateCcw className="h-4 w-4" />
          {!flipped ? "Lật thẻ xem mặt sau" : "Lật lại mặt trước"}
        </button>
      </div>
    </FlashcardModal>
  )
}

export default FlashcardPreviewModal
