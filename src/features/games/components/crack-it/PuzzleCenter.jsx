import React, { useState, useEffect } from "react"
import { useGame } from "@/features/games/context/GameContext"
import { useLanguage } from "@/shared/context/LanguageContext"

const PuzzleCenter = () => {
  const { puzzle, currentRound } = useGame()
  const { t, language } = useLanguage()

  if (!puzzle) return null

  const hintContent = (() => {
    // Nếu ngôn ngữ UI là 'zh', ưu tiên hiển thị tiếng Trung
    if (language === "zh") {
      return puzzle.hint_zh ? (
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-medium text-slate-800">{puzzle.hint_zh}</div>
          <div className="text-lg text-slate-500">{puzzle.hint_pinyin}</div>
        </div>
      ) : puzzle.hint_en
    }

    // Nếu ngôn ngữ UI là 'vi' hoặc 'en' (hoặc khác), ưu tiên hiển thị tiếng Anh
    return puzzle.hint_en ? puzzle.hint_en : (
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-medium text-slate-800">{puzzle.hint_zh}</div>
        <div className="text-lg text-slate-500">{puzzle.hint_pinyin}</div>
      </div>
    )
  })()

  const [displayMask, setDisplayMask] = useState("")

  useEffect(() => {
    if (!puzzle) return

    const initialMask =
      puzzle.word_mask ||
      Array.from({ length: puzzle.word_count || 1 })
        .map(() => "-")
        .join("")

    const answer = puzzle.correct_answer

    if (!answer || !currentRound?.started_at) {
      setDisplayMask(initialMask)
      return
    }

    const nonSpaceIndices = []
    for (let i = 0; i < answer.length; i++) {
      if (answer[i] !== " ") {
        nonSpaceIndices.push(i)
      }
    }

    if (nonSpaceIndices.length === 0) {
      setDisplayMask(initialMask)
      return
    }

    // Deterministic random based on puzzle answer string so all clients get the same order
    let seed = 0
    for (let i = 0; i < answer.length; i++) {
      seed += answer.charCodeAt(i) * (i + 1)
    }
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    // Shuffle nonSpaceIndices deterministically
    for (let i = nonSpaceIndices.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [nonSpaceIndices[i], nonSpaceIndices[j]] = [
        nonSpaceIndices[j],
        nonSpaceIndices[i],
      ]
    }

    const delayPerChar = 60000 / (nonSpaceIndices.length + 1)
    const startedAtTime = new Date(currentRound.started_at).getTime()

    const updateMask = () => {
      const elapsedMs = Math.max(0, Date.now() - startedAtTime)
      const stepsElapsed = Math.min(Math.floor(elapsedMs / delayPerChar), nonSpaceIndices.length)

      let currentMaskArr = initialMask.split("")
      for (let i = 0; i < stepsElapsed; i++) {
        const idx = nonSpaceIndices[i]
        currentMaskArr[idx] = answer[idx]
      }
      setDisplayMask(currentMaskArr.join(""))

      if (stepsElapsed >= nonSpaceIndices.length) {
        clearInterval(interval)
      }
    }

    updateMask() // Initial update
    const interval = setInterval(updateMask, 200) // check 5 times a second

    return () => clearInterval(interval)
  }, [puzzle, currentRound?.started_at])

  return (
    <div className="flex-1 bg-white rounded-3xl shadow-md border border-gray-100 flex flex-col md:flex-row overflow-hidden min-h-0 w-full">
      {/* Left: Image Container */}
      <div className="w-full md:w-1/2 flex-1 p-6 md:p-10 flex items-center justify-center min-h-[35vh] md:min-h-0 bg-slate-50/50">
        <div className="relative w-full max-w-[300px] md:max-w-[420px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white ring-1 ring-gray-100">
          <img
            src={puzzle.image_url}
            alt="Puzzle"
            className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
          />
        </div>
      </div>

      {/* Right: Hint & Word Count */}
      <div className="w-full md:w-1/2 flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center gap-6 md:gap-8 overflow-y-auto bg-red-50/50">
        <div className="flex flex-col items-center gap-2 md:gap-4">
          <div className="text-xs md:text-sm font-black tracking-[0.3em] text-cath-red-600 uppercase">
            {t.rooms?.game?.crackIt?.hint || "Gợi ý"}
          </div>
          <div className="text-lg md:text-2xl font-semibold text-slate-800 leading-relaxed max-w-lg px-4 md:px-0">
            {hintContent}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 md:gap-4">
          <div className="text-3xl md:text-4xl font-black text-gray-400 tracking-[0.1em] mt-2">
            {displayMask}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PuzzleCenter
