import React from "react"
import { Users } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * MentionAutocomplete — Popup dropdown floating above ChatInput
 * showing autocomplete suggestions for @mentions in conversations.
 */
const MentionAutocomplete = ({
  items = [],
  selectedIndex = 0,
  onSelect,
}) => {
  const { t } = useLanguage()

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="absolute bottom-full mb-2 left-4 right-4 sm:right-auto sm:w-72 max-h-56 overflow-y-auto z-40 bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-border divide-y divide-border/40 animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="px-3 py-1.5 bg-neutral-50 dark:bg-zinc-900/60 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
        {t?.chat?.mentions?.mentionPrompt || "Mention someone"}
      </div>

      <div className="py-1">
        {items.map((item, index) => {
          const isSelected = index === selectedIndex

          if (item.isAll) {
            return (
              <div
                key="mention-all"
                onClick={() => onSelect(item)}
                className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-primary/10 border-l-2 border-primary"
                    : "hover:bg-neutral-50 dark:hover:bg-zinc-700/50"
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Users size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                    @all
                  </p>
                  <p className="text-[10px] text-neutral-400 truncate">
                    {item.fullName}
                  </p>
                </div>
              </div>
            )
          }

          return (
            <div
              key={item.accountId || index}
              onClick={() => onSelect(item)}
              className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                isSelected
                  ? "bg-primary/10 border-l-2 border-primary"
                  : "hover:bg-neutral-50 dark:hover:bg-zinc-700/50"
              }`}
            >
              <Avatar
                size={28}
                name={item.username || item.fullName}
                src={item.avatarImageUrl}
                className="shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                  @{item.username}
                </p>
                {item.fullName && item.fullName !== item.username && (
                  <p className="text-[10px] text-neutral-400 truncate">
                    {item.fullName}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default React.memo(MentionAutocomplete)
