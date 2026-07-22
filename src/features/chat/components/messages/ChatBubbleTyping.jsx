import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"

/**
 * ChatBubbleTyping — renders a typing indicator with avatar and bouncing dots.
 */
const ChatBubbleTyping = ({ sender }) => {
  const avatarSrc = sender?.avatar || sender?.avatarImageUrl
  const name = sender?.username || sender?.name || "Someone"

  return (
    <div className="mt-3 flex flex-col gap-1 items-start">
      <div className="flex items-baseline gap-1 text-sm pl-[48px]">
        <span className="font-semibold">{name}</span>
      </div>
      <div className="flex items-end gap-2 w-full justify-start">
        <div className="w-10 shrink-0">
          <Avatar
            size={40}
            name={name}
            src={avatarSrc}
            className={
              getParticipantTheme(sender?.id || sender?.accountId || name)
                .avatarClass
            }
          />
        </div>
        <div className="rounded-2xl bg-[#F2F2F2] dark:bg-zinc-800 px-4 py-3 min-h-[40px] flex items-center gap-1.5 shadow-xs">
          <span className="w-[6px] h-[6px] bg-[#606060] rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-[6px] h-[6px] bg-[#606060] rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-[6px] h-[6px] bg-[#606060] rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  )
}

export default ChatBubbleTyping
