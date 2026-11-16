import React from "react"
import { Users } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"

/**
 * MentionAutocomplete — Popup dropdown floating above ChatInput
 * showing autocomplete suggestions for @mentions in conversations.
 */
const MentionAutocomplete = ({ items = [], selectedIndex = 0, onSelect }) => {

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="py-2 absolute bottom-full left-4 right-4 sm:right-auto sm:w-[360px] max-h-56 overflow-y-auto z-40 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-xl border border-border dark:border-[#3F3F3F] animate-in fade-in slide-in-from-bottom-2 duration-150">
      {items.map((item, index) => {
        const isSelected = index === selectedIndex

        if (item.isAll) {
          return (
            <div
              key="mention-all"
              onClick={() => onSelect(item)}
              className={`h-14 flex items-center gap-4 px-4 cursor-pointer transition-colors ${
                isSelected
                  ? "bg-itemHover dark:bg-[#272727] hover:bg-itemActiveHover dark:hover:bg-[#3D3D3D] border-l-2 border-primary dark:border-red-400"
                  : "hover:bg-itemHover dark:hover:bg-[#272727] active:bg-itemActiveHover dark:active:bg-[#3D3D3D]"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Users />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900 dark:text-white">{item.fullName}</p>
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
                ? "bg-itemHover dark:bg-[#272727] hover:bg-itemActiveHover dark:hover:bg-[#3D3D3D] border-l-2 border-primary dark:border-red-400"
                : "hover:bg-itemHover dark:hover:bg-[#272727] active:bg-itemActiveHover dark:active:bg-[#3D3D3D]"
            }`}
          >
            <Avatar
              size={40}
              name={item.username || item.fullName}
              src={item.avatarImageUrl}
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900 dark:text-white">{item.fullName || item.username}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default React.memo(MentionAutocomplete)
