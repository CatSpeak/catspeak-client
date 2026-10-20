import React, { useEffect, useRef, useState } from "react"
import { CheckCircle2, FolderPlus, MoreHorizontal, Sparkles, Trash2, Undo2 } from "lucide-react"
import AudioButton from "../../flashcard/AudioButton"

/**
 * Menu thao tác một thẻ (fc11, FR-FC-018): Đã biết rồi / bỏ đánh dấu, thêm vào thư
 * mục, xoá. Mở bằng chuột hoặc bàn phím, Esc để đóng.
 */
export const CardActionsMenu = ({ card, onKnown, onFolders, onDelete }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const esc = (e) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", close)
    document.addEventListener("keydown", esc)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("keydown", esc)
    }
  }, [open])

  const run = (fn) => () => {
    setOpen(false)
    fn?.(card)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Thao tác với thẻ ${card.word}`}
        data-testid={`card-menu-${card.card_id}`}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-30 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1 text-sm shadow-xl"
        >
          <button type="button" role="menuitem" onClick={run(onKnown)} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50">
            {card.is_known ? <Undo2 className="h-4 w-4 text-slate-500" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            {card.is_known ? "Bỏ đánh dấu Đã biết" : "Đã biết rồi"}
          </button>
          <button type="button" role="menuitem" onClick={run(onFolders)} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50">
            <FolderPlus className="h-4 w-4 text-slate-500" />
            Thêm vào thư mục
          </button>
          <button type="button" role="menuitem" onClick={run(onDelete)} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-rose-700 hover:bg-rose-50">
            <Trash2 className="h-4 w-4" />
            Xoá thẻ
          </button>
        </div>
      )}
    </div>
  )
}

const StatusBadge = ({ card }) => {
  if (card.is_known)
    return <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">Đã biết</span>
  if (card.is_long_term)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-[#990011]">
        <Sparkles className="h-3 w-3" /> Nhớ lâu dài
      </span>
    )
  if (card.is_due) return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">Cần ôn</span>
  return null
}

/**
 * Danh sách thẻ ở fc05 (và kết quả tìm từ). Chỉ đọc với lịch ôn: xem, nghe, thao tác
 * quản lý thẻ; không chấm điểm (FR-FC-016). `selectable` để chọn thẻ ôn tự do.
 */
const FlashcardCardList = ({ items = [], selectable = false, selectedIds, onToggleSelect, onKnown, onFolders, onDelete, readOnly = false }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
    <div className="hidden grid-cols-[auto_1.2fr_1fr_1.6fr_auto_auto] items-center gap-4 border-b bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600 md:grid">
      <div className="w-5">{selectable && <span className="sr-only">Chọn</span>}</div>
      <div>Hán tự</div>
      <div>Pinyin</div>
      <div>Nghĩa</div>
      <div>Audio</div>
      <div className="w-9" />
    </div>
    <ul className="divide-y">
      {items.map((card) => {
        const checked = selectedIds?.has(card.card_id)
        return (
          <li
            key={card.card_id}
            data-testid={`card-row-${card.card_id}`}
            className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-3 gap-y-1 px-4 py-3 md:grid-cols-[auto_1.2fr_1fr_1.6fr_auto_auto] md:gap-4 md:px-5 md:py-4"
          >
            <div className="row-span-2 w-5 md:row-span-1">
              {selectable && (
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#990011]"
                  checked={Boolean(checked)}
                  onChange={() => onToggleSelect?.(card.card_id)}
                  aria-label={`Chọn thẻ ${card.word}`}
                />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold text-slate-900" lang="zh">{card.word}</span>
              {card.card_type === "pronunciation" && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">Phát âm</span>
              )}
              <StatusBadge card={card} />
            </div>
            <div className="order-3 col-start-2 text-sm text-slate-600 md:order-none md:col-auto">{card.pinyin || "-"}</div>
            <div className="order-4 col-start-2 text-sm md:order-none md:col-auto">
              {card.meaning_vi ? (
                <span className="text-slate-700">{card.meaning_vi}</span>
              ) : (
                <span className="italic text-slate-400">Đang cập nhật nghĩa</span>
              )}
            </div>
            <div className="row-span-2 md:row-span-1">
              <AudioButton audioPath={card.audio_url} pinyin={card.pinyin} label={`Nghe phát âm ${card.word}`} />
            </div>
            <div className="row-span-2 md:row-span-1">
              {!readOnly && <CardActionsMenu card={card} onKnown={onKnown} onFolders={onFolders} onDelete={onDelete} />}
            </div>
          </li>
        )
      })}
    </ul>
  </div>
)

export default FlashcardCardList
