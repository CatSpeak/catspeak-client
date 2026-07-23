import React from "react"
import { ArrowLeft } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import GroupAvatar from "../GroupAvatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { useLanguage } from "@/shared/context/LanguageContext"

const ConversationDetailHeader = ({ conversation, onBack, onClose }) => {
  const { t } = useLanguage()

  if (!conversation) return null

  const isGroup = conversation.isGroup
  const otherUser = conversation.friend
  const name = isGroup
    ? conversation.groupName || conversation.name
    : otherUser?.username || t?.messages?.unknownUser || "Unknown User"

  const memberCount = conversation.participants?.length || 0
  const statusText = isGroup ? `${memberCount} members` : null

  const friendTheme = getParticipantTheme(
    otherUser?.accountId || otherUser?.username || "",
  )

  return (
    <div className="flex items-center justify-between border-b border-[#e5e5e5] px-3 py-2 shrink-0">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {isGroup ? (
            <GroupAvatar conversation={conversation} size={36} />
          ) : (
            <Avatar
              size={36}
              src={otherUser?.avatarImageUrl || otherUser?.avatar}
              name={name}
              alt={name}
              className={friendTheme.avatarClass}
            />
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-gray-900 truncate">
              {name}
            </span>
            {statusText && (
              <span className="text-[11px] text-[#606060] truncate">
                {statusText}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConversationDetailHeader
