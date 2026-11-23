import React from "react"
import { Check, RotateCcw, X } from "lucide-react"
import { fmt } from "../i18n"
import usePracticeText from "../hooks/usePracticeText"
import { BTN_PRIMARY, BTN_SECONDARY, PANEL } from "./ui"
import ScheduleNote from "./ScheduleNote"

/** Tổng kết lượt ôn: số thẻ nhớ, thời gian trung bình, gợi ý, lịch ôn từng thẻ. */
const PracticeSummary = ({ results, total, schedules, graded, onExit, onAgain }) => {
  const { p } = usePracticeText()
  const remembered = results.filter((r) => r.isCorrect).length
  const timed = results.filter((r) => r.elapsedMs > 0)
  const avg = timed.length ? timed.reduce((s, r) => s + r.elapsedMs, 0) / timed.length / 1000 : 0
  const hints = results.reduce((s, r) => s + (r.hintsUsed || 0), 0)

  return (
    <div className={`${PANEL} w-full max-w-2xl mx-auto px-5 py-8 flex flex-col items-center gap-5 text-center`}>
      <div className="text-4xl" aria-hidden="true">
        🎉
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{p.doneTitle}</h2>
      <p className="text-sm text-slate-600 dark:text-neutral-300">
        {fmt(p.doneStats, { c: remembered, n: results.length || total, s: avg.toFixed(1) })}
        {hints > 0 && <> · {fmt(p.doneHints, { h: hints })}</>}
      </p>

      {results.length > 0 && (
        <ul className="w-full max-w-md divide-y divide-slate-100 dark:divide-[#2A2A2A] text-left">
          {results.map((r) => (
            <li key={r.cardId} className="flex items-center gap-3 py-2">
              {r.isCorrect ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <X className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span lang="zh" className="font-semibold text-slate-800 dark:text-neutral-100">
                {r.word}
              </span>
              {graded && r.reviewId && (
                <ScheduleNote
                  className="ml-auto"
                  schedule={schedules[r.reviewId]}
                  queued={!schedules[r.reviewId]}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onExit} className={BTN_SECONDARY}>
          {p.back}
        </button>
        <button type="button" onClick={onAgain} autoFocus className={BTN_PRIMARY}>
          <RotateCcw className="w-4 h-4" /> {p.again}
        </button>
      </div>
    </div>
  )
}

export default PracticeSummary
