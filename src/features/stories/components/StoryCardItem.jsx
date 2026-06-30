import React from "react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { MessageSquare } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"

dayjs.extend(relativeTime)

/**
 * Card component that displays a story's content, comment count, and relative time.
 *
 * @param {Object}   props
 * @param {Object}   props.story                  - Story data object
 * @param {string}   [props.story.storyContent]   - The story text content
 * @param {string}   [props.story.username]        - Author's display name
 * @param {string}   [props.story.avatarImageUrl]  - Author's avatar URL
 * @param {number}   [props.story.commentCount]    - Number of comments/replies
 * @param {string}   [props.story.createDate]      - ISO date string of creation
 * @param {Function} [props.onClick]              - Called when the card is clicked
 */
const StoryCardItem = ({ story, onClick }) => {
  if (!story) return null

  const {
    storyContent,
    username,
    avatarImageUrl,
    commentCount = 0,
    createDate,
  } = story

  const relativeCreatedAt = createDate ? dayjs(createDate).fromNow() : null

  return (
    <div
      onClick={onClick}
      className={`flex max-w-[230px] max-h-[164px] cursor-pointer flex-col gap-2 rounded-2xl bg-white p-4 shadow-faq-card`}
    >
      {/* Header: avatar + username */}
      <div className="flex items-center gap-2.5">
        <Avatar
          src={avatarImageUrl}
          name={username || "Anonymous"}
          size={36}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#1a1a1a]">
            {username || "Anonymous"}
          </p>
          {username && (
            <p className="truncate text-xs text-[#9e9e9e]">
              @{username.toLowerCase().replace(/\s+/g, "")}
            </p>
          )}
        </div>
      </div>

      {/* Story content */}
      <p className="line-clamp-3 flex-1 break-words text-sm leading leading-[1.4] text-[#3d3d3d]">
        {storyContent}
      </p>

      {/* Footer: comment count + time */}
      <div className="flex items-center gap-4 text-xs text-[#9e9e9e] mt-auto">
        <span className="flex items-center gap-1">
          <MessageSquare size={13} className="shrink-0" />
          {commentCount} phản hồi
        </span>

        {relativeCreatedAt && (
          <span className="ml-auto shrink-0">{relativeCreatedAt}</span>
        )}
      </div>
    </div>
  )
}

export default StoryCardItem
