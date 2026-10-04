import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, Lock } from "lucide-react"
import { useGetDeckCardsQuery, useGetFlashcardDecksQuery } from "../api/flashcardApi"
import { AudioButton } from "../components/flashcard"
import { useLanguage } from "@/shared/context/LanguageContext"
import { flashcardReviewPath } from "../utils/flashcardReview"

const DeckBrowsePage = () => {
  const navigate = useNavigate(); const { lang: paramLang, deckId } = useParams(); const { language } = useLanguage(); const lang = paramLang || language || "vi"
  const { data: decks = [] } = useGetFlashcardDecksQuery(); const { data = { items: [] }, isLoading, isError } = useGetDeckCardsQuery({ deckId })
  const deck = decks.find((item) => item.id === deckId) || { name: deckId, total_cards: 0 }
  return <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-12">
    <button type="button" onClick={() => navigate(`/${lang}/ai-tutor/vocabulary-notebook`)} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600"><ArrowLeft className="h-4 w-4" />Quay lại Sổ tay từ vựng</button>
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-black text-slate-900">Bộ thẻ: {deck.name}</h1><span className="text-sm font-semibold text-slate-500">{deck.total_cards} thẻ</span></div><button type="button" onClick={() => navigate(flashcardReviewPath(lang, { mode: "free", deckId }))} className="inline-flex items-center gap-2 rounded-xl bg-[#680411] px-6 py-2.5 font-bold text-white">Ôn tập <ArrowRight className="h-4 w-4" /></button></div>
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1 text-xs font-bold text-[#680411]"><Lock className="h-3.5 w-3.5" />Chỉ đọc — không ảnh hưởng lịch ôn</span>
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"><div className="grid grid-cols-4 gap-4 border-b bg-slate-50 px-6 py-3 text-sm font-bold text-slate-600"><div>Hán tự</div><div>Pinyin</div><div>Nghĩa</div><div>Audio</div></div>{isLoading ? <div className="p-8 text-center text-sm text-slate-500">Đang tải danh sách thẻ...</div> : isError ? <div className="p-8 text-center text-sm text-slate-500">Không thể tải bộ thẻ.</div> : data.items.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">Chưa có từ vựng nào trong bộ thẻ này.</div> : <div className="divide-y">{data.items.map((card) => <div key={card.card_id} className="grid grid-cols-4 items-center gap-4 px-6 py-4"><div className="font-bold">{card.word}</div><div>{card.pinyin || "—"}</div><div>{card.meaning_vi || "—"}</div><AudioButton audioPath={card.audio_url} pinyin={card.pinyin} /></div>)}</div>}</div>
  </div>
}
export default DeckBrowsePage
