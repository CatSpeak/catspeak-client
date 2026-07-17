import { useState, useMemo, memo } from "react"
import { Search, SquarePen, Pin, Users, BellOff } from "lucide-react"
import {
  getConversationName,
  getOtherUser,
  formatRelativeTime,
  getUserColor,
} from "../data/chatMockData"

/**
 * GroupAvatar — stacked initials for group conversations.
 */
const GroupAvatar = ({ conversation, usersMap, size = 48 }) => {
  const otherIds = conversation.participants.filter((id) => id !== "me")
  const first = usersMap[otherIds[0]]
  const second = usersMap[otherIds[1]]
  const smallSize = Math.round(size * 0.62)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="chat-group-avatar-first flex items-center justify-center rounded-full text-white font-semibold border-2 border-white"
        style={{
          width: smallSize,
          height: smallSize,
          fontSize: Math.round(smallSize * 0.38),
          backgroundColor: getUserColor(first?.id || ""),
        }}
      >
        {first?.name?.charAt(0) || "?"}
      </div>
      <div
        className="chat-group-avatar-second flex items-center justify-center rounded-full text-white font-semibold border-2 border-white"
        style={{
          width: smallSize,
          height: smallSize,
          fontSize: Math.round(smallSize * 0.38),
          backgroundColor: getUserColor(second?.id || ""),
        }}
      >
        {second?.name?.charAt(0) || "?"}
      </div>
    </div>
  )
}

/**
 * ConversationItem — single row in the conversation list.
 */
const ConversationItem = memo(
  ({ conversation, usersMap, currentUser, messagesMap, isSelected, onClick }) => {
    const isGroup = conversation.type === "group"
    const otherUser = getOtherUser(conversation, usersMap)
    const name = getConversationName(conversation, usersMap)
    const lastMsg = messagesMap[conversation.id]?.slice(-1)[0]
    const isOnline = otherUser?.status === "online"
    const hasUnread = conversation.unreadCount > 0

    // Last message preview
    let preview = ""
    if (lastMsg) {
      const senderPrefix =
        lastMsg.senderId === "me"
          ? "You: "
          : isGroup
            ? `${usersMap[lastMsg.senderId]?.name?.split(" ")[0] || "?"}: `
            : ""
      preview = senderPrefix + lastMsg.content
    }

    return (
      <button
        onClick={onClick}
        className={`group w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150 rounded-xl mx-1 ${
          isSelected
            ? "bg-[#990011]/[0.06]"
            : "hover:bg-[#F8F8F8]"
        }`}
        style={{ width: "calc(100% - 8px)" }}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          {isGroup ? (
            <GroupAvatar
              conversation={conversation}
              usersMap={usersMap}
              size={48}
            />
          ) : (
            <>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                style={{
                  backgroundColor: getUserColor(otherUser?.id || ""),
                }}
              >
                {otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              {/* Online dot */}
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#22C55E] rounded-full border-[2.5px] border-white" />
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`text-[14px] truncate ${
                  hasUnread
                    ? "font-semibold text-[#1A1A1A]"
                    : "font-medium text-[#1A1A1A]"
                }`}
              >
                {name}
              </span>
              {conversation.muted && (
                <BellOff size={12} className="shrink-0 text-[#9CA0AB]" />
              )}
            </div>
            <span className="text-[11px] text-[#9CA0AB] shrink-0">
              {formatRelativeTime(lastMsg?.timestamp)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <span
              className={`text-[13px] truncate ${
                hasUnread
                  ? "text-[#1A1A1A] font-medium"
                  : "text-[#606060]"
              }`}
            >
              {preview || "No messages yet"}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {conversation.pinned && (
                <Pin
                  size={12}
                  className="text-[#9CA0AB] rotate-45"
                />
              )}
              {hasUnread && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#990011] px-1.5 text-[11px] text-white font-semibold">
                  {conversation.unreadCount > 99
                    ? "99+"
                    : conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    )
  },
)
ConversationItem.displayName = "ConversationItem"

// ── Filter Tabs ───────────────────────────────────────────
const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "groups", label: "Groups" },
]

/**
 * ChatSidebar — left panel with search, filters, and conversation list.
 *
 * @param {Array}    conversations - All conversations
 * @param {object}   users         - Users map
 * @param {object}   currentUser   - Current user
 * @param {object}   messagesMap   - Messages keyed by conversation ID
 * @param {string}   selectedId    - Currently selected conversation ID
 * @param {function} onSelect      - Conversation select handler
 * @param {string}   searchQuery   - Search input value
 * @param {function} onSearchChange - Search change handler
 */
const ChatSidebar = ({
  conversations,
  users: usersMap,
  currentUser,
  messagesMap,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
}) => {
  const [filter, setFilter] = useState("all")

  // Filter + search conversations
  const filtered = useMemo(() => {
    let result = [...conversations]

    // Apply filter
    if (filter === "unread") result = result.filter((c) => c.unreadCount > 0)
    if (filter === "groups") result = result.filter((c) => c.type === "group")

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((c) => {
        const name = getConversationName(c, usersMap)
        return name.toLowerCase().includes(q)
      })
    }

    // Sort: pinned first, then by latest message timestamp
    result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      const aTime = messagesMap[a.id]?.slice(-1)[0]?.timestamp || ""
      const bTime = messagesMap[b.id]?.slice(-1)[0]?.timestamp || ""
      return new Date(bTime) - new Date(aTime)
    })

    return result
  }, [conversations, filter, searchQuery, usersMap, messagesMap])

  return (
    <div className="w-full md:w-[360px] lg:w-[380px] h-full flex flex-col border-r border-[#E5E5E5] bg-white shrink-0">
      {/* ── Header ───────────────────────────────────── */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight">
            Chats
          </h1>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#606060] hover:bg-[#F2F2F2] transition-colors"
            aria-label="New conversation"
          >
            <SquarePen size={20} />
          </button>
        </div>

        {/* ── Search ───────────────────────────────── */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA0AB] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full h-9 pl-9 pr-3 rounded-full bg-[#F2F2F2] text-[13px] text-[#1A1A1A] outline-none placeholder-[#9CA0AB] transition-colors focus:bg-[#EBEBEB] focus:ring-1 focus:ring-[#990011]/20"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* ── Filter tabs ──────────────────────────────── */}
      <div className="flex gap-1 px-5 pb-2 pt-1">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 text-[12px] font-medium rounded-full transition-all duration-150 ${
              filter === key
                ? "bg-[#990011]/10 text-[#990011]"
                : "text-[#606060] hover:bg-[#F2F2F2]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Conversation list ────────────────────────── */}
      <div className="flex-1 overflow-y-auto chat-scrollbar px-1 pb-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#9CA0AB]">
            <Users size={32} strokeWidth={1.5} />
            <p className="mt-2 text-sm">No conversations found</p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              usersMap={usersMap}
              currentUser={currentUser}
              messagesMap={messagesMap}
              isSelected={selectedId === conv.id}
              onClick={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ChatSidebar
