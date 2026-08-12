import React from "react"
import Avatar from "@/shared/components/ui/Avatar"
import { parseMetadata } from "@/features/video-call/hooks/useParticipantList"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Users } from "lucide-react"

/**
 * MentionPopover — floating dropdown for @ mention autocomplete in video call chat.
 */
const MentionPopover = ({
  participants = [],
  selectedIndex = 0,
  onSelect,
}) => {
  const { t } = useLanguage()
  const chatT = t?.rooms?.chatBox || {}

  if (!participants || participants.length === 0) return null

  return (
    <div className="absolute bottom-full left-0 mb-2 w-72 max-h-60 overflow-y-auto bg-white border border-neutral-200/90 rounded-2xl shadow-xl z-50 py-1.5">
      <div className="flex flex-col py-1">
        {participants.map((p, idx) => {
          const isSelected = idx === selectedIndex

          if (p.isAll) {
            return (
              <button
                key="mention-all"
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  onSelect(p)
                }}
                className={`flex items-center gap-2.5 px-3 py-2 text-left w-full transition-colors cursor-pointer border-b border-neutral-100 ${
                  isSelected
                    ? "bg-red-50 text-[#990011] font-bold"
                    : "hover:bg-neutral-50 text-neutral-800"
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#990011] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <Users size={14} />
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#990011]">
                      @All
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 truncate">
                    {chatT.mentionAllDesc || "Tất cả thành viên trong phòng"}
                  </span>
                </div>
              </button>
            )
          }

          const meta = parseMetadata(p.metadata)
          const name =
            p.name ||
            meta.nickname ||
            meta.username ||
            p.identity ||
            "Thành viên"
          const avatarUrl = meta.avatarImageUrl || p.avatarUrl

          return (
            <button
              key={p.identity || idx}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault() // prevent input blur
                onSelect(p)
              }}
              className={`flex items-center gap-2.5 px-3 py-2 text-left w-full transition-colors cursor-pointer ${
                isSelected
                  ? "bg-red-50 text-[#990011] font-bold"
                  : "hover:bg-neutral-50 text-neutral-800"
              }`}
            >
              <Avatar src={avatarUrl} name={name} size={28} />

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs truncate ${isSelected ? "font-bold text-[#990011]" : "font-semibold"}`}>
                    {name}
                  </span>
                </div>
                {meta.email && (
                  <span className="text-[10px] text-neutral-400 truncate">
                    {meta.email}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MentionPopover
