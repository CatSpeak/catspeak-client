import React from "react"
import { X } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { IconButton } from "@/shared/components/ui/buttons"
import MeetingAvatarPicker from "./MeetingAvatarPicker"

/**
 * AvatarUrlPicker — in-call side panel for changing the meeting-room avatar.
 * Now backed by file upload + crop via the shared MeetingAvatarPicker.
 */
const AvatarUrlPicker = ({ className = "", onClose, hideTitle = false }) => {
  const { t } = useLanguage()

  return (
    <div className={`flex flex-col h-full w-full ${className}`}>
      {!hideTitle && (
        <div className="font-bold min-h-[56px] flex items-center justify-between gap-2 pl-4 pr-1 py-2.5 border-b border-border dark:border-[#3F3F3F]">
          <span className="truncate">
            {t?.rooms?.avatarPicker?.title || "Meeting Avatar"}
          </span>
          {onClose && (
            <IconButton
              variant="ghost"
              onClick={onClose}
              title={t?.common?.close || "Đóng"}
              aria-label={t?.common?.close || "Đóng"}
              className="shrink-0"
            >
              <X />
            </IconButton>
          )}
        </div>
      )}
      <MeetingAvatarPicker className="p-4" />
    </div>
  )
}

export default AvatarUrlPicker
