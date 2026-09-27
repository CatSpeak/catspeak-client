import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Search, ChevronUp, ChevronDown, X, Loader2 } from "lucide-react"
import { useLazySearchConversationMessagesQuery } from "@/store/api/social/conversationsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import Avatar from "@/shared/components/ui/Avatar"

/**
 * InChatSearchBar — Search bar integrated into chat area header.
 * Allows searching messages by keyword, navigating results with Up/Down buttons,
 * and clicking to smooth scroll and highlight target messages.
 */
const InChatSearchBar = ({
  conversationId,
  isOpen,
  onClose,
  onJumpToMessage,
}) => {
  const { t } = useLanguage()
  const { formatRelative } = useTimezone()
  const inputRef = useRef(null)

  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const [showResultsList, setShowResultsList] = useState(false)

  const [triggerSearch, { data: rawResults = [], isFetching }] =
    useLazySearchConversationMessagesQuery()

  const results = useMemo(() => {
    return Array.isArray(rawResults)
      ? rawResults
      : rawResults?.data || rawResults?.items || []
  }, [rawResults])

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  const handleClose = () => {
    setQuery("")
    setActiveIndex(0)
    setShowResultsList(false)
    onClose?.()
  }

  // Debounced search trigger
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed || !conversationId) return

    const timer = setTimeout(() => {
      triggerSearch({ conversationId, query: trimmed, limit: 30 })
      setActiveIndex(0)
    }, 350)

    return () => clearTimeout(timer)
  }, [query, conversationId, triggerSearch])

  // Navigate to target message
  const jumpToIndex = useCallback(
    (index) => {
      if (results.length === 0) return
      const target = results[index]
      if (target) {
        setActiveIndex(index)
        const msgId = target.messageId || target.id
        if (msgId && onJumpToMessage) {
          onJumpToMessage(msgId)
        }
      }
    },
    [results, onJumpToMessage],
  )

  const handlePrev = () => {
    if (results.length === 0) return
    const nextIdx = activeIndex <= 0 ? results.length - 1 : activeIndex - 1
    jumpToIndex(nextIdx)
  }

  const handleNext = () => {
    if (results.length === 0) return
    const nextIdx = activeIndex >= results.length - 1 ? 0 : activeIndex + 1
    jumpToIndex(nextIdx)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (e.shiftKey) {
        handlePrev()
      } else {
        handleNext()
      }
    } else if (e.key === "Escape") {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="relative border-b border-border bg-white dark:bg-zinc-900 px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs z-20 animate-in fade-in slide-in-from-top-2 duration-150">
      {/* ── Search Input ── */}
      <div className="flex-1 flex items-center gap-2 bg-neutral-100 dark:bg-zinc-800 rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/40 transition-all">
        <Search size={16} className="text-neutral-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowResultsList(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder={t?.chat?.searchPlaceholder || "Search in conversation..."}
          className="bg-transparent border-none outline-none text-sm w-full text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
        />
        {isFetching ? (
          <Loader2 size={16} className="animate-spin text-neutral-400 shrink-0" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setShowResultsList(false)
            }}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      {/* ── Results count & Up/Down navigation ── */}
      <div className="flex items-center gap-1 shrink-0">
        {query.trim().length > 0 && (
          <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400 px-1 select-none">
            {results.length > 0
              ? `${activeIndex + 1}/${results.length}`
              : isFetching
                ? "..."
                : "0/0"}
          </span>
        )}

        <button
          type="button"
          onClick={handlePrev}
          disabled={results.length === 0}
          aria-label="Previous result"
          className="p-1 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronUp size={18} />
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={results.length === 0}
          aria-label="Next result"
          className="p-1 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronDown size={18} />
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close search"
          className="p-1 rounded-md text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Dropdown Results List ── */}
      {showResultsList && query.trim().length > 0 && results.length > 0 && (
        <div className="absolute left-4 right-4 top-full mt-1 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-border max-h-72 overflow-y-auto z-50 divide-y divide-border/60">
          {results.map((item, idx) => {
            const isCurrent = idx === activeIndex
            const sender = item.sender || {}
            return (
              <div
                key={item.messageId || item.id || idx}
                onClick={() => {
                  jumpToIndex(idx)
                  setShowResultsList(false)
                }}
                className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                  isCurrent
                    ? "bg-primary/10 border-l-4 border-primary"
                    : "hover:bg-neutral-50 dark:hover:bg-zinc-700/50"
                }`}
              >
                <Avatar
                  size={32}
                  name={sender.username || sender.name}
                  src={sender.avatarImageUrl || sender.avatar}
                  className="shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-semibold text-xs truncate">
                      {sender.username || sender.name || t?.chat?.someone || "User"}
                    </span>
                    <span className="text-[10px] text-neutral-400 shrink-0">
                      {formatRelative(item.createDate || item.createdAt || item.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-200 line-clamp-2">
                    {item.messageContent || item.content || item.fileName || `[${item.messageType || "Media"}]`}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default React.memo(InChatSearchBar)
