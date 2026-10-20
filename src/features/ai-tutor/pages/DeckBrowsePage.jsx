import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, Layers, Lock, Mic, Search, X } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  isNetworkError,
  useGetDeckCardsQuery,
  useGetFlashcardDecksQuery,
  useGetFlashcardFoldersQuery,
} from "../api/flashcardApi"
import { FlashcardLoadError } from "../components/flashcards/FlashcardPageState"
import FlashcardCardList from "../components/flashcards/library/FlashcardCardList"
import useCardActions from "../components/flashcards/library/useCardActions"
import { useReportQueryNetwork } from "../hooks/useOnlineStatus"
import { flashcardReviewPath, notebookPaths } from "../utils/flashcardReview"

const PAGE = 50
const MAX_SELECT = 20

// Chip lọc (CHK-094). Nhãn theo ngôn ngữ người học, không lộ khái niệm "hộp" (FR-FC-010).
const FILTERS = [
  { id: null, label: "Tất cả" },
  { id: "due", label: "Cần ôn" },
  { id: "learning", label: "Đang học" },
  { id: "long_term", label: "Nhớ lâu dài" },
  { id: "known", label: "Đã biết" },
]

const folderIdOf = (deckId) => {
  const m = /^folder-(\d+)$/.exec(deckId || "")
  return m ? Number(m[1]) : null
}

/**
 * fc05 Browse thẻ trong một deck (FR-FC-015, FR-FC-016): chỉ đọc với lịch ôn.
 *
 *   - Deck trống: số 0 + empty state, nút "Ôn tập" bị khoá (CHK-093).
 *   - Chip lọc Tất cả / Cần ôn / Đang học / Nhớ lâu dài / Đã biết, ô tìm trong deck.
 *   - "Ôn tập" = ôn tự do cả deck; chọn thẻ rồi "Ôn N thẻ đã chọn" (FR-FC-021).
 *   - Menu từng thẻ (fc11): Đã biết rồi, thêm vào thư mục, xoá có hoàn tác.
 *   - Deck "Từ sai gần đây" (fc12) có lối vào "Luyện phát âm" (FR-FC-020).
 */
