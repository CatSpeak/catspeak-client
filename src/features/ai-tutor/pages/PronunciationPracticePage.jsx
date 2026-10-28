import React, { useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, Loader2, Mic, Square } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetDeckCardsQuery, useGetFlashcardDrillStatusQuery } from "../api/flashcardApi"
import { speakingErrorCode, useRetrySpeakingPronunciationMutation } from "../api/speakingPedagogyApi"
import AudioButton from "../components/flashcard/AudioButton"
import useShortRecorder from "../hooks/useShortRecorder"
import { notebookPaths } from "../utils/flashcardReview"

const scoreTone = (score) =>
  score >= 80 ? "text-emerald-700 bg-emerald-50" : score >= 60 ? "text-amber-700 bg-amber-50" : "text-rose-700 bg-rose-50"

/**
 * Luyện phát âm từ thẻ (FR-FC-020, CHK-142, CHK-144): mặc định các từ trong deck
 * "Từ sai gần đây". Nghe giọng mẫu, thu âm, chấm lại bằng pronunciation-feedback
 * (POST /v1/speaking/pronunciation/retry), xem từng âm tiết và thanh điệu.
 *
 * Dịch vụ chấm phát âm tạm thời không dùng được thì báo rõ, thẻ vẫn xem và nghe được.
 */
const PronunciationPracticePage = () => {
  const navigate = useNavigate()
  const { lang: paramLang } = useParams()
  const { language } = useLanguage()
  const lang = paramLang || language || "vi"
  const paths = notebookPaths(lang)
  const [params] = useSearchParams()
  const deckId = params.get("deck") || "recent-wrong"

  const { data = { items: [] }, isLoading } = useGetDeckCardsQuery({ deckId, limit: 50 })
  const { data: drill, isError: drillError } = useGetFlashcardDrillStatusQuery()
  const [retry] = useRetrySpeakingPronunciationMutation()

  // Mỗi từ một lần (thẻ Nghĩa và thẻ Phát âm của cùng từ gộp lại).
  const words = useMemo(() => {
    const seen = new Set()
    return (data.items || []).filter((c) => {
      const key = `${c.word}|${c.pinyin || ""}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [data.items])

  const [index, setIndex] = useState(0)
  const [results, setResults] = useState({}) // word -> { score, syllables, ... } | { error }
  const [scoring, setScoring] = useState(false)
  const current = words[Math.min(index, Math.max(0, words.length - 1))]
  const available = drill ? drill.available : !drillError
  const unavailableMessage =
    drill?.message || "Luyện phát âm tạm thời không khả dụng. Bạn vẫn xem và nghe thẻ được."
  const [unavailable, setUnavailable] = useState(false)

  const recorder = useShortRecorder({
    maxMs: 4000,
    onDone: async (blob) => {
      if (!current) return
      setScoring(true)
      const previous = results[current.word]?.score ?? null
      try {
        const res = await retry({ audioBlob: blob, text: current.word, previousScore: previous }).unwrap()
        setResults((r) => ({ ...r, [current.word]: res }))
      } catch (err) {
        const status = err?.status
        if (status === 503 || speakingErrorCode(err) === "SPEAKING_PRONUNCIATION_UNAVAILABLE") setUnavailable(true)
        const message = err?.data?.detail?.message || "Chưa chấm được, bạn thử nói lại nhé."
        setResults((r) => ({ ...r, [current.word]: { error: message } }))
      } finally {
        setScoring(false)
      }
    },
  })

  const blocked = !available || unavailable
  const result = current ? results[current.word] : null

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 pb-12">
      <button
        type="button"
        onClick={() => navigate(paths.deck(deckId))}
        className="inline-flex w-fit items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#680411]"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại bộ thẻ
      </button>
      <h1 className="text-2xl font-black text-slate-900">Luyện phát âm</h1>
      <p className="-mt-3 text-sm text-slate-500">
        {deckId === "recent-wrong" ? "Các từ bạn nói sai trong 7 ngày gần đây." : "Các từ trong bộ thẻ này."} Nghe mẫu,
        bấm thu âm rồi đọc to từ đó.
      </p>

      {blocked && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{unavailableMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      ) : words.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">
          Chưa có từ nào để luyện. Từ bạn nói sai trong buổi luyện nói sẽ xuất hiện ở đây.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">
            Từ {Math.min(index, words.length - 1) + 1}/{words.length}
          </span>
          <div className="text-5xl font-semibold text-slate-900 sm:text-6xl" lang="zh">
            {current.word}
          </div>
          {current.pinyin && <div className="text-lg text-slate-600">{current.pinyin}</div>}
          {current.meaning_vi && <div className="text-sm text-slate-500">{current.meaning_vi}</div>}
          <AudioButton audioPath={current.audio_url} pinyin={current.pinyin} size="lg" label={`Nghe mẫu ${current.word}`} />

          <button
            type="button"
            disabled={blocked || scoring}
            onClick={recorder.toggle}
            className={`inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold text-white transition ${
              recorder.isRecording ? "bg-rose-600 animate-pulse" : "bg-[#990011] hover:brightness-95"
            } disabled:cursor-not-allowed disabled:bg-slate-300`}
          >
            {scoring ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang chấm...
              </>
            ) : recorder.isRecording ? (
              <>
                <Square className="h-4 w-4 fill-current" /> Dừng thu âm
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" /> Nhấn để thu âm
              </>
            )}
          </button>
          {recorder.error && (
            <p className="text-sm text-rose-700">
              {recorder.error === "permission" ? "Hãy cho phép dùng micro để luyện phát âm." : "Không mở được micro trên thiết bị này."}
            </p>
          )}

          {result?.error && <p className="text-sm text-rose-700">{result.error}</p>}
          {result && !result.error && (
            <div className="w-full text-left" data-testid="drill-result">
              <div className="flex items-center justify-center gap-3">
                <span className={`rounded-full px-4 py-1.5 text-lg font-black ${scoreTone(result.score)}`}>{result.score}/100</span>
                {result.delta != null && (
                  <span className={`text-sm font-bold ${result.delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    {result.delta >= 0 ? "+" : ""}
                    {result.delta} so với lần trước
                  </span>
                )}
              </div>
              {result.result_label && <p className="mt-2 text-center text-sm text-slate-600">{result.result_label}</p>}
              {result.syllables?.length > 0 && (
                <ul className="mt-4 flex flex-wrap justify-center gap-2">
                  {result.syllables.map((s) => (
                    <li
                      key={s.index}
                      className={`flex min-w-16 flex-col items-center rounded-xl border px-3 py-2 ${
                        s.is_correct ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
                      }`}
                    >
                      <span className="text-xl" lang="zh">{s.han}</span>
                      <span className="text-xs text-slate-600">{s.pinyin}</span>
                      {s.tone_name && <span className="text-[11px] text-slate-500">{s.tone_name}</span>}
                      {s.note && <span className="mt-1 text-[11px] text-rose-700">{s.note}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex w-full items-center justify-between pt-2">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Từ trước
            </button>
            <button
              type="button"
              disabled={index >= words.length - 1}
              onClick={() => setIndex((i) => Math.min(words.length - 1, i + 1))}
              className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 disabled:opacity-40"
            >
              Từ tiếp <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PronunciationPracticePage
