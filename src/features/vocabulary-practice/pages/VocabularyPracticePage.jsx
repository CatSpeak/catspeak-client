import React, { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { BookOpenCheck, Headphones, Keyboard, Type } from "lucide-react"
import PageTitle from "@/shared/components/ui/PageTitle"
import { FEATURES } from "@/shared/config/featureFlags"
import { flashcardApi } from "@/features/ai-tutor/api/flashcardApi"
import { seededShuffle } from "@/features/ai-tutor/utils/flashcardReview"
import MiniGalaxy from "@/features/vocabulary-galaxy/components/MiniGalaxy"
import DueReminderBanner from "../components/DueReminderBanner"
import PracticeRound from "../components/PracticeRound"
import { BTN_PRIMARY, PANEL } from "../components/ui"
import { fmt } from "../i18n"
import usePracticeText from "../hooks/usePracticeText"
import { MODE_LIST, PRACTICE_MODES, supportsMode } from "../utils/practiceModes"
import { parsePracticeParams, PRACTICE_ROUTE, PRACTICE_SOURCES, sourceQuery } from "../utils/practicePaths"

const ROUND_SIZE = 10
const FETCH_LIMIT = 60

const MODE_ICON = {
  [PRACTICE_MODES.WORD]: Type,
  [PRACTICE_MODES.SENTENCE]: Keyboard,
  [PRACTICE_MODES.LISTEN]: Headphones,
  [PRACTICE_MODES.FLASHCARD]: BookOpenCheck,
}

/**
 * /workspace/vocabulary-practice?mode=&source=&autostart=1  (FE-02, FE-05, FE-03)
 *
 * Chọn chế độ + nguồn thẻ -> lấy tối đa 60 thẻ từ sổ, lọc thẻ hợp chế độ, xáo lấy 10.
 * Dữ liệu là thẻ của sổ từ vựng (staging catspeak-ai), cùng schema CardBack đang dùng.
 */
const VocabularyPracticePage = () => {
  const { p } = usePracticeText()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initial = useRef(parsePracticeParams(searchParams)).current // giá trị lúc mở trang
  const [mode, setMode] = useState(initial.mode)
  const [source, setSource] = useState(initial.source || "due")
  const [round, setRound] = useState(null) // { items, key }
  const [status, setStatus] = useState("idle") // idle | loading | empty | error
  const [fetchCards] = flashcardApi.endpoints.getDeckCards.useLazyQuery()

  const start = useCallback(async (override = {}) => {
    const m = override.mode ?? mode
    const src = override.source ?? source
    setStatus("loading")
    try {
      const page = await fetchCards({ ...sourceQuery(src), limit: FETCH_LIMIT }, true).unwrap()
      const usable = (page?.items ?? []).filter((c) => supportsMode(c, m))
      const items = seededShuffle(usable, Date.now()).slice(0, ROUND_SIZE)
      if (!items.length) {
        setStatus("empty")
        return
      }
      setStatus("idle")
      setRound({ items, mode: m, key: Date.now() })
    } catch {
      setStatus("error")
    }
  }, [fetchCards, source, mode])

  // "Ôn ngay" từ banner nhắc ôn (kể cả khi đang đứng ở trang này): vào thẳng lượt ôn,
  // rồi bỏ autostart khỏi URL để tải lại trang không tự mở lượt mới.
  const autostart = searchParams.get("autostart") === "1"
  useEffect(() => {
    if (!autostart) return
    const params = parsePracticeParams(searchParams)
    const src = params.source || source
    setMode(params.mode)
    setSource(src)
    start({ mode: params.mode, source: src })
    navigate(PRACTICE_ROUTE, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ phản ứng khi autostart bật
  }, [autostart])

  if (round) {
    return (
      <div className="flex flex-1 flex-col p-4">
        <PracticeRound
          key={round.key}
          mode={round.mode}
          items={round.items}
          fsrsEnabled={FEATURES.practiceFsrs}
          onExit={() => setRound(null)}
          onAgain={() => start({ mode: round.mode })}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <PageTitle>{p.title}</PageTitle>
        <p className="mt-1 text-sm text-slate-600 dark:text-neutral-400">{p.subtitle}</p>
      </div>

      <DueReminderBanner />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className={`${PANEL} flex flex-col gap-5 p-5`}>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">
              {p.modeLabel}
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {MODE_LIST.map((m) => {
                const Icon = MODE_ICON[m]
                const on = mode === m
                return (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setMode(m)}
                    className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                      on
                        ? "border-[#990011] dark:border-red-400 bg-rose-50 dark:bg-rose-950/30"
                        : "border-slate-200 dark:border-[#3F3F3F] hover:bg-slate-50 dark:hover:bg-[#242424]"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${on ? "text-[#990011] dark:text-red-400" : "text-slate-500 dark:text-neutral-400"}`} />
                    <b className="text-sm text-slate-900 dark:text-white">{p.modes[m].name}</b>
                    <small className="text-xs text-slate-500 dark:text-neutral-400">{p.modes[m].desc}</small>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">
              {p.sourceLabel}
            </h3>
            <div className="inline-flex flex-wrap gap-1 rounded-full bg-slate-100 dark:bg-[#242424] p-1">
              {PRACTICE_SOURCES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={source === s}
                  onClick={() => setSource(s)}
                  className={`h-8 rounded-full px-4 text-sm font-medium cursor-pointer ${
                    source === s
                      ? "bg-white dark:bg-[#3A3A3A] text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {p.sources[s]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-neutral-400">{fmt(p.poolHint, { n: ROUND_SIZE })}</p>
          </div>

          {status === "empty" && <p className="text-sm text-amber-700 dark:text-amber-400">{p.emptyPool}</p>}
          {status === "error" && <p className="text-sm text-rose-700 dark:text-rose-400">{p.loadError}</p>}

          <div>
            <button type="button" onClick={() => start()} disabled={status === "loading"} className={BTN_PRIMARY}>
              {status === "loading" ? p.loading : status === "error" ? p.retry : p.start}
            </button>
          </div>
        </section>

        {FEATURES.vocabGalaxy && (
          <aside className="flex flex-col gap-3">
            <MiniGalaxy />
          </aside>
        )}
      </div>
    </div>
  )
}

export default VocabularyPracticePage
