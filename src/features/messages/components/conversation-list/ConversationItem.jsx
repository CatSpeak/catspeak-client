import React from "react"
import { useSelector } from "react-redux"
import Avatar from "@/shared/components/ui/Avatar"
import { useLanguage } from "@/shared/context/LanguageContext"
import { selectUnreadForConversation } from "@/store/slices/notificationSlice"
import { useAuth } from "@/features/auth"

const ConversationItem = ({ conversation, onClick }) => {
  const { t } = useLanguage()
  const { user } = useAuth()
  
  const username =
    conversation?.friend?.username || t.components.messages.unknownUser
  const avatarSrc = conversation?.friend?.avatar || null

  const unreadCountRedux = useSelector(
    selectUnreadForConversation(conversation?.conversationId),
  )
  
  const unreadCount = conversation?.unreadCount ?? unreadCountRedux

  const isYou = conversation?.lastMessageSenderId === user?.accountId

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-[#F2F2F2]"
    >
      <div className="flex items-center gap-3">
        <Avatar size={40} src={avatarSrc} name={username} alt={username} />
        <div className="flex flex-col text-left">
          <span className="text-base">{username}</span>
          <span className="text-sm truncate max-w-[200px] text-[#606060]">
            {conversation?.lastMessage ? (
              <>
                {isYou && <span className="font-medium">{t.you || "You"}: </span>}
                {conversation.lastMessage}
              </>
            ) : (
              t.components.messages.noMessages
            )}
          </span>
        </div>
      </div>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  )
}

export default ConversationItem
