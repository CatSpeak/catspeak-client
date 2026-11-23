import React, { useEffect, useMemo, useRef, useState } from "react"
import { Check, Volume2 } from "lucide-react"
import usePracticeSignals from "../../hooks/usePracticeSignals"
import usePracticeText from "../../hooks/usePracticeText"
import useShortcuts from "../../hooks/useShortcuts"
import useSpeak from "../../hooks/useSpeak"
import { alignTyped } from "../../utils/practiceText"
import { BTN_GHOST, BTN_PRIMARY, BTN_SECONDARY, INPUT_BASE, INPUT_IDLE, INPUT_OK, PANEL } from "../ui"

const CHAR_TONE = {
  ok: "text-emerald-600 dark:text-emerald-400",
  bad: "text-rose-600 dark:text-rose-400 underline decoration-wavy",
  caret: "text-slate-900 dark:text-white border-b-2 border-[#990011] dark:border-red-400",
  todo: "text-slate-400 dark:text-neutral-500",
  skip: "text-slate-400 dark:text-neutral-500",
}

/**
 * Gõ câu (FE-02): chép lại câu ví dụ, tô màu từng chữ khi gõ (giống Typing Studio của word-atlas).
 * Không chấm dấu câu. Chỉ so phần đã "chốt" của bộ gõ, không so chữ pinyin đang soạn.
 * Gõ đúng hết thì tự chuyển. Đây là bài luyện tay nên không gửi nhãn FSRS.
 */
const SentenceExercise = ({ item, onAnswered, onNext }) => {
  const { p } = usePracticeText()
  const signals = usePracticeSignals(item.card_id)
  const [value, setValue] = useState("")
  const [committed, setCommitted] = useState("")
  const [done, setDone] = useState(false)
  const composing = useRef(false)
  const inputRef = useRef(null)
  const speech = useSpeak({ audioUrl: item.example_audio_url, text: item.example_sentence })

  const aligned = useMemo(() => alignTyped(item.example_sentence, committed), [item.example_sentence, committed])

  useEffect(() => {
    inputRef.current?.focus()
  }, [item.card_id])

  useEffect(() => {
    if (!aligned.done || done) return undefined
    setDone(true)
    const elapsedMs = signals.stop()
    onAnswered({ result: "correct", isCorrect: true, rating: null, elapsedMs, hintsUsed: 0 })
    const timer = setTimeout(onNext, 700)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi vừa gõ xong
  }, [aligned.done])

  useShortcuts({ "Alt+r": () => speech.speak() })

  const commit = (text) => {
    if (!composing.current) setCommitted(text)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className={`${PANEL} w-full px-4 py-6 flex flex-col items-center gap-4 text-center`}>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-neutral-400">
          {p.promptSentence}
        </span>
        <p className="text-2xl sm:text-3xl leading-relaxed tracking-wide" lang="zh" aria-label={item.example_sentence}>
          {aligned.chars.map((c, i) => (
            <span key={i} className={CHAR_TONE[c.state]}>
              {c.ch}
            </span>
          ))}
        </p>
        {item.meaning_vi && (
          <p className="text-sm text-slate-600 dark:text-neutral-400">
            <span lang="zh" className="font-semibold text-slate-800 dark:text-neutral-200">
              {item.word}
            </span>{" "}
            {item.pinyin} · {item.meaning_vi}
          </p>
        )}
        <input
          ref={inputRef}
          type="text"
          lang="zh"
          value={value}
          readOnly={done}
          onChange={(e) => {
            setValue(e.target.value)
            commit(e.target.value)
          }}
          onCompositionStart={() => {
            composing.current = true
          }}
          onCompositionEnd={(e) => {
            composing.current = false
            commit(e.currentTarget.value)
          }}
          placeholder={p.placeholderSentence}
          aria-label={p.placeholderSentence}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={`${INPUT_BASE} ${done ? INPUT_OK : INPUT_IDLE}`}
        />
        {done && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400" role="status">
            <Check className="w-4 h-4" /> {p.correct}
          </span>
        )}
        <p className="text-xs text-slate-500 dark:text-neutral-400">{p.practiceOnly}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => speech.speak()} disabled={!speech.available} className={BTN_GHOST}>
          <Volume2 className="w-4 h-4" /> {p.replay}
        </button>
        {done ? (
          <button type="button" onClick={onNext} className={BTN_PRIMARY}>
            {p.next}
          </button>
        ) : (
          <button type="button" onClick={onNext} className={BTN_SECONDARY}>
            {p.next}
          </button>
        )}
      </div>
    </div>
  )
}

export default SentenceExercise
