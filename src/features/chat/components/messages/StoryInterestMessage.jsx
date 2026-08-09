import { memo } from "react"
import Avatar from "@/shared/components/ui/Avatar"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { BookOpen } from "lucide-react"

/**
 * Parses a StoryInterest content string into { senderName, storySnippet }.
 *
 * Expected format: "{SenderName} is interested in your story: \"{snippet}\""
 * Falls back gracefully when the format doesn't match.
 */
const parseStoryInterestContent = (content = "") => {
  // Try to match: "... is interested in your story: "quote""
  const match = content.match(/^(.+?) is interested in your story:\s*"(.+)"$/i)
  if (match) {
    return { senderName: match[1].trim(), storySnippet: match[2].trim() }
  }
  // Fallback: return raw content as the snippet
  return { senderName: null, storySnippet: content }
}

/**
 * StoryInterestMessage — displays a StoryInterest notification (messageType 6) in chat.
 *
 * Renders as a centered card showing:
 *   - Sender avatar + name
 *   - "is interested in your story" label
 *   - A preview card with the story snippet
 *   - Timestamp
 *
 * No reply / recall / copy actions — this is an auto-generated event.
 *
 * @param {object} message  - The raw message object
 * @param {object} sender   - Resolved sender { name, avatar }
 */
const StoryInterestMessage = memo(({ message, sender }) => {
  const { formatTime } = useTimezone()
  const content = message?.content || message?.messageContent || ""
  const { storySnippet } = parseStoryInterestContent(content)
  const timestamp = message?.timestamp || message?.createDate

  const senderName = sender?.name || sender?.username || "Someone"
  const senderAvatar = sender?.avatar || sender?.avatarImageUrl

  return (
    <div className="flex justify-center w-full my-3 px-4">
      <div
        className={[
          "relative flex flex-col items-center gap-3 w-full max-w-[320px]",
          "bg-white dark:bg-zinc-900",
          "border border-border/60 dark:border-zinc-700",
          "rounded-2xl px-5 py-4 shadow-sm",
        ].join(" ")}
      >
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r from-[#990011]/60 via-[#cc0015]/80 to-[#990011]/60" />

        {/* Sender row */}
        <div className="flex flex-col items-center gap-1.5 pt-1">
          <Avatar
            size={36}
            name={senderName}
            src={senderAvatar}
            className="ring-2 ring-[#990011]/20"
          />
          <p className="text-[13px] text-center leading-snug text-foreground/80 dark:text-zinc-300">
            <span className="font-semibold text-foreground dark:text-white">
              {senderName}
            </span>
            {" "}
            <span className="text-[#606060] dark:text-zinc-400">
              is interested in your story
            </span>
          </p>
        </div>

        {/* Story snippet card */}
        {storySnippet && (
          <div
            className={[
              "flex items-start gap-2 w-full",
              "bg-[#F7F7F8] dark:bg-zinc-800",
              "border border-border/40 dark:border-zinc-700/60",
              "rounded-xl px-3.5 py-2.5",
            ].join(" ")}
          >
            <BookOpen
              size={14}
              className="shrink-0 mt-0.5 text-[#990011] opacity-70"
            />
            <p className="text-xs text-[#444] dark:text-zinc-300 leading-relaxed break-words line-clamp-3 italic">
              "{storySnippet}"
            </p>
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <p className="text-[10px] text-[#999] dark:text-zinc-500 -mt-1 self-end">
            {formatTime(timestamp)}
          </p>
        )}
      </div>
    </div>
  )
})

StoryInterestMessage.displayName = "StoryInterestMessage"

export default StoryInterestMessage
