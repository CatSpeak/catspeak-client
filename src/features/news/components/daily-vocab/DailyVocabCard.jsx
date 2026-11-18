import React, { useState, useRef } from "react"
import { Volume2, VolumeX, Sparkles, BookOpen, Check, Bookmark } from "lucide-react"
import { toast } from "@/components/ui/toast"

const DailyVocabCard = ({
  data,
  onSave,
  onKnown,
  onReview,
  isSaving = false,
  isReviewing = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const { mode, vocabulary, state } = data || {}
  if (!vocabulary) return null

  const isReviewMode = mode === "review"
  const isNewMode = mode === "new"

  // BR-VOCAB-06: Phát âm từ vựng. Bấm lại thì phát lại từ đầu. Lỗi thì báo toast
  const handlePlayAudio = () => {
    if (!vocabulary.audioUrl) {
      toast.error("Không thể phát âm")
      return
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      const audio = new Audio(vocabulary.audioUrl)
      audioRef.current = audio
      setIsPlaying(true)

      audio.onended = () => {
        setIsPlaying(false)
      }

      audio.onerror = () => {
        setIsPlaying(false)
        toast.error("Không thể phát âm")
      }

      audio.play().catch(() => {
        setIsPlaying(false)
        toast.error("Không thể phát âm")
      })
    } catch {
      setIsPlaying(false)
      toast.error("Không thể phát âm")
    }
  }

  // Highlight từ vựng trong câu ví dụ (màu đỏ in đậm)
  const renderExampleSentence = () => {
    const sentence = vocabulary.exampleSentence || ""
    const targetWord = vocabulary.word || ""
    if (!targetWord || !sentence.includes(targetWord)) {
      return <span>{sentence}</span>
    }

    const parts = sentence.split(targetWord)
    return (
      <span>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="text-cath-red-600 font-bold underline decoration-cath-red-300">
                {targetWord}
              </span>
            )}
          </React.Fragment>
        ))}
      </span>
    )
  }

  return (
    <div className="bg-white dark:bg-cardBg rounded-2xl border border-border shadow-sm p-5 space-y-4 transition-all">
      {/* 1. Header thẻ */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          {isReviewMode ? (
            <Sparkles className="w-5 h-5 text-cath-red-600" />
          ) : (
            <BookOpen className="w-5 h-5 text-cath-red-600" />
          )}
          <span className="font-bold text-sm uppercase tracking-wide text-gray-900 dark:text-gray-100">
            {isReviewMode ? "ÔN TẬP TỪ VỰNG" : "TỪ VỰNG CỦA NGÀY"}
          </span>
        </div>

        {/* Level badge */}
        {vocabulary.level && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cath-red-50 dark:bg-cath-red-950/40 text-cath-red-700 dark:text-cath-red-400 border border-cath-red-200 dark:border-cath-red-900/50">
            {vocabulary.level}
          </span>
        )}
      </div>

      {/* 2. Khu vực Từ vựng & Cách đọc */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
            {vocabulary.word}
          </span>

          {/* Nút Audio BR-VOCAB-06 */}
          <button
            type="button"
            onClick={handlePlayAudio}
            className={`p-2 rounded-xl transition-all ${
              isPlaying
                ? "bg-cath-red-600 text-white animate-pulse"
                : "bg-gray-100 dark:bg-hoverBg text-gray-700 dark:text-gray-300 hover:text-cath-red-600"
            }`}
            title="Nghe phát âm"
          >
            {isPlaying ? <Volume2 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm flex-wrap">
          {/* BR-VOCAB-05: Cách đọc màu đỏ */}
          <span className="text-cath-red-600 dark:text-cath-red-400 font-medium font-mono">
            {vocabulary.reading}
          </span>
          {vocabulary.partOfSpeech && (
            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
              • {vocabulary.partOfSpeech}
            </span>
          )}
        </div>
      </div>

      {/* 3. Khu vực Nghĩa & Ví dụ */}
      <div className="space-y-2">
        <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
          {vocabulary.meaningVi}
        </p>

        {/* Khung xám câu ví dụ và câu dịch BR-VOCAB-04 */}
        <div className="bg-gray-50 dark:bg-hoverBg/50 rounded-xl p-3 border border-border/60 text-xs space-y-1.5">
          <p className="text-gray-900 dark:text-gray-100 font-semibold leading-relaxed">
            {renderExampleSentence()}
          </p>
          {vocabulary.exampleSentenceVi && (
            <p className="text-gray-600 dark:text-gray-400 italic">
              {vocabulary.exampleSentenceVi}
            </p>
          )}
        </div>
      </div>

      {/* 4. Khu vực thao tác */}
      {isNewMode && (
        <div className="flex items-center gap-2 pt-1">
          {/* Nút [Đã biết] (Ẩn khi đã lưu - BR-VOCAB-10) */}
          {!state?.isSaved && (
            <button
              type="button"
              onClick={onKnown}
              disabled={state?.isKnown}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-xl border transition-colors ${
                state?.isKnown
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 cursor-not-allowed"
                  : "border-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-hoverBg"
              }`}
            >
              {state?.isKnown ? "Đã biết" : "Đã biết"}
            </button>
          )}

          {/* Nút [Lưu vào sổ tay Flashcard] / [Đã lưu] (BR-VOCAB-08, BR-VOCAB-09, BR-VOCAB-10) */}
          <button
            type="button"
            onClick={onSave}
            disabled={state?.isSaved || isSaving}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              state?.isSaved
                ? "bg-gray-100 dark:bg-hoverBg text-gray-500 cursor-not-allowed border border-border"
                : "bg-cath-red-600 hover:bg-cath-red-700 text-white"
            }`}
          >
            {state?.isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã lưu</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isSaving ? "Đang lưu..." : "Lưu vào sổ tay Flashcard"}</span>
              </>
            )}
          </button>
        </div>
      )}

      {isReviewMode && (
        <div className="flex items-center gap-2 pt-1">
          {/* Nút [Chưa thuộc] */}
          <button
            type="button"
            onClick={() => onReview("needs_review")}
            disabled={state?.isReviewDisabled || isReviewing}
            className="flex-1 py-2 px-3 text-xs font-medium rounded-xl border border-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-hoverBg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Chưa thuộc
          </button>

          {/* Nút [Đã thuộc] */}
          <button
            type="button"
            onClick={() => onReview("mastered")}
            disabled={state?.isReviewDisabled || isReviewing}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-cath-red-600 hover:bg-cath-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Đã thuộc
          </button>
        </div>
      )}
    </div>
  )
}

export default DailyVocabCard
