import React, { useState, useEffect } from 'react'
import { useGame } from "@/features/games/context/GameContext"
import { useLanguage } from "@/shared/context/LanguageContext"

const PuzzleCenter = () => {
  const { puzzle, currentRound } = useGame()
  const { t, language } = useLanguage()

  const [displayMask, setDisplayMask] = useState("")

  useEffect(() => {
    if (!puzzle) return;

    const initialMask =
      puzzle.word_mask ||
      Array.from({ length: puzzle.word_count || 1 })
        .map(() => "-")
        .join("");

    const answer = puzzle.correct_answer;

    if (!answer || !currentRound?.started_at) {
      setDisplayMask(initialMask);
      return;
    }

    const nonSpaceIndices = [];
    for (let i = 0; i < answer.length; i++) {
      if (answer[i] !== " ") {
        nonSpaceIndices.push(i);
      }
    }

    if (nonSpaceIndices.length === 0) {
      setDisplayMask(initialMask);
      return;
    }

    // Deterministic random based on puzzle answer string so all clients get the same order
    let seed = 0;
    for (let i = 0; i < answer.length; i++) {
      seed += answer.charCodeAt(i) * (i + 1);
    }
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Shuffle nonSpaceIndices deterministically
    for (let i = nonSpaceIndices.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [nonSpaceIndices[i], nonSpaceIndices[j]] = [
        nonSpaceIndices[j],
        nonSpaceIndices[i],
      ];
    }

    const delayPerChar = 60000 / (nonSpaceIndices.length + 1);
    const startedAtTime = new Date(currentRound.started_at).getTime();

    let interval;
    const updateMask = () => {
      const elapsedMs = Math.max(0, Date.now() - startedAtTime);
      const stepsElapsed = Math.min(
        Math.floor(elapsedMs / delayPerChar),
        nonSpaceIndices.length,
      );

      let currentMaskArr = initialMask.split("");
      for (let i = 0; i < stepsElapsed; i++) {
        const idx = nonSpaceIndices[i];
        currentMaskArr[idx] = answer[idx];
      }
      setDisplayMask(currentMaskArr.join(""));

      if (stepsElapsed >= nonSpaceIndices.length) {
        if (interval) clearInterval(interval);
      }
    };

    updateMask();
    interval = setInterval(updateMask, 200);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [puzzle, currentRound?.started_at]);

  if (!puzzle) {
    return (
      <div className="flex-1 bg-slate-50 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-500 min-h-[180px] w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cath-red-600 mb-3" />
        <p className="font-semibold text-base">{t.rooms?.game?.crackIt?.waitingStart || "Đang đồng bộ ván đấu..."}</p>
      </div>
    )
  }

  const hintContent = (() => {
    if (language === "zh") {
      return puzzle.hint_zh ? (
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-medium text-slate-800">{puzzle.hint_zh}</div>
          <div className="text-lg text-slate-500">{puzzle.hint_pinyin}</div>
        </div>
      ) : puzzle.hint_en
    }

    return puzzle.hint_en ? puzzle.hint_en : (
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-medium text-slate-800">{puzzle.hint_zh}</div>
        <div className="text-lg text-slate-500">{puzzle.hint_pinyin}</div>
      </div>
    )
  })()

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-border flex flex-col md:flex-row overflow-hidden min-h-0 w-full">
      {/* Trái: Ảnh full — object-cover, không thừa khoảng trống */}
      <div className="w-full md:w-1/2 flex-1 min-h-0 p-2 sm:p-3 md:p-4 flex items-center justify-center bg-slate-50/50 overflow-hidden">
        <div className="relative h-full w-auto max-h-full aspect-square rounded-2xl overflow-hidden shadow-md border-2 md:border-4 border-white ring-1 ring-gray-100">
          <img
            src={puzzle.image_url}
            alt="Puzzle"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Phải: Hint + Word Mask — gọn, dễ đọc */}
      <div className="w-full md:w-1/2 shrink-0 md:flex-1 p-3 sm:p-4 md:p-6 flex flex-col items-center justify-center text-center gap-2 md:gap-4 bg-red-50/30 md:bg-red-50/50">
        <div className="flex flex-col items-center gap-1 md:gap-2">
          <div className="text-xs md:text-sm font-black tracking-[0.2em] md:tracking-[0.3em] text-cath-red-600 uppercase">
            {t.rooms?.game?.crackIt?.hint || "Gợi ý"}
          </div>
          <div className="text-base sm:text-lg md:text-2xl font-semibold text-slate-800 leading-snug md:leading-relaxed max-w-lg px-2 md:px-0">
            {hintContent}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 md:gap-2">
          <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-500 tracking-[0.1em]">
            {displayMask}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PuzzleCenter