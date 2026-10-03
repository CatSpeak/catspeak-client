import React, { useState } from "react"
import { Check, X } from "lucide-react"
import AudioButton from "../AudioButton"
import CardBack from "./CardBack"
import useSampleAudio from "../../../hooks/useSampleAudio"
import { isExactMatch } from "../../../utils/flashcardReview"

/**
 * Điền từ (fc02, kiểu 2). Câu ví dụ khuyết từ, học viên gõ chữ Hán, so khớp chính xác.
 *
 *   Đúng  -> tự phát giọng mẫu, hiện câu đầy đủ.
 *   Sai   -> hiện đáp án đúng, ghi "Quên" ngay (để bộ đệm offline có kết quả), kèm
 *            nút "Tôi đúng rồi" (E-FC-005): so khớp chính xác có thể chấm sai một
 *            đáp án đúng (biến thể chữ, gõ thừa), học viên tự sửa thành "Nhớ".
 */
const FillBlankExercise = ({ card, onResult, onNext }) => {
  const [value, setValue] = useState("")
  const [state, setState] = useState("idle") // idle | correct | wrong | overridden
  const audio = useSampleAudio(card.audio_url)

  const check = () => {
    if (state !== "idle" || !value.trim()) return
    if (isExactMatch(value, card.word)) {
      setState("correct")
      audio.play()
      onResult({ isCorrect: true, isOverride: false })
    } else {
      setState("wrong")
      onResult({ isCorrect: false, isOverride: false })
    }
  }

  const override = () => {
    setState("overridden")
    onResult({ isCorrect: false, isOverride: true })
  }

  const onKeyDown = (e) => {
    // Bộ gõ tiếng Trung dùng Enter để chọn chữ: không chấm khi đang soạn.
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (state === "idle") check()
      else onNext()
    }
  }

  const done = state !== "idle"

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-2xs px-4 py-6 flex flex-col items-center gap-4 text-center">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Điền từ còn thiếu</span>
        <p className="text-2xl sm:text-3xl text-slate-900 leading-relaxed" lang="zh">
          {card.example_blank}
        </p>
        <p className="text-sm text-slate-600">
          Gợi ý nghĩa: <span className="font-medium text-slate-800">{card.meaning_vi || "..."}</span>
          {card.part_of_speech_vi && <span className="text-slate-500"> ({card.part_of_speech_vi})</span>}
        </p>

        <input
          type="text"
          lang="zh"
          value={value}
          disabled={done}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Gõ chữ Hán"
          aria-label="Đáp án chữ Hán"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          className={`w-full max-w-xs h-12 rounded-xl border px-4 text-center text-xl outline-none transition-colors ${
            state === "correct" || state === "overridden"
              ? "border-emerald-400 bg-emerald-50"
              : state === "wrong"
                ? "border-rose-400 bg-rose-50"
                : "border-slate-300 focus:border-[#990011]"
          }`}
        />

        {state === "correct" && (
          <div className="flex flex-col items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
              <Check className="w-4 h-4" /> Chính xác!
            </span>
            <AudioButton audioPath={card.audio_url} pinyin={card.pinyin} audio={audio} />
            <CardBack card={card} />
          </div>
        )}

        {(state === "wrong" || state === "overridden") && (
          <div className="flex flex-col items-center gap-3">
            {state === "wrong" ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700">
                <X className="w-4 h-4" /> Chưa đúng - thẻ này được đánh dấu Quên
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <Check className="w-4 h-4" /> Đã sửa thành Nhớ
              </span>
            )}
            <span className="text-sm text-slate-600">Đáp án đúng:</span>
            <CardBack card={card} />
          </div>
        )}
      </div>

      {!done ? (
        <button
          type="button"
          onClick={check}
          disabled={!value.trim()}
          className="h-11 px-8 rounded-full bg-[#990011] text-sm font-semibold text-white hover:brightness-95 disabled:bg-[#BFBFBF] disabled:cursor-not-allowed"
        >
          Kiểm tra
        </button>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {state === "wrong" && (
            <button
              type="button"
              onClick={override}
              className="h-11 px-5 rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Tôi đúng rồi
            </button>
          )}
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

export default FillBlankExercise
