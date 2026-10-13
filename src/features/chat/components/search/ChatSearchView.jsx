import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Search } from "lucide-react"
import { useLazySearchConversationMessagesQuery } from "@/store/api/social/conversationsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import ListItem from "@/shared/components/ui/ListItem"
import Avatar from "@/shared/components/ui/Avatar"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"

/**
 * ChatSearchView — In-conversation message search view embedded in ChatUserPanel.
 * Allows searching chat history, navigating results, and jumping to messages in context.
 * Standardized to reuse design-system primitives: SearchInput, ListItem, EmptyState, Skeleton, Avatar.
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
        setSelectedMessageId(null)
        inputRef.current?.focus()
      }
    }
  }

  const trimmedQuery = query.trim()

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* ── Search Input Bar ── */}
      <div className="px-4 mb-4 flex items-center bg-white shrink-0">
        <SearchInput
          inputRef={inputRef}
          value={query}
          onChange={setQuery}
          onClear={() => {
            setQuery("")
            setSelectedMessageId(null)
            inputRef.current?.focus()
          }}
          isLoading={isFetching}
          onKeyDown={handleKeyDown}
          placeholder={
            t?.chat?.searchPlaceholder || "Search in conversation..."
          }
        />
      </div>

      {/* ── Results count sub-bar ── */}
      {trimmedQuery.length > 0 && !isFetching && results.length > 0 && (
        <div className="px-4 mb-1 text-xs text-secondary shrink-0 flex items-center justify-between">
          <span>
            {(t?.chat?.resultsFound || "{{count}} results found").replace(
              /\{\{count\}\}|\{count\}/g,
              results.length,
            )}
          </span>
        </div>
      )}

      {/* ── Search Results List / Empty States ── */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {trimmedQuery.length === 0 ? (
          /* Initial empty prompt */
          <EmptyState
            variant="component"
            icon={Search}
            title={t?.chat?.userPanel?.searchMessages || "Search Messages"}
            description={
              t?.chat?.userPanel?.searchMessagesSubtitle ||
              "Find messages in this conversation"
            }
            className="h-full justify-center"
          />
        ) : isFetching && results.length === 0 ? (
          /* Skeleton loading state */
          Array.from({ length: 6 }).map((_, idx) => (
            <ListItem
              key={idx}
              lines={2}
              leftContent={<Skeleton className="w-10 h-10 rounded-full" />}
              rightContent={
                <div className="flex flex-col items-end gap-2 justify-center">
                  <Skeleton className="h-3 w-10" />
                </div>
              }
            >
              <Skeleton className="h-4 w-28 mb-1" />
              <Skeleton className="h-3 w-44" />
            </ListItem>
          ))
        ) : results.length === 0 ? (
          /* No results prompt */
          <EmptyState
            variant="component"
            icon={Search}
            title={t?.common?.noResultsFound || "No results found"}
            description={(
              t?.chat?.noMessagesFoundMatching ||
              'No messages found matching "{{query}}"'
            ).replace(/\{\{query\}\}|\{query\}/g, trimmedQuery)}
            className="h-full justify-center"
          />
        ) : (
          /* Results list */
          results.map((item, idx) => {
            const msgId = item.messageId || item.id
            const isSelected =
              selectedMessageId !== null
                ? selectedMessageId === msgId
                : idx === activeIndex
            const sender = item.sender || {}
            const senderName =
              sender.username ||
              sender.name ||
              sender.fullName ||
              t?.chat?.someone ||
              "User"
            const theme = getParticipantTheme(
              sender.accountId || sender.id || senderName,
            )

            return (
              <ListItem
                key={msgId || idx}
                onClick={() => handleSelectMessage(item, idx)}
                selected={isSelected}
                lines={2}
                className={isSelected ? "border-l-2 border-primary" : ""}
                leftContent={
                  <Avatar
                    size={40}
                    name={senderName}
                    src={sender.avatarImageUrl || sender.avatar}
                    accountId={sender.accountId || sender.id}
                    className={theme.avatarClass}
                  />
                }
                rightContent={
                  <span className="text-xs text-[#606060] shrink-0">
                    {formatRelative(
                      item.createDate || item.createdAt || item.timestamp,
                    )}
                  </span>
                }
              >
                <span className="truncate font-semibold text-neutral-900">
                  {senderName}
                </span>
                <span className="text-sm text-[#606060] truncate">
                  {item.messageContent ||
                    item.content ||
                    item.fileName ||
                    `[${item.messageType || "Media"}]`}
                </span>
              </ListItem>
            )
          })
        )}
      </div>
    </div>
  )
}

export default React.memo(ChatSearchView)
