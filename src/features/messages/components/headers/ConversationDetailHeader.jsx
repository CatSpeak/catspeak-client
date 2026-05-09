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
    <div className="flex items-center justify-between border-b border-[#e5e5e5] px-3 py-2">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
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
