import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import MeetingAvatarPicker from "./MeetingAvatarPicker"

/**
 * AvatarUrlPicker — in-call side panel for changing the meeting-room avatar.
 * Now backed by file upload + crop via the shared MeetingAvatarPicker.
 */
const AvatarUrlPicker = ({ className = "p-4" }) => {
  const { t } = useLanguage()

  return (
    <div className={`flex flex-col h-full w-full ${className}`}>
      <div className="font-medium mb-6">
        {t?.rooms?.avatarPicker?.title || "Meeting Avatar"}
      </div>
      <MeetingAvatarPicker className="p-0" />
    </div>
  )
}

export default AvatarUrlPicker