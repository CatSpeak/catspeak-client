import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import MeetingAvatarPicker from "./MeetingAvatarPicker"

/**
 * AvatarUrlPicker — in-call side panel for changing the meeting-room avatar.
 * Now backed by file upload + crop via the shared MeetingAvatarPicker.
 */
const AvatarUrlPicker = ({ className = "" }) => {
  const { t } = useLanguage()

  return (
    <div className={`flex flex-col h-full w-full ${className}`}>
      <div className="font-bold min-h-[56px] flex items-center px-4 py-2.5">
        {t?.rooms?.avatarPicker?.title || "Meeting Avatar"}
      </div>
      <MeetingAvatarPicker className="p-4" />
    </div>
  )
}

export default AvatarUrlPicker
