import React from "react"
import { ArrowLeft } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { useLanguage } from "@/shared/context/LanguageContext"

const ConversationDetailHeader = ({ conversation, onBack, onClose }) => {
  const { t } = useLanguage()

  if (!conversation) return null

  const username = conversation?.friend?.username || t.messages.unknownUser
  const avatarSrc = conversation?.friend?.avatar || null

  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Avatar size={40} src={avatarSrc} name={username} alt={username} />
          <span className="font-medium text-gray-900">{username}</span>
        </div>
      </div>
    </div>
  )
}

export default ConversationDetailHeader
