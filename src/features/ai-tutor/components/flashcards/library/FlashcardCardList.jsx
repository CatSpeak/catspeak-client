import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { CheckCircle2, FolderPlus, MoreHorizontal, Sparkles, Trash2, Undo2 } from "lucide-react"
import AudioButton from "../../flashcard/AudioButton"
import FlashcardPreviewModal from "./FlashcardPreviewModal"

/**
 * Menu thao tác một thẻ (fc11, FR-FC-018): Đã biết rồi / bỏ đánh dấu, thêm vào thư
 * mục, xoá. Mở bằng chuột hoặc bàn phím, Esc để đóng.
 * Render qua Portal ra document.body và tự động lật lên trên (flip up) khi ở dòng cuối
 * hoặc thiếu khoảng trống phía dưới để không bị khung bảng cắt (TC-FC-134, TC-FC-135, TC-FC-136).
 */
export const CardActionsMenu = ({
  card,
  onKnown,
  onFolders,
  onDelete,
  isLastRow = false,
  isOpen: controlledIsOpen,
  defaultOpen = false,
  onOpenChange,
}) => {
  const isControlled = controlledIsOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = isControlled ? controlledIsOpen : internalOpen
  const [coords, setCoords] = useState(null)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  const setOpen = useCallback(
    (next) => {
      const nextVal = typeof next === "function" ? next(open) : next
      if (!isControlled) {
        setInternalOpen(nextVal)
      }
      onOpenChange?.(nextVal)
    },
    [isControlled, open, onOpenChange]
  )

  const updatePosition = useCallback(() => {
    if (!buttonRef.current || typeof window === "undefined") return
    const rect = buttonRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const menuHeight = menuRef.current?.offsetHeight || 145
    const menuWidth = menuRef.current?.offsetWidth || 224

    const flipUp = isLastRow || (spaceBelow < menuHeight + 12 && spaceAbove > spaceBelow)

    let top = flipUp ? rect.top - menuHeight - 6 : rect.bottom + 6
    let left = rect.right - menuWidth

    // Đảm bảo không tràn viền trái / phải màn hình
    const minLeft = 8
    const maxLeft = Math.max(8, window.innerWidth - menuWidth - 8)
    left = Math.max(minLeft, Math.min(left, maxLeft))

    setCoords({
      top: Math.round(top),
      left: Math.round(left),
      flipUp,
    })
  }, [isLastRow])

  useLayoutEffect(() => {
    if (open) {
      updatePosition()
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) {
      setCoords(null)
      return undefined
    }

    updatePosition()

    const handleScrollOrResize = () => {
      updatePosition()
    }

    const handleOutside = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }

    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false)
    }

    window.addEventListener("scroll", handleScrollOrResize, true)
    window.addEventListener("resize", handleScrollOrResize)
    document.addEventListener("mousedown", handleOutside)
    document.addEventListener("keydown", handleKey)

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true)
      window.removeEventListener("resize", handleScrollOrResize)
      document.removeEventListener("mousedown", handleOutside)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open, updatePosition, setOpen])

  const run = (fn) => () => {
    setOpen(false)
    fn?.(card)
  }

  const isClientPortal = typeof document !== "undefined" && Boolean(document?.body)
  const shouldFlip = coords?.flipUp ?? isLastRow

  const menuElement = (
    <div
      ref={menuRef}
      role="menu"
      data-testid={`card-menu-dropdown-${card.card_id}`}
      style={
        isClientPortal && coords
          ? {
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }
          : undefined
      }
      className={`z-[1050] w-56 overflow-hidden rounded-2xl border border-slate-100 dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] py-1 text-sm shadow-xl ${
        isClientPortal && coords
          ? ""
          : `absolute right-0 ${shouldFlip ? "bottom-full mb-1" : "top-10"}`
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        role="menuitem"
        onClick={run(onKnown)}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-slate-800 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-[#272727]"
      >
        {card.is_known ? (
          <Undo2 className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        )}
        {card.is_known ? "Bỏ đánh dấu Đã biết" : "Đã biết rồi"}
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={run(onFolders)}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-slate-800 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-[#272727]"
      >
        <FolderPlus className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
        Thêm vào thư mục
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={run(onDelete)}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-rose-700 dark:text-red-400 hover:bg-rose-50 dark:hover:bg-red-950/20"
      >
        <Trash2 className="h-4 w-4" />
        Xoá thẻ
      </button>
    </div>
  )

  return (
    <div className="relative inline-flex items-center justify-center" ref={containerRef}>
      <button
        type="button"
        ref={buttonRef}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Thao tác với thẻ ${card.word}`}
        data-testid={`card-menu-${card.card_id}`}
        onClick={(e) => {
          e.stopPropagation()
          if (!open) {
            updatePosition()
          }
          setOpen((v) => !v)
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-[#272727]"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      {open && (isClientPortal ? createPortal(menuElement, document.body) : menuElement)}
    </div>
  )
}

const StatusBadge = ({ card }) => {
  if (card.is_known)
    return <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Đã biết</span>
  if (card.is_long_term)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 text-[11px] font-bold text-[#990011] dark:text-red-400">
        <Sparkles className="h-3 w-3" /> Nhớ lâu dài
      </span>
    )
  if (card.is_due) return <span className="rounded-full bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">Cần ôn</span>
  return null
}

/**
 * Danh sách thẻ ở fc05 (và kết quả tìm từ). Chỉ đọc với lịch ôn: xem, nghe, thao tác
 * quản lý thẻ; không chấm điểm (FR-FC-016). Bấm vào dòng thẻ (vùng chữ Hán/nghĩa) để
 * mở xem chi tiết và lật thẻ ở chế độ chỉ đọc (TC-FC-092). `selectable` để chọn thẻ ôn tự do.
 */
const FlashcardCardList = ({
  items = [],
  selectable = false,
  selectedIds,
  onToggleSelect,
  onKnown,
  onFolders,
  onDelete,
  readOnly = false,
  onPreviewCard,
  previewCard: controlledPreviewCard,
}) => {
  const [internalPreview, setInternalPreview] = useState(null)
  const activePreview = controlledPreviewCard !== undefined ? controlledPreviewCard : internalPreview

  const handleOpenPreview = (card) => {
    setInternalPreview(card)
    onPreviewCard?.(card)
  }

  const handleClosePreview = () => {
    setInternalPreview(null)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] shadow-sm">
      <div className="hidden grid-cols-[auto_1.2fr_1fr_1.6fr_auto_auto] items-center gap-4 border-b border-slate-100 dark:border-[#3F3F3F] bg-slate-50 dark:bg-[#242424] px-5 py-3 text-sm font-bold text-slate-600 dark:text-neutral-300 md:grid">
        <div className="w-5">{selectable && <span className="sr-only">Chọn</span>}</div>
        <div>Hán tự</div>
        <div>Pinyin</div>
        <div>Nghĩa</div>
        <div>Audio</div>
        <div className="w-9" />
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-[#272727]">
        {items.map((card, index) => {
          const checked = selectedIds?.has(card.card_id)
          const isLastRow = index === items.length - 1
          return (
            <li
              key={card.card_id}
              data-testid={`card-row-${card.card_id}`}
              className="group grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-3 gap-y-1 px-4 py-3 transition-colors hover:bg-slate-50/70 dark:hover:bg-[#222222] md:grid-cols-[auto_1.2fr_1fr_1.6fr_auto_auto] md:gap-4 md:px-5 md:py-4"
            >
              <div
                className="row-span-2 w-5 md:row-span-1"
                onClick={(e) => e.stopPropagation()}
              >
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
              <div
                data-testid={`card-preview-trigger-${card.card_id}`}
                role="button"
                tabIndex={0}
                aria-label={`Xem chi tiết thẻ ${card.word}`}
                onClick={() => handleOpenPreview(card)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleOpenPreview(card)
                  }
                }}
                className="contents cursor-pointer"
              >
                <div className="flex flex-wrap items-center gap-2 cursor-pointer">
                  <span
                    className="text-lg font-bold text-slate-900 transition-colors group-hover:text-[#990011] dark:text-white dark:group-hover:text-red-400"
                    lang="zh"
                  >
                    {card.word}
                  </span>
                  {card.card_type === "pronunciation" && (
                    <span className="rounded-full bg-slate-100 dark:bg-[#272727] px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:text-neutral-300">
                      Phát âm
                    </span>
                  )}
                  <StatusBadge card={card} />
                </div>
                <div className="order-3 col-start-2 text-sm text-slate-600 dark:text-neutral-300 md:order-none md:col-auto cursor-pointer">
                  {card.pinyin || "-"}
                </div>
                <div className="order-4 col-start-2 text-sm md:order-none md:col-auto cursor-pointer">
                  {card.meaning_vi ? (
                    <span className="text-slate-700 dark:text-neutral-200">{card.meaning_vi}</span>
                  ) : (
                    <span className="italic text-slate-400 dark:text-neutral-500">Đang cập nhật nghĩa</span>
                  )}
                </div>
              </div>
              <div
                className="row-span-2 md:row-span-1"
                onClick={(e) => e.stopPropagation()}
              >
                <AudioButton audioPath={card.audio_url} pinyin={card.pinyin} label={`Nghe phát âm ${card.word}`} />
              </div>
              <div
                className="row-span-2 md:row-span-1"
                onClick={(e) => e.stopPropagation()}
              >
                {!readOnly && (
                  <CardActionsMenu
                    card={card}
                    isLastRow={isLastRow}
                    onKnown={onKnown}
                    onFolders={onFolders}
                    onDelete={onDelete}
                  />
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {activePreview && (
        <FlashcardPreviewModal
          key={activePreview.card_id}
          card={activePreview}
          isOpen={Boolean(activePreview)}
          onClose={handleClosePreview}
        />
      )}
    </div>
  )
}

export default FlashcardCardList
