import React, { useMemo, useState } from "react"
import AudioButton from "../AudioButton"
import { multipleChoiceOptions } from "../../../utils/flashcardReview"

/**
 * Trắc nghiệm (fc02, kiểu 3). Câu hỏi là nghĩa tiếng Việt + nút nghe audio,
 * 4 đáp án chữ Hán: 1 đúng + 3 từ nhiễu cùng cấp HSK, cùng loại từ (server chọn).
 */
const MultipleChoiceExercise = ({ card, onResult, onNext }) => {
  const options = useMemo(() => multipleChoiceOptions(card), [card])
  const [picked, setPicked] = useState(null)

  const choose = (option) => {
    if (picked) return
    setPicked(option)
    onResult({ isCorrect: option === card.word, isOverride: false })
  }

  const styleFor = (option) => {
    if (!picked) return "border-slate-200 dark:border-[#3F3F3F] bg-white dark:bg-[#242424] text-slate-800 dark:text-neutral-100 hover:border-slate-300 dark:hover:border-neutral-500 hover:bg-slate-50 dark:hover:bg-[#2c2c2c] cursor-pointer"
    if (option === card.word) return "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
    if (option === picked) return "border-rose-400 dark:border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200"
    return "border-slate-200 dark:border-[#3F3F3F] bg-white dark:bg-[#242424] text-slate-800 dark:text-neutral-100 opacity-60"
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full rounded-2xl border border-slate-200 dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] shadow-2xs px-4 py-6 flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-neutral-400">Chọn từ đúng nghĩa</span>
        <div className="text-2xl font-semibold text-slate-900 dark:text-white">{card.meaning_vi || "..."}</div>
        {card.part_of_speech_vi && (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-[#272727] text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-[#3F3F3F]">
            {card.part_of_speech_vi}
          </span>
        )}
        <AudioButton audioPath={card.audio_url} pinyin={card.pinyin} label="Nghe câu hỏi" />
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md" role="group" aria-label="Đáp án">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            lang="zh"
            onClick={() => choose(option)}
            disabled={Boolean(picked)}
            className={`h-16 rounded-xl border text-2xl font-medium transition-colors disabled:cursor-default ${styleFor(option)}`}
          >
            {option}
          </button>
        ))}
      </div>

      {picked && (
        <div className="flex flex-col items-center gap-3">
          <p className={`text-sm font-semibold ${picked === card.word ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
            {picked === card.word ? "Chính xác!" : `Đáp án đúng là ${card.word}`}
            {card.pinyin && <span className="font-normal text-slate-600 dark:text-neutral-400"> ({card.pinyin})</span>}
          </p>
          <button
            type="button"
            onClick={onNext}
            className="h-11 px-8 rounded-full bg-[#990011] text-sm font-semibold text-white hover:brightness-95"
          >
            Tiếp tục
          </button>
        </div>
      )}
    </div>
  )
}

export default MultipleChoiceExercise
