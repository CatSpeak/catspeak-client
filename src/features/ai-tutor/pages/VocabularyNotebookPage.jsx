import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ChevronRight, Layers, Plus } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  isNetworkError,
  useGetDeckCardsQuery,
  useGetFlashcardDecksQuery,
  useGetFlashcardHomeQuery,
} from "../api/flashcardApi"
import { FlashcardHeroBanner, FlashcardStatCards, RecentWrongList, SystemDecksSection } from "../components/flashcards"
import { FlashcardLoadError, FlashcardSkeleton } from "../components/flashcards/FlashcardPageState"
import { useReportQueryNetwork } from "../hooks/useOnlineStatus"
import { flashcardReviewPath, notebookPaths } from "../utils/flashcardReview"

const EMPTY_HOME = { total_cards: 0, due_today_count: 0, overdue_count: 0, recent_wrong_count: 0, streak_days: 0 }

/**
 * fc01 Flashcard Home: "X thẻ cần ôn hôm nay", Bắt đầu ôn, Ôn tập (ôn tự do),
 * Tiếp tục ôn (phiên đang dở), thống kê (tổng thẻ, đến hạn, chuỗi ngày), Từ sai gần
 * đây, deck hệ thống, thêm từ thủ công.
 */
const VocabularyNotebookPage = () => {
  const navigate = useNavigate()
  const { lang: paramLang } = useParams()
  const { language, t } = useLanguage()
  const lang = paramLang || language || "vi"
  const paths = notebookPaths(lang)

  const homeQuery = useGetFlashcardHomeQuery(undefined, { refetchOnMountOrArgChange: true })
  const { data: home = EMPTY_HOME, isLoading, isError, error, refetch } = homeQuery
  const { data: decks = [] } = useGetFlashcardDecksQuery()
  const { data: wrong = { items: [], total: 0 } } = useGetDeckCardsQuery({ deckId: "recent-wrong", limit: 6 })
  useReportQueryNetwork(homeQuery)

  const title = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-800">
          <Layers className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          {t?.aiTutor?.vocabularyNotebook?.title || "Sổ tay từ vựng"}
        </h1>
      </div>
      <button
        type="button"
        onClick={() => navigate(paths.add)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-[#680411] shadow-xs hover:bg-rose-50"
      >
        <Plus className="h-4 w-4" />
        Thêm thủ công
      </button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-12">
        {title}
        <FlashcardSkeleton />
      </div>
    )
  }

  if (isError && !homeQuery.data) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-12">
        {title}
        <FlashcardLoadError offline={isNetworkError(error)} onRetry={refetch} />
      </div>
    )
  }

  const active = home.active_session || null

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-12">
      {title}
      <FlashcardHeroBanner
        dueCount={home.due_today_count}
        totalCards={home.total_cards}
        overdueCount={home.overdue_count || 0}
        activeSession={active}
        onStartDue={() => navigate(flashcardReviewPath(lang))}
        onStartFree={() => navigate(flashcardReviewPath(lang, { mode: "free", deckId: "all" }))}
        onResume={() => active && navigate(flashcardReviewPath(lang, { mode: active.mode, sessionId: active.session_id }))}
        onStartSpeaking={() => navigate(`/${lang}/ai-tutor/speaking-room`)}
      />
      <FlashcardStatCards totalCards={home.total_cards} dueCount={home.due_today_count} streakDays={home.streak_days || 0} />
      {home.total_cards > 0 && (
        <RecentWrongList
          items={wrong.items}
          total={home.recent_wrong_count || wrong.total || 0}
          onOpen={() => navigate(paths.deck("recent-wrong"))}
          onPractice={() => navigate(paths.practice("recent-wrong"))}
        />
      )}
      <div className="flex items-center justify-between pt-2">
        <span className="sr-only">Danh mục bộ thẻ</span>
        <button
          type="button"
          onClick={() => navigate(paths.decks)}
          className="ml-auto inline-flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-[#680411]"
        >
          Xem tất cả bộ thẻ và thư mục
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <SystemDecksSection decks={decks} onSelectDeck={(deckId) => navigate(paths.deck(deckId))} />
    </div>
  )
}

export default VocabularyNotebookPage
