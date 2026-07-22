import { Check } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"

/**
 * ChatBubbleReadStatus — renders seen user avatars or single sent checkmark.
 */
const ChatBubbleReadStatus = ({
  isLastMessageInChat,
  hasBeenSeen,
  readers = [],
  isOwn,
}) => {
  if (!isLastMessageInChat || (!isOwn && (!hasBeenSeen || readers.length === 0))) {
    return null
  }

  return (
    <div
      className={`flex items-center gap-1 select-none pr-1 mt-0.5 ${
        isOwn ? "justify-end" : "justify-start pl-[48px]"
      }`}
    >
      {hasBeenSeen && readers.length > 0 ? (
        <div className="flex items-center -space-x-1 justify-end">
          {readers.map((u) => {
            const theme = getParticipantTheme(u.id || u.name || "")
            return (
              <Avatar
                key={u.id}
                size={16}
                name={u.name}
                src={u.avatar}
                title={`Seen by ${u.name}`}
                className={`border border-white dark:border-zinc-900 shadow-xs ${theme.avatarClass}`}
              />
            )
          })}
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
