import { Check } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"

/**
 * ChatBubbleReadStatus — renders seen user avatars (capped) or single sent checkmark.
 */
const MAX_VISIBLE_READERS = 4

const ChatBubbleReadStatus = ({
  isLastMessageInChat,
  readers = [],
  isOwn,
}) => {
  const hasReaders = readers && readers.length > 0

  // Show stacked avatars on any message where readers exist.
  // If no readers, only show sent checkmark for user's own last message in chat.
  if (!hasReaders && (!isLastMessageInChat || !isOwn)) {
    return null
  }

  const visibleReaders = (readers || []).slice(0, MAX_VISIBLE_READERS)
  const extraCount = (readers?.length || 0) - visibleReaders.length

  return (
    <div
      className={`flex items-center gap-1 select-none pr-1 mt-0.5 ${
        isOwn ? "justify-end" : "justify-start pl-[48px]"
      }`}
    >
      {hasReaders ? (
        <div className="flex items-center -space-x-1 justify-end animate-in fade-in duration-200">
          {visibleReaders.map((u) => {
            const theme = getParticipantTheme(u.id || u.name || "")
            return (
              <Avatar
                key={u.id}
                size={16}
                name={u.name}
                src={u.avatar}
                title={`Seen by ${u.name}`}
                className={`border border-white dark:border-zinc-900 shadow-xs ring-1 ring-white/50 ${theme.avatarClass}`}
              />
            )
          })}
          {extraCount > 0 && (
            <div
              className="flex h-4 min-w-4 items-center justify-center rounded-full border border-white dark:border-zinc-900 bg-[#e4e6eb] dark:bg-zinc-700 px-1 text-[10px] font-semibold text-[#65676b] dark:text-zinc-200 shadow-xs"
              title={`Seen by ${readers.map((u) => u.name).join(", ")}`}
            >
              +{extraCount}
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex h-4 w-4 items-center justify-center rounded-full bg-[#b0b0b0] dark:bg-zinc-600 text-white"
          title="Sent"
        >
          <Check size={10} strokeWidth={3} />
        </div>
      )}
    </div>
  )
}

export default ChatBubbleReadStatus