const DeckBrowsePage = () => {
  const navigate = useNavigate()
  const { lang: paramLang, deckId } = useParams()
  const { language } = useLanguage()
  const lang = paramLang || language || "vi"
  const paths = notebookPaths(lang)

  const [status, setStatus] = useState(null)
  const [term, setTerm] = useState("")
  const [search, setSearch] = useState("")
  const [limit, setLimit] = useState(PAGE)
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState(() => new Set())
  const { handlers, ui } = useCardActions()

  useEffect(() => {
    const t = setTimeout(() => setSearch(term.trim()), 300)
    return () => clearTimeout(t)
  }, [term])

  const folderId = folderIdOf(deckId)
  const { data: decks = [] } = useGetFlashcardDecksQuery(undefined, { skip: folderId != null })
  const { data: folders } = useGetFlashcardFoldersQuery(undefined, { skip: folderId == null })
  const cardsQuery = useGetDeckCardsQuery({ deckId, limit, search, status })
  const { data = { items: [], total: 0 }, isLoading, isFetching, isError, error, refetch } = cardsQuery
  // Tổng của cả deck (không lọc) để quyết định empty state và nút "Ôn tập".
  const { data: whole } = useGetDeckCardsQuery({ deckId, limit: 1 })
  useReportQueryNetwork(cardsQuery)

  const folder = folders?.items?.find((f) => f.id === folderId)
  const deck = useMemo(() => {
    if (folderId != null) return { name: folder?.name || "Thư mục", category: "folder" }
    if (deckId === "all") return { name: "Toàn bộ sổ", category: "system" }
    return decks.find((item) => item.id === deckId) || { name: deckId, category: "system" }
  }, [decks, deckId, folder, folderId])

  const deckTotal = whole?.total ?? data.total ?? 0
  const deckEmpty = !isLoading && deckTotal === 0
  const isRecentWrong = deckId === "recent-wrong"

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < MAX_SELECT) next.add(id)
      return next
    })

  const startSelected = () =>
    navigate(flashcardReviewPath(lang, { mode: "free", cardIds: [...selected] }))

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-24">
      <button
        type="button"
        onClick={() => navigate(paths.decks)}
        className="inline-flex w-fit items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#680411]"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh mục bộ thẻ
      </button>

      <nav aria-label="Đường dẫn" className="text-xs font-medium text-slate-500">
        <button type="button" onClick={() => navigate(paths.home)} className="hover:text-[#680411]">Sổ tay từ vựng</button>
        <span className="mx-1.5">/</span>
        <button type="button" onClick={() => navigate(paths.decks)} className="hover:text-[#680411]">Bộ thẻ</button>
        <span className="mx-1.5">/</span>
        <span className="text-slate-700">{deck.name}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {deck.category === "folder" ? "Thư mục" : "Bộ thẻ"}: {deck.name}
          </h1>
          <span className="text-sm font-semibold text-slate-500">{deckTotal} thẻ</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isRecentWrong && (
            <button
              type="button"
              disabled={deckEmpty}
              onClick={() => navigate(paths.practice("recent-wrong"))}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 font-bold text-[#680411] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mic className="h-4 w-4" />
              Luyện phát âm
            </button>
          )}
          <button
            type="button"
            disabled={deckEmpty}
            aria-disabled={deckEmpty}
            title={deckEmpty ? "Deck chưa có từ nào để ôn" : "Ôn tự do cả bộ thẻ, kể cả thẻ chưa đến hạn"}
            onClick={() => navigate(flashcardReviewPath(lang, { mode: "free", deckId }))}
            className="inline-flex items-center gap-2 rounded-xl bg-[#680411] px-6 py-2.5 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Ôn tập <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1 text-xs font-bold text-[#680411]">
          <Lock className="h-3.5 w-3.5" />
          Chỉ đọc - không ảnh hưởng lịch ôn
        </span>
        {folder?.read_only && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-700">
            Thư mục chỉ đọc (vượt giới hạn gói Free)
          </span>
        )}
      </div>

      {deckEmpty ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white px-6 py-14 text-center shadow-sm" data-testid="deck-empty">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-[#680411]">
            <Layers className="h-6 w-6" />
          </div>
          <p className="text-base font-bold text-slate-900">Deck chưa có từ nào</p>
          <p className="max-w-sm text-sm text-slate-500">
            Luyện nói với AI để thêm từ mới vào sổ, hoặc thêm từ thủ công.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/${lang}/ai-tutor/speaking-room`)}
              className="h-10 rounded-full bg-[#990011] px-6 text-sm font-semibold text-white"
            >
              Đi luyện nói
            </button>
            <button
              type="button"
              onClick={() => navigate(paths.add)}
              className="h-10 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700"
            >
              Thêm thủ công
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc thẻ">
              {FILTERS.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  aria-pressed={status === f.id}
                  data-testid={`chip-${f.id || "all"}`}
                  onClick={() => {
                    setStatus(f.id)
                    setLimit(PAGE)
                  }}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                    status === f.id ? "bg-[#680411] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="relative flex-1 md:w-64 md:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Tìm trong bộ thẻ..."
                  aria-label="Tìm trong bộ thẻ"
                  className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-[#990011]"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setSelecting((v) => !v)
                  setSelected(new Set())
                }}
                className="h-10 whitespace-nowrap rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                {selecting ? "Bỏ chọn" : "Chọn thẻ để ôn"}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-2" aria-busy="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : isError && !cardsQuery.data ? (
            <FlashcardLoadError offline={isNetworkError(error)} onRetry={refetch} what="bộ thẻ" />
          ) : data.items.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">
              Không có thẻ nào khớp bộ lọc này.
            </div>
          ) : (
            <>
              <FlashcardCardList
                items={data.items}
                selectable={selecting}
                selectedIds={selected}
                onToggleSelect={toggle}
                {...handlers}
              />
              {data.next_cursor && limit >= 100 && (
                <p className="text-center text-xs text-slate-500">
                  Đang hiện 100/{data.total} thẻ. Dùng ô tìm hoặc chip lọc để xem các thẻ còn lại.
                </p>
              )}
              {data.next_cursor && limit < 100 && (
                <button
                  type="button"
                  disabled={isFetching}
                  onClick={() => setLimit((n) => Math.min(100, n + PAGE))}
                  className="mx-auto h-10 rounded-full border border-slate-200 px-6 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  {isFetching ? "Đang tải..." : `Xem thêm (${data.total - data.items.length} thẻ)`}
                </button>
              )}
            </>
          )}
        </>
      )}

      {selecting && selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-[1100] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-slate-200">
          <span className="flex-1 text-sm font-semibold text-slate-700">
            Đã chọn {selected.size}/{MAX_SELECT} thẻ
          </span>
          <button type="button" aria-label="Bỏ chọn tất cả" onClick={() => setSelected(new Set())} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={startSelected}
            className="h-10 rounded-full bg-[#990011] px-5 text-sm font-semibold text-white hover:brightness-95"
          >
            Ôn {selected.size} thẻ đã chọn
          </button>
        </div>
      )}

      {ui}
    </div>
  )
}

export default DeckBrowsePage
