import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, X } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import GroupAvatar from "../GroupAvatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getProfilePath } from "@/shared/utils/navigation"
import IconButton from "@/shared/components/ui/buttons/IconButton"

const ConversationDetailHeader = ({ conversation, onBack, onClose }) => {
  const { t } = useLanguage()
  const navigate = useNavigate()

  if (!conversation) return null

  const isGroup = conversation.isGroup
  const otherUser = conversation.friend
  const friendId = otherUser?.accountId || otherUser?.id
  const name = isGroup
    ? conversation.groupName || conversation.name
    : otherUser?.username || t?.messages?.unknownUser || "Unknown User"

  const memberCount = conversation.participants?.length || 0
  const statusText = isGroup
    ? (t?.chat?.membersCount || "{{count}} members").replace(
        /\{\{count\}\}|\{count\}/g,
        memberCount,
      )
    : null

  const friendTheme = getParticipantTheme(
    otherUser?.accountId || otherUser?.username || "",
  )

  const handleProfileClick = () => {
    if (friendId) {
      navigate(getProfilePath(friendId))
    }
  }

  // ── Group Conversation Header (Height: 72px) ──────────────────────────
  if (isGroup) {
    return (
      <div className="flex items-center justify-between border-b border-border pl-1 pr-4 h-[72px] shrink-0">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <IconButton
            onClick={onBack}
            variant="ghost"
            aria-label={t.common?.back || t.messages?.back || "Back"}
          >
            <ArrowLeft />
          </IconButton>
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <GroupAvatar conversation={conversation} size={40} />
            <div className="flex flex-col min-w-0">
              <span className="truncate">{name}</span>
              {statusText && (
                <span className="text-sm text-secondary truncate">
                  {statusText}
                </span>
              )}
            </div>
          </div>
        </div>
        {onClose && (
          <IconButton
            onClick={onClose}
            variant="ghost"
            aria-label={t?.messages?.close || t?.common?.close || "Close"}
            title={t?.messages?.close || t?.common?.close || "Close"}
          >
            <X />
          </IconButton>
        )}
      </div>
    )
  }

  // ── Normal 1:1 Conversation Header (Height: 56px / h-14) ──────────────
  return (
    <div className="flex items-center justify-between border-b border-border pr-4 pl-1 h-14 shrink-0">
      <div className="flex items-center gap-1 min-w-0 flex-1">
        <IconButton
          onClick={onBack}
          variant="ghost"
          aria-label={t.common?.back || t.messages?.back || "Back"}
        >
          <ArrowLeft />
        </IconButton>
        <div
          onClick={friendId ? handleProfileClick : undefined}
          className={`flex items-center gap-4 min-w-0 flex-1 ${friendId ? "cursor-pointer group" : ""}`}
        >
          <Avatar
            size={40}
            src={otherUser?.avatarImageUrl || otherUser?.avatar}
            name={name}
            alt={name}
            clickable={false}
            className={friendTheme.avatarClass}
          />
          <div className="flex flex-col min-w-0">
            <span
              className={`truncate transition-colors ${
                friendId ? "group-hover:underline group-hover:text-primary" : ""
              }`}
            >
              {name}
            </span>
          </div>
        </div>
      </div>
      {onClose && (
        <IconButton
          onClick={onClose}
          variant="ghost"
          aria-label={t?.messages?.close || t?.common?.close || "Close"}
          title={t?.messages?.close || t?.common?.close || "Close"}
        >
          <X />
        </IconButton>
      )}
    </div>
  )
}

export default ConversationDetailHeader
