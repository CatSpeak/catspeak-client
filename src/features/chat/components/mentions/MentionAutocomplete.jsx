import React from "react"
import { Users } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * MentionAutocomplete — Popup dropdown floating above ChatInput
 * showing autocomplete suggestions for @mentions in conversations.
 */
const MentionAutocomplete = ({ items = [], selectedIndex = 0, onSelect }) => {
  const { t } = useLanguage()

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="py-2 absolute bottom-full left-4 right-4 sm:right-auto sm:w-[360px] max-h-56 overflow-y-auto z-40 bg-white rounded-xl shadow-xl border border-border animate-in fade-in slide-in-from-bottom-2 duration-150">
      {items.map((item, index) => {
        const isSelected = index === selectedIndex

        if (item.isAll) {
          return (
            <div
              key="mention-all"
              onClick={() => onSelect(item)}
              className={`h-14 flex items-center gap-4 px-4 cursor-pointer transition-colors ${
                isSelected
                  ? "bg-[#F2F2F2] hover:bg-[#E6E6E6] border-l-2 border-primary"
                  : "hover:bg-[#F2F2F2]"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                <Users />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate">{item.fullName}</p>
              </div>
            </div>
          )
        }

        return (
          <div
            key={item.accountId || index}
            onClick={() => onSelect(item)}
            className={`h-14 flex items-center gap-4 px-4 cursor-pointer transition-colors ${
              isSelected
                ? "bg-[#F2F2F2] hover:bg-[#E6E6E6] border-l-2 border-primary"
                : "hover:bg-[#F2F2F2]"
            }`}
          >
            <Avatar
              size={40}
              name={item.username || item.fullName}
              src={item.avatarImageUrl}
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate">{item.fullName || item.username}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default React.memo(MentionAutocomplete)
