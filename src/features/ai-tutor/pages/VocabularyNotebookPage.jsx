import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Layers } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetDeckCardsQuery, useGetFlashcardDecksQuery, useGetFlashcardHomeQuery } from "../api/flashcardApi"
import { FlashcardHeroBanner, FlashcardStatCards, RecentWrongList, SystemDecksSection } from "../components/flashcards"
import { flashcardReviewPath } from "../utils/flashcardReview"

const VocabularyNotebookPage = () => {
  const navigate = useNavigate(); const { lang: paramLang } = useParams(); const { language, t } = useLanguage(); const lang = paramLang || language || "vi"
  const { data: home = { total_cards: 0, due_today_count: 0, recent_wrong_count: 0 }, isLoading, isError } = useGetFlashcardHomeQuery()
  const { data: decks = [] } = useGetFlashcardDecksQuery()
  const { data: wrong = { items: [] } } = useGetDeckCardsQuery({ deckId: "recent-wrong", limit: 3 })
  if (isError) return <div className="p-8 text-center text-sm text-slate-500">Không thể tải sổ từ vựng.</div>
  if (isLoading) return <div className="p-8 text-center text-sm text-slate-500">Đang tải sổ từ vựng...</div>
  return <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-12">
    <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-800"><Layers className="h-5 w-5" /></div><h1 className="text-2xl font-black text-slate-900">{t?.aiTutor?.vocabularyNotebook?.title || "Sổ tay từ vựng"}</h1></div>
    <FlashcardHeroBanner dueCount={home.due_today_count} totalCards={home.total_cards} onStartDue={() => navigate(flashcardReviewPath(lang))} onStartSpeaking={() => navigate(`/${lang}/ai-tutor/speaking-room`)} />
    <FlashcardStatCards totalCards={home.total_cards} dueCount={home.due_today_count} />
    {home.total_cards > 0 && <RecentWrongList items={wrong.items} />}
    <SystemDecksSection decks={decks} onSelectDeck={(deckId) => navigate(`/${lang}/ai-tutor/vocabulary-notebook/decks/${deckId}`)} />
  </div>
}
export default VocabularyNotebookPage
