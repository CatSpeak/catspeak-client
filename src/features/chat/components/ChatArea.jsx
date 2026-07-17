import { useEffect, useRef, memo } from "react"
import {
  ArrowLeft,
  Phone,
  Video,
  PanelRight,
  MoreVertical,
} from "lucide-react"
import ChatBubble from "./ChatBubble"
import ChatInput from "./ChatInput"
import {
  getConversationName,
  getOtherUser,
  getUserColor,
  formatDateSeparator,
  users as allUsers,
} from "../data/chatMockData"

/**
 * TypingIndicator — animated dots shown when someone is typing.
 */
const TypingIndicator = ({ typingUsers, usersMap }) => {
  if (!typingUsers || typingUsers.length === 0) return null

  const names = typingUsers
    .map((id) => usersMap[id]?.name?.split(" ")[0])
    .filter(Boolean)
  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : `${names.join(", ")} are typing`

  return (
    <div className="flex items-center gap-2 px-12 py-2">
      <div className="flex items-center gap-1 bg-[#F2F2F2] rounded-2xl px-3 py-2.5">
        <div className="chat-typing-dot" />
        <div className="chat-typing-dot" />
        <div className="chat-typing-dot" />
      </div>
      <span className="text-[11px] text-[#9CA0AB] italic">{label}</span>
    </div>
  )
}

/**
 * DateSeparator — horizontal line with date label between message groups.
 */
const DateSeparator = ({ timestamp }) => (
  <div className="chat-date-separator">
    <span>{formatDateSeparator(timestamp)}</span>
  </div>
)

/**
 * ChatArea — main chat view with header, messages, and input.
 *
 * Handles message grouping (consecutive same-sender within 5min),
 * date separators, typing indicator, and auto-scroll.
 *
 * @param {object}   conversation   - Active conversation
 * @param {Array}    messages       - Messages for active conversation
 * @param {object}   usersMap       - Users map
 * @param {object}   currentUser    - Current user
 * @param {string}   inputValue     - Chat input value
 * @param {function} onInputChange  - Input change handler
 * @param {function} onSend         - Send handler
 * @param {function} onBack         - Back to sidebar (mobile)
 * @param {function} onToggleInfo   - Toggle info panel
 * @param {boolean}  showInfoActive - Whether info panel is open
 */
const ChatArea = ({
  conversation,
  messages = [],
  usersMap,
  currentUser,
  inputValue,
  onInputChange,
  onSend,
  onBack,
  onToggleInfo,
  showInfoActive,
}) => {
  const scrollRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!conversation) return null

  const isGroup = conversation.type === "group"
  const otherUser = getOtherUser(conversation, usersMap)
  const name = getConversationName(conversation, usersMap)
  const isOnline = otherUser?.status === "online"
  const memberCount = conversation.participants.length

  // Status text for header
  const statusText = isGroup
    ? `${memberCount} members`
    : isOnline
      ? "Active now"
      : "Offline"

  // ── Build message list with grouping + date separators ──
  const renderMessages = () => {
    const elements = []
    let prevDate = null

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      const msgDate = new Date(msg.timestamp).toDateString()
      const prevMsg = i > 0 ? messages[i - 1] : null
      const nextMsg = i < messages.length - 1 ? messages[i + 1] : null

      // Date separator
      if (msgDate !== prevDate) {
        elements.push(
          <DateSeparator key={`date-${msgDate}`} timestamp={msg.timestamp} />,
        )
        prevDate = msgDate
      }

      // Grouping: same sender within 5 minutes
      const FIVE_MIN = 5 * 60 * 1000
      const isSameSenderAsPrev =
        prevMsg &&
        prevMsg.senderId === msg.senderId &&
        new Date(msg.timestamp) - new Date(prevMsg.timestamp) < FIVE_MIN &&
        new Date(msg.timestamp).toDateString() ===
          new Date(prevMsg.timestamp).toDateString()

      const isSameSenderAsNext =
        nextMsg &&
        nextMsg.senderId === msg.senderId &&
        new Date(nextMsg.timestamp) - new Date(msg.timestamp) < FIVE_MIN &&
        new Date(msg.timestamp).toDateString() ===
          new Date(nextMsg.timestamp).toDateString()

      const isFirstInGroup = !isSameSenderAsPrev
      const isLastInGroup = !isSameSenderAsNext
      const isOwn = msg.senderId === "me"
      const sender = isOwn ? currentUser : usersMap[msg.senderId]

      elements.push(
        <ChatBubble
          key={msg.id}
          message={msg}
          isOwn={isOwn}
          isFirstInGroup={isFirstInGroup}
          isLastInGroup={isLastInGroup}
          sender={sender}
          isGroupChat={isGroup}
        />,
      )
    }

    return elements
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      {/* ── Chat Header ────────────────────────────── */}
      <div className="flex items-center justify-between px-4 h-[64px] border-b border-[#E5E5E5] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button — visible on mobile only */}
          <button
            onClick={onBack}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-full text-[#606060] hover:bg-[#F2F2F2] transition-colors shrink-0"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Avatar */}
          {isGroup ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#990011] to-[#c00015] flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">
                {name?.charAt(0)}
              </span>
            </div>
          ) : (
            <div className="relative shrink-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                style={{
                  backgroundColor: getUserColor(otherUser?.id || ""),
                }}
              >
                {otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-white" />
              )}
            </div>
          )}

          {/* Name + status */}
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold text-[#1A1A1A] truncate">
              {name}
            </h2>
            <p className="text-[11px] text-[#9CA0AB] flex items-center gap-1">
              {!isGroup && isOnline && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] inline-block" />
              )}
              {statusText}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#606060] hover:bg-[#F2F2F2] transition-colors"
            aria-label="Voice call"
          >
            <Phone size={18} />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#606060] hover:bg-[#F2F2F2] transition-colors"
            aria-label="Video call"
          >
            <Video size={18} />
          </button>
          <button
            onClick={onToggleInfo}
            className={`hidden lg:flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              showInfoActive
                ? "bg-[#990011]/10 text-[#990011]"
                : "text-[#606060] hover:bg-[#F2F2F2]"
            }`}
            aria-label="Toggle info panel"
          >
            <PanelRight size={18} />
          </button>
          <button
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-full text-[#606060] hover:bg-[#F2F2F2] transition-colors"
            aria-label="More options"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto chat-scrollbar px-4 pb-2 min-h-0"
      >
        {/* Spacer to push messages down when few */}
        <div className="flex-1" />
        {renderMessages()}

        {/* Typing indicator */}
        <TypingIndicator
          typingUsers={conversation.typing}
          usersMap={usersMap}
        />
      </div>

      {/* ── Input ──────────────────────────────────── */}
      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSend={onSend}
      />
    </div>
  )
}

export default memo(ChatArea)
