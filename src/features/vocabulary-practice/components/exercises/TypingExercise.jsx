import React, { useEffect, useRef, useState } from "react"
import { Check, Lightbulb, Volume2, X } from "lucide-react"
import CardBack from "@/features/ai-tutor/components/flashcard/exercises/CardBack"
import usePracticeSignals from "../../hooks/usePracticeSignals"
import usePracticeText from "../../hooks/usePracticeText"
import useShortcuts from "../../hooks/useShortcuts"
import useSpeak from "../../hooks/useSpeak"
import { gradeFor, PRACTICE_MODES } from "../../utils/practiceModes"
import { blankSentence, checkTypedAnswer } from "../../utils/practiceText"
import { BTN_GHOST, BTN_PRIMARY, BTN_SECONDARY, INPUT_BASE, INPUT_BAD, INPUT_IDLE, INPUT_OK, PANEL } from "../ui"

/**
 * Gõ từ (nhìn nghĩa -> gõ) và Nghe và điền (nghe câu -> điền từ khuyết). FE-02.
 *
 * Nhận chữ Hán hoặc pinyin (dấu thanh, số, "v" = ü). Pinyin thiếu thanh = "partial".
 * Gợi ý: lần 1 hiện pinyin, các lần sau lộ dần từng chữ Hán (chừa chữ cuối).
 * Thời gian trả lời và số gợi ý gửi lên qua onAnswered để chấm FSRS (FE-05).
 */
const TypingExercise = ({ item, mode, onAnswered, onNext, scheduleNote }) => {
  const { p } = usePracticeText()
  const signals = usePracticeSignals(item.card_id)
  const [value, setValue] = useState("")
  const [result, setResult] = useState(null) // correct | partial | wrong | blank
  const inputRef = useRef(null)

  const isListen = mode === PRACTICE_MODES.LISTEN
  const sentence = isListen ? blankSentence(item) : null
  const speech = useSpeak(
    isListen && sentence
      ? { audioUrl: item.example_audio_url, text: item.example_sentence }
      : { audioUrl: item.audio_url, text: item.word },
  )

  const chars = Array.from(item.word || "")
  const maxHints = (item.pinyin ? 1 : 0) + Math.max(0, chars.length - 1)
  const pinyinHint = item.pinyin && signals.hints >= 1
  const revealed = chars.slice(0, Math.max(0, signals.hints - (item.pinyin ? 1 : 0))).join("")

  useEffect(() => {
    if (isListen) speech.speak()
    inputRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ tự phát khi sang thẻ mới
  }, [item.card_id])

  const submit = (giveUp = false) => {
    if (result) return
    const elapsedMs = signals.stop()
    const r = giveUp ? "wrong" : checkTypedAnswer(value, item)
    setResult(r)
    onAnswered({
      result: r,
      isCorrect: r === "correct" || r === "partial",
      rating: gradeFor({ mode, result: r, elapsedMs, hintsUsed: signals.hints }),
      elapsedMs,
      hintsUsed: signals.hints,
    })
    if (r === "correct" || r === "partial") speech.speak()
  }

  const hint = () => {
    if (!result && signals.hints < maxHints) signals.addHint()
    inputRef.current?.focus()
  }

  useShortcuts({ "Alt+h": hint, "Alt+r": () => speech.speak() })

  const onKeyDown = (e) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return
    e.preventDefault()
    if (result) onNext()
    else submit()
  }

  const ok = result === "correct" || result === "partial"
  const inputTone = !result ? INPUT_IDLE : ok ? INPUT_OK : INPUT_BAD

  return (
    <div className="flex flex-col items-center gap-5">
      <div className={`${PANEL} w-full px-4 py-6 flex flex-col items-center gap-4 text-center`}>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-neutral-400">
          {isListen ? (sentence ? p.promptListen : p.promptListenWord) : p.promptWord}
        </span>

        {isListen ? (
          <>
            <button
              type="button"
              onClick={() => speech.speak()}
              aria-label={p.replay}
              className="w-16 h-16 rounded-full flex items-center justify-center border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-[#990011] dark:text-red-400 hover:bg-rose-100 dark:hover:bg-rose-950/60"
            >
              <Volume2 className={`w-7 h-7 ${speech.status === "playing" ? "animate-pulse" : ""}`} />
            </button>
            {sentence && (
              <p className="text-2xl sm:text-3xl leading-relaxed text-slate-900 dark:text-white" lang="zh">
                {sentence}
              </p>
            )}
            {item.meaning_vi && <p className="text-sm text-slate-600 dark:text-neutral-400">{item.meaning_vi}</p>}
          </>
        ) : (
          <p className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
            {item.meaning_vi || "..."}
            {item.part_of_speech_vi && (
              <span className="ml-2 align-middle text-sm font-normal text-slate-500 dark:text-neutral-400">
                ({item.part_of_speech_vi})
              </span>
            )}
          </p>
        )}

        {!result && (pinyinHint || revealed) && (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {pinyinHint && <span>{item.pinyin}</span>}
            {revealed && (
              <span className="ml-2" lang="zh">
                {revealed}
                {"＿".repeat(chars.length - Array.from(revealed).length)}
              </span>
            )}
          </p>
        )}

        <input
          ref={inputRef}
          type="text"
          lang="zh"
          value={value}
          readOnly={Boolean(result)}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={p.placeholderWord}
          aria-label={p.placeholderWord}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={`${INPUT_BASE} max-w-xs ${inputTone}`}
        />

        {result && (
          <div className="flex flex-col items-center gap-3" role="status">
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                ok ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
              }`}
            >
              {ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {p[result]}
            </span>
            {!ok && <span className="text-sm text-slate-600 dark:text-neutral-400">{p.answer}:</span>}
            <CardBack card={item} />
            {scheduleNote}
          </div>
        )}
      </div>

      {!result ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={hint} disabled={signals.hints >= maxHints} className={BTN_GHOST}>
            <Lightbulb className="w-4 h-4" /> {p.hint}
          </button>
          <button type="button" onClick={() => submit(true)} className={BTN_SECONDARY}>
            {p.giveUp}
          </button>
          <button type="button" onClick={() => submit()} className={BTN_PRIMARY}>
            {p.check}
          </button>
        </div>
      ) : (
        <button type="button" onClick={onNext} autoFocus className={BTN_PRIMARY}>
          {p.next}
        </button>
      )}
    </div>
  )
}

export default TypingExercise
