import { useState, useMemo } from "react"
import { SquarePen, Users, BellOff } from "lucide-react"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import FluentCard from "@/shared/components/ui/FluentCard"
import { IconButton } from "@/shared/components/ui/buttons"
import ListItem from "@/shared/components/ui/ListItem"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import ConversationItem from "./widget/ConversationItem"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * ChatSidebar — left panel with search, filters, and conversation list.
 */
const ChatSidebar = ({
  conversations,
  currentUser,
  friendOnlineStatus,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  onNewChatClick,
  isLoading,
}) => {
  const { t } = useLanguage()
  const [filter] = useState("all")

  // Filter + search conversations
  const filtered = useMemo(() => {
    let result = [...conversations]

    // Filter out empty 1:1 conversations unless they are currently selected/active
    result = result.filter((c) => {
      if (c.conversationId === selectedId) return true
      if (c.isGroup) return true
      return Boolean(c.lastMessage || c.lastMessageType || c.lastMessageTime)
    })

    // Apply filter
    if (filter === "unread") result = result.filter((c) => c.unreadCount > 0)
    if (filter === "groups") result = result.filter((c) => c.isGroup)

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((c) => {
        const name = c.isGroup ? c.groupName : c.friend?.username || "Chat User"
        return name.toLowerCase().includes(q)
      })
    }

    // Sort: latest message timestamp
    result.sort((a, b) => {
      const aTime = a.lastMessageTime || a.createDate || ""
      const bTime = b.lastMessageTime || b.createDate || ""
      return new Date(bTime) - new Date(aTime)
    })

    return result
  }, [conversations, filter, searchQuery, selectedId])

  return (
    <FluentCard
      padding="p-0"
      className="w-full h-full flex-1 overflow-hidden !border-0 !rounded-none lg:!border lg:!rounded-xl"
    >
      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{t?.chat?.title || "Chats"}</h1>
          <IconButton
            onClick={onNewChatClick}
            size="sm"
            variant="transparent"
            className="text-[#606060] hover:bg-[#F2F2F2]"
            aria-label="New chat or group"
          >
            <SquarePen size={20} />
          </IconButton>
        </div>

        {/* ── Search ───────────────────────────────── */}
        <SearchInput
          placeholder={t?.chat?.sidebar?.searchPlaceholder || "Search conversations..."}
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>

      {/* ── Conversation list ────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-1 flex flex-col gap-1 w-0 min-w-full">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <ListItem
              key={idx}
              lines={2}
              leftContent={<Skeleton className="w-10 h-10 rounded-full" />}
              rightContent={
                <div className="flex flex-col items-end gap-2 justify-center">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              }
              contentClassName="rounded-xl"
              className="rounded-xl"
            >
              <div className="flex flex-col gap-1.5 text-left">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-36" />
              </div>
            </ListItem>
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            variant="component"
            icon={Users}
            message={t?.chat?.sidebar?.noConversations || "No conversations found"}
          />
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.conversationId}
              conversation={conv}
              currentUser={currentUser}
              friendOnlineStatus={friendOnlineStatus}
              isSelected={selectedId === conv.conversationId}
              onClick={() => onSelect(conv.conversationId)}
            />
          ))
        )}
      </div>
    </FluentCard>
  )
}

export default ChatSidebar
