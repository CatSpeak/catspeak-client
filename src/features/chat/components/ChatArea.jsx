import { memo, useEffect, useRef } from "react"
import { ArrowLeft, PanelRight } from "lucide-react"
import ChatBubble from "./ChatBubble"
import ChatInput from "./ChatInput"
import DateSeparator from "./DateSeparator"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import FluentCard from "@/shared/components/ui/FluentCard"
import { IconButton } from "@/shared/components/ui/buttons"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import { useGroupedMessages } from "../hooks/useGroupedMessages"

/**
 * ChatArea — main chat view with header, messages, and input.
 */
const ChatArea = ({
  conversation,
  messages = [],
  currentUser,
  inputValue,
  onInputChange,
  onSend,
  onBack,
  onToggleInfo,
  showInfoActive,
  friendOnlineStatus,
  isLoading,
}) => {
  const scrollRef = useRef(null)

  console.log(messages)

  const groupedItems = useGroupedMessages({
    messages,
    currentUser,
    conversation,
    isLoading,
  })

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!conversation) return null

  const isGroup = conversation.isGroup
  const otherUser = conversation.friend
  const name = conversation.name
  const isOnline = !isGroup && !!friendOnlineStatus[otherUser?.accountId]
  const memberCount = conversation.participants?.length || 0

  // Status text for header
  const statusText = isGroup
    ? `${memberCount} members`
    : isOnline
      ? "Active now"
      : "Offline"

  // ── Render message list from grouped items hook ──
  const renderMessages = () => {
    return groupedItems.map((item) => {
      if (item.type === "date") {
        return <DateSeparator key={item.id} timestamp={item.timestamp} />
      }
      return (
        <ChatBubble
          key={item.id}
          message={item.message}
          isOwn={item.isOwn}
          isFirstInGroup={item.isFirstInGroup}
          isLastInGroup={item.isLastInGroup}
          sender={item.sender}
          isGroupChat={item.isGroupChat}
          shouldAnimate={item.shouldAnimate}
        />
      )
    })
  }

  return (
    <FluentCard className="flex-1 overflow-hidden" padding="p-0">
      {/* ── Chat Header ────────────────────────────── */}
      <div className="flex items-center justify-between px-4 h-[72px] border-b border-[#E5E5E5] shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          {/* Back button — visible on mobile only */}
          <IconButton
            onClick={onBack}
            size="sm"
            variant="ghost"
            className="flex lg:hidden"
            aria-label="Back to conversations"
          >
            <ArrowLeft />
          </IconButton>

          {/* Avatar */}
          {isGroup ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#990011] to-[#c00015] flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">
                {name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          ) : (
            <div className="relative shrink-0">
              <Avatar
                size={40}
                name={otherUser?.username}
                src={otherUser?.avatarImageUrl}
                className={
                  getParticipantTheme(
                    otherUser?.accountId || otherUser?.username || "",
                  ).avatarClass
                }
              />
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-white" />
              )}
            </div>
          )}

          {/* Name + status */}
          <div className="min-w-0">
            <h2 className="font-semibold truncate">{name}</h2>
            <p className="text-sm text-[#606060] flex items-center gap-1">
              {!isGroup && isOnline && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] inline-block" />
              )}
              {statusText}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5">
          <IconButton
            onClick={onToggleInfo}
            size="sm"
            variant="ghost"
            aria-label="Toggle info panel"
          >
            <PanelRight />
          </IconButton>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 min-h-0">
        {isLoading ? (
          <div className="flex flex-col gap-4 p-4 h-full justify-end">
            {/* Other User Message Skeleton */}
            <div className="flex items-end gap-2 max-w-[70%]">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-10 w-48 rounded-2xl rounded-bl-none" />
              </div>
            </div>

            {/* Current User Message Skeleton */}
            <div className="flex items-end gap-2 max-w-[70%] self-end flex-row-reverse">
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-10 w-36 rounded-2xl rounded-br-none" />
              </div>
            </div>

            {/* Other User Message Skeleton */}
            <div className="flex items-end gap-2 max-w-[70%]">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-14 w-64 rounded-2xl rounded-bl-none" />
              </div>
            </div>

            {/* Current User Message Skeleton */}
            <div className="flex items-end gap-2 max-w-[70%] self-end flex-row-reverse">
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-10 w-52 rounded-2xl rounded-br-none" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1" />
            {renderMessages()}
          </>
        )}
      </div>

      {/* ── Input ──────────────────────────────────── */}
      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSend={onSend}
        disabled={isLoading}
      />
    </FluentCard>
  )
}

export default memo(ChatArea)
