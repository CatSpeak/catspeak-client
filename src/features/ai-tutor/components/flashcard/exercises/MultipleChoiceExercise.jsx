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
    if (!picked) return "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
    if (option === card.word) return "border-emerald-400 bg-emerald-50 text-emerald-800"
    if (option === picked) return "border-rose-400 bg-rose-50 text-rose-800"
    return "border-slate-200 bg-white opacity-60"
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-2xs px-4 py-6 flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Chọn từ đúng nghĩa</span>
        <div className="text-2xl font-semibold text-slate-900">{card.meaning_vi || "..."}</div>
        {card.part_of_speech_vi && (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
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
          <p className={`text-sm font-semibold ${picked === card.word ? "text-emerald-700" : "text-rose-700"}`}>
            {picked === card.word ? "Chính xác!" : `Đáp án đúng là ${card.word}`}
            {card.pinyin && <span className="font-normal text-slate-600"> ({card.pinyin})</span>}
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
