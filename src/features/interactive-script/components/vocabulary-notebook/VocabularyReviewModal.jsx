import React, { useCallback, useEffect, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  RotateCcw,
  Shuffle,
  Sparkles,
  Volume2,
} from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"

const shuffleWords = (list = []) => {
  const next = [...list]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

const getWordId = (word, index) =>
  word?.id ?? word?.vocabularyId ?? word?.wordId ?? `review-${index}`

/**
 * ISS-52: client-side flashcard review built from the saved vocabulary list
 * already loaded by /interactive-vocabulary.
 */
const VocabularyReviewModal = ({ open, onClose, words = [], onPlayAudio }) => {
  const { t } = useLanguage()
  const copy = t.vocabularyNotebook?.reviewModal || {}

  const [wasOpen, setWasOpen] = useState(false)
  const [deck, setDeck] = useState(() => shuffleWords(words))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [masteredIds, setMasteredIds] = useState([])
  const [reviewAgainIds, setReviewAgainIds] = useState([])
  const [isCompleted, setIsCompleted] = useState(false)

  // Re-initialise the whole session whenever the modal is (re)opened.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setDeck(shuffleWords(words))
      setCurrentIndex(0)
      setIsFlipped(false)
      setMasteredIds([])
      setReviewAgainIds([])
      setIsCompleted(false)
    }
  }

  const currentWord = deck[currentIndex] || null
  const currentWordId = currentWord
    ? getWordId(currentWord, currentIndex)
    : null
  const isFirstCard = currentIndex <= 0
  const isLastCard = currentIndex >= deck.length - 1

  const goNext = useCallback(() => {
    setIsFlipped(false)
    setCurrentIndex((prev) => Math.min(prev + 1, Math.max(deck.length - 1, 0)))
  }, [deck.length])

  const goPrev = useCallback(() => {
    setIsFlipped(false)
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  const markCard = useCallback(
    (kind) => {
      if (!currentWordId) return
      if (kind === "mastered") {
        setMasteredIds((prev) =>
          prev.includes(currentWordId) ? prev : [...prev, currentWordId],
        )
        setReviewAgainIds((prev) => prev.filter((id) => id !== currentWordId))
      } else {
        setReviewAgainIds((prev) =>
          prev.includes(currentWordId) ? prev : [...prev, currentWordId],
        )
        setMasteredIds((prev) => prev.filter((id) => id !== currentWordId))
      }

      if (isLastCard) {
        setIsCompleted(true)
      } else {
        setIsFlipped(false)
        setCurrentIndex((prev) =>
          Math.min(prev + 1, Math.max(deck.length - 1, 0)),
        )
      }
    },
    [currentWordId, deck.length, isLastCard],
  )

  const handleShuffle = useCallback(() => {
    setDeck((prev) => shuffleWords(prev))
    setCurrentIndex(0)
    setIsFlipped(false)
    setIsCompleted(false)
  }, [])

  const handleRestart = useCallback(() => {
    setDeck(shuffleWords(words))
    setCurrentIndex(0)
    setIsFlipped(false)
    setMasteredIds([])
    setReviewAgainIds([])
    setIsCompleted(false)
  }, [words])

  const handleReviewAgain = useCallback(() => {
    const remaining = deck.filter((word, index) =>
      reviewAgainIds.includes(getWordId(word, index)),
    )
    setDeck(shuffleWords(remaining))
    setCurrentIndex(0)
    setIsFlipped(false)
    setMasteredIds([])
    setReviewAgainIds([])
    setIsCompleted(false)
  }, [deck, reviewAgainIds])

  const handlePlayAudio = useCallback(
    (event) => {
      event.stopPropagation()
      if (!currentWord) return
      onPlayAudio?.(
        currentWord.word,
        currentWord.targetLanguage || currentWord.language,
        currentWord.audioUrl,
      )
    },
    [currentWord, onPlayAudio],
  )

  // Keyboard shortcuts: Enter/Space flips, arrows navigate, Escape closes.
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      const tagName = event.target?.tagName?.toLowerCase()
      if (["input", "textarea", "select"].includes(tagName)) return

      if (event.key === "Escape") {
        event.preventDefault()
        onClose?.()
        return
      }
      if (isCompleted) return

      if (event.key === " " || event.key === "Enter") {
        if (tagName === "button") return
        event.preventDefault()
        flipCard()
      } else if (event.key === "ArrowLeft") {
        event.preventDefault()
        goPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        goNext()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [flipCard, goNext, goPrev, isCompleted, onClose, open])

  const emptyLabel =
    copy.empty || "Chưa có từ vựng nào để ôn tập."

  const renderCompletion = () => (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
        <Sparkles className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        {copy.completedTitle || "Hoàn thành phiên ôn tập!"}
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Check size={14} />
          {copy.masteredCount || "Đã nhớ"}: {masteredIds.length}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <RotateCcw size={14} />
          {copy.reviewAgainCount || "Cần ôn lại"}: {reviewAgainIds.length}
        </span>
      </div>

      <div className="mt-2 flex w-full flex-col gap-2">
        {reviewAgainIds.length > 0 && (
          <button
            type="button"
            onClick={handleReviewAgain}
            className="h-11 w-full rounded-xl bg-[#990011] text-sm font-bold text-white transition-colors hover:bg-[#7f000e] dark:bg-[#FF6B6B] dark:text-black dark:hover:bg-[#ff8585]"
          >
            {copy.reviewAgainBtn || "Ôn lại từ chưa nhớ"}
          </button>
        )}
        <button
          type="button"
          onClick={handleRestart}
          className="h-11 w-full rounded-xl border border-border bg-white text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-[#3F3F3F] dark:bg-[#242424] dark:text-neutral-200 dark:hover:bg-[#2E2E2E]"
        >
          {copy.restartBtn || "Ôn tập lại từ đầu"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-11 w-full rounded-xl text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-[#2A2A2A]"
        >
          {copy.closeBtn || "Đóng"}
        </button>
      </div>
    </div>
  )

  const renderCard = () => {
    if (!currentWord) {
      return (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-neutral-400">
          {emptyLabel}
        </p>
      )
    }

    const language = currentWord.targetLanguage || currentWord.language || ""
    const progressLabel = (
      copy.progress || "Thẻ {{current}}/{{total}}"
    )
      .replace("{{current}}", currentIndex + 1)
      .replace("{{total}}", deck.length)

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-neutral-400">
          <span>{progressLabel}</span>
          <span className="truncate max-w-[50%]">
            {currentWord.scriptName || ""}
          </span>
        </div>

        <button
          type="button"
          onClick={flipCard}
          className="relative flex min-h-[230px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-white p-6 text-center transition-colors hover:bg-slate-50 dark:border-[#3F3F3F] dark:bg-[#242424] dark:hover:bg-[#2A2A2A]"
        >
          {!isFlipped ? (
            <>
              <span className="text-xl font-bold text-slate-900 dark:text-white break-words">
                {currentWord.word}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                {currentWord.partOfSpeech && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600 dark:bg-[#333333] dark:text-neutral-300">
                    {currentWord.partOfSpeech}
                  </span>
                )}
                {language && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600 dark:bg-[#333333] dark:text-neutral-300">
                    {language}
                  </span>
                )}
                {currentWord.phonetic && (
                  <span className="text-slate-500 dark:text-neutral-400">
                    /{currentWord.phonetic}/
                  </span>
                )}
              </div>
              {onPlayAudio && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handlePlayAudio}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      handlePlayAudio(event)
                    }
                  }}
                  aria-label={copy.playAudio || "Nghe phát âm"}
                  className="mt-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-[#990011] transition-colors hover:bg-rose-100 dark:bg-rose-950/40 dark:text-[#FF6B6B] dark:hover:bg-rose-950/60"
                >
                  <Volume2 size={18} />
                </span>
              )}
              <span className="mt-2 text-xs font-medium text-slate-400 dark:text-neutral-500">
                {copy.flipHint || "Nhấn để xem nghĩa"}
              </span>
            </>
          ) : (
            <>
              <span className="text-base font-bold text-slate-900 dark:text-white break-words">
                {currentWord.word}
              </span>
              <span className="text-sm font-semibold text-slate-700 dark:text-neutral-200 break-words">
                {currentWord.meaning || "—"}
              </span>
              {currentWord.exampleSentence && (
                <span className="mt-1 text-xs italic text-slate-500 dark:text-neutral-400 break-words">
                  {currentWord.exampleSentence}
                </span>
              )}
              {currentWord.teacherNote && (
                <span className="mt-1 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 break-words">
                  {currentWord.teacherNote}
                </span>
              )}
            </>
          )}
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={isFirstCard}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-white text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#3F3F3F] dark:bg-[#242424] dark:text-neutral-300 dark:hover:bg-[#2E2E2E]"
          >
            <ArrowLeft size={14} />
            {copy.prev || "Thẻ trước"}
          </button>
          <button
            type="button"
            onClick={handleShuffle}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-white text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#3F3F3F] dark:bg-[#242424] dark:text-neutral-300 dark:hover:bg-[#2E2E2E]"
          >
            <Shuffle size={14} />
            {copy.shuffle || "Tráo thẻ"}
          </button>
          <button
            type="button"
            onClick={flipCard}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-white text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#3F3F3F] dark:bg-[#242424] dark:text-neutral-300 dark:hover:bg-[#2E2E2E]"
          >
            <ArrowRight size={14} />
            {copy.flip || "Lật thẻ"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => markCard("again")}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-amber-50 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60"
          >
            <HelpCircle size={16} />
            {copy.reviewAgain || "Cần ôn lại"}
          </button>
          <button
            type="button"
            onClick={() => markCard("mastered")}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
          >
            <Check size={16} />
            {copy.mastered || "Đã nhớ"}
          </button>
        </div>

        {!isLastCard && (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 dark:text-neutral-400 dark:hover:bg-[#2A2A2A]"
          >
            {copy.next || "Thẻ sau"}
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={copy.title || "Ôn tập từ vựng"}
      description={copy.subtitle || "Lật thẻ để ghi nhớ từ vựng đã lưu."}
      className="z-[2000] md:max-w-lg"
    >
      {isCompleted ? renderCompletion() : renderCard()}
    </Modal>
  )
}

export default VocabularyReviewModal
