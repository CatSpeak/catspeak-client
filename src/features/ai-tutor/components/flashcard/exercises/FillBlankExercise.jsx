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
 *   Trống -> tính sai như gõ sai (CHK-096): hiện đáp án đúng, không có "Tôi đúng rồi".
 *   Sai   -> hiện đáp án đúng, ghi "Quên" ngay (để bộ đệm offline có kết quả), kèm
 *            nút "Tôi đúng rồi" (E-FC-005): so khớp chính xác có thể chấm sai một
 *            đáp án đúng (biến thể chữ, gõ thừa), học viên tự sửa thành "Nhớ".
 */
const FillBlankExercise = ({ card, onResult, onNext }) => {
  const [value, setValue] = useState("")
  const [state, setState] = useState("idle") // idle | correct | wrong | blank | overridden
  const audio = useSampleAudio(card.audio_url)

  const check = () => {
    if (state !== "idle") return
    if (!value.trim()) {
      setState("blank")
      onResult({ isCorrect: false, isOverride: false })
      return
    }
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
      <div className="w-full rounded-2xl border border-slate-200 dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] shadow-2xs px-4 py-6 flex flex-col items-center gap-4 text-center">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-neutral-400">Điền từ còn thiếu</span>
        <p className="text-2xl sm:text-3xl text-slate-900 dark:text-white leading-relaxed" lang="zh">
          {card.example_blank}
        </p>
        <p className="text-sm text-slate-600 dark:text-neutral-400">
          Gợi ý nghĩa: <span className="font-medium text-slate-800 dark:text-neutral-200">{card.meaning_vi || "..."}</span>
          {card.part_of_speech_vi && <span className="text-slate-500 dark:text-neutral-400"> ({card.part_of_speech_vi})</span>}
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
          className={`w-full max-w-xs h-12 rounded-xl border px-4 text-center text-xl outline-none transition-colors text-slate-900 dark:text-white ${
            state === "correct" || state === "overridden"
              ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200"
              : state === "wrong" || state === "blank"
                ? "border-rose-400 dark:border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200"
                : "border-slate-300 dark:border-[#3F3F3F] bg-white dark:bg-[#242424] focus:border-[#990011] dark:focus:border-red-400"
          }`}
        />

        {state === "correct" && (
          <div className="flex flex-col items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              <Check className="w-4 h-4" /> Chính xác!
            </span>
            <AudioButton audioPath={card.audio_url} pinyin={card.pinyin} audio={audio} />
            <CardBack card={card} />
          </div>
        )}

        {(state === "wrong" || state === "overridden" || state === "blank") && (
          <div className="flex flex-col items-center gap-3">
            {state === "blank" ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700 dark:text-rose-400">
                <X className="w-4 h-4" /> Bạn chưa điền - thẻ này được đánh dấu Quên
              </span>
            ) : state === "wrong" ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700 dark:text-rose-400">
                <X className="w-4 h-4" /> Chưa đúng - thẻ này được đánh dấu Quên
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                <Check className="w-4 h-4" /> Đã sửa thành Nhớ
              </span>
            )}
            <span className="text-sm text-slate-600 dark:text-neutral-400">Đáp án đúng:</span>
            <CardBack card={card} />
          </div>
        )}
      </div>

      {!done ? (
        <button
          type="button"
          onClick={check}
          className="h-11 px-8 rounded-full bg-[#990011] text-sm font-semibold text-white hover:brightness-95 cursor-pointer"
        >
          Kiểm tra
        </button>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {state === "wrong" && (
            <button
              type="button"
              onClick={override}
              className="h-11 px-5 rounded-full border border-slate-300 dark:border-[#3F3F3F] bg-white dark:bg-[#272727] text-sm font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-[#3D3D3D] cursor-pointer"
            >
              Tôi đúng rồi
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="h-11 px-8 rounded-full bg-[#990011] text-sm font-semibold text-white hover:brightness-95 cursor-pointer"
          >
            Tiếp tục
          </button>
        </div>
      )}
    </div>
  )
}

export default FillBlankExercise
