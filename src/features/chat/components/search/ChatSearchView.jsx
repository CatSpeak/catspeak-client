import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { useLazySearchConversationMessagesQuery } from "@/store/api/social/conversationsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import Avatar from "@/shared/components/ui/Avatar"

/**
 * ChatSearchView — In-conversation message search view embedded in ChatUserPanel.
 * Allows searching chat history, navigating results, and jumping to messages in context.
 */
const ChatSearchView = ({ conversationId, onJumpToMessage }) => {
  const { t } = useLanguage()
  const { formatRelative } = useTimezone()
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedMessageId, setSelectedMessageId] = useState(null)

  const [triggerSearch, { data: rawResults = [], isFetching }] =
    useLazySearchConversationMessagesQuery()

  const results = useMemo(() => {
    return Array.isArray(rawResults)
      ? rawResults
      : rawResults?.data || rawResults?.items || []
  }, [rawResults])

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  // Debounced search trigger
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed || !conversationId) return

    const timer = setTimeout(() => {
      triggerSearch({ conversationId, query: trimmed, limit: 50 })
      setActiveIndex(0)
      setSelectedMessageId(null)
    }, 350)

    return () => clearTimeout(timer)
  }, [query, conversationId, triggerSearch])

  // Jump to selected message
  const handleSelectMessage = useCallback(
    (item, index) => {
      const msgId = item.messageId || item.id
      setActiveIndex(index)
      setSelectedMessageId(msgId)
      if (msgId && onJumpToMessage) {
        onJumpToMessage(msgId)
      }
    },
    [onJumpToMessage],
  )

  // Auto-scroll highlighted item into view during keyboard navigation
  useEffect(() => {
    if (!listRef.current || results.length === 0) return
    const activeEl = listRef.current.children[activeIndex]
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" })
    }
  }, [activeIndex, results.length])

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (results.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        const nextIdx = (activeIndex + 1) % results.length
        setActiveIndex(nextIdx)
        const target = results[nextIdx]
        if (target) {
          handleSelectMessage(target, nextIdx)
        }
        return
      }

      if (e.key === "ArrowUp") {
        e.preventDefault()
        const nextIdx = (activeIndex - 1 + results.length) % results.length
        setActiveIndex(nextIdx)
        const target = results[nextIdx]
        if (target) {
          handleSelectMessage(target, nextIdx)
        }
        return
      }

      if (e.key === "Enter") {
        e.preventDefault()
        const target = results[activeIndex]
        if (target) {
          handleSelectMessage(target, activeIndex)
        }
        return
      }
    }

    if (e.key === "Escape") {
      if (query) {
        e.preventDefault()
        setQuery("")
        inputRef.current?.focus()
      }
    }
  }

  const trimmedQuery = query.trim()

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* ── Search Input Bar ── */}
      <div className="p-3 border-b border-border bg-white shrink-0">
        <div className="flex items-center gap-2 bg-neutral-100 rounded-full px-3 py-2 focus-within:ring-2 focus-within:ring-primary/40 transition-all">
          <Search size={16} className="text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              t?.chat?.searchPlaceholder || "Search in conversation..."
            }
            className="bg-transparent border-none outline-none text-sm w-full text-neutral-800 placeholder-neutral-400"
          />
          {isFetching ? (
            <Loader2
              size={16}
              className="animate-spin text-neutral-400 shrink-0"
            />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setSelectedMessageId(null)
                inputRef.current?.focus()
              }}
              className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>

        {trimmedQuery.length > 0 && !isFetching && (
          <div className="mt-2 px-1 flex items-center justify-between text-xs text-[#606060]">
            <span>
              {results.length > 0
                ? `${results.length} ${results.length === 1 ? "result" : "results"} found`
                : "No results found"}
            </span>
          </div>
        )}
      </div>

      {/* ── Search Results List / Empty States ── */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {trimmedQuery.length === 0 ? (
          /* Initial empty prompt */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#606060]">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
              <Search size={22} />
            </div>
            <p className="font-semibold text-sm text-neutral-800 mb-1">
              {t?.chat?.userPanel?.searchMessages || "Search Messages"}
            </p>
            <p className="text-xs max-w-[220px]">
              {t?.chat?.userPanel?.searchMessagesSubtitle ||
                "Find messages in this conversation"}
            </p>
          </div>
        ) : isFetching && results.length === 0 ? (
          /* Loading indicator */
          <div className="h-48 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-neutral-400" />
          </div>
        ) : results.length === 0 ? (
          /* No results prompt */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#606060]">
            <p className="font-semibold text-sm text-neutral-800 mb-1">
              No results found
            </p>
            <p className="text-xs max-w-[220px]">
              No messages found matching &quot;{trimmedQuery}&quot;
            </p>
          </div>
        ) : (
          /* Results list */
          results.map((item, idx) => {
            const msgId = item.messageId || item.id
            const isSelected =
              selectedMessageId !== null
                ? selectedMessageId === msgId
                : idx === activeIndex
            const sender = item.sender || {}

            return (
              <div
                key={msgId || idx}
                onClick={() => handleSelectMessage(item, idx)}
                className={`h-[72px] flex items-center gap-4 px-4 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#F2F2F2] hover:bg-[#E6E6E6] border-l-2 border-primary"
                    : "hover:bg-[#F2F2F2]"
                }`}
              >
                <Avatar
                  size={40}
                  name={sender.username || sender.name || sender.fullName}
                  src={sender.avatarImageUrl || sender.avatar}
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="truncate font-semibold text-xs text-neutral-800">
                      {sender.username ||
                        sender.name ||
                        sender.fullName ||
                        t?.chat?.someone ||
                        "User"}
                    </span>
                    <span className="text-[10px] text-neutral-400 shrink-0">
                      {formatRelative(
                        item.createDate || item.createdAt || item.timestamp,
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-[#606060] truncate">
                    {item.messageContent ||
                      item.content ||
                      item.fileName ||
                      `[${item.messageType || "Media"}]`}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default React.memo(ChatSearchView)
