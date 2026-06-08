import React, { useState, useEffect } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetUserProfileQuery,
  useUpdateMeetingAvatarMutation,
} from "@/store/api/userApi"
import { toast } from "react-hot-toast"
import Avatar from "@/shared/components/ui/Avatar"
import { Check } from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const AvatarUrlPicker = ({ className = "p-4" }) => {
  const { t } = useLanguage()
  const { localParticipant } = useGlobalVideoCall()

  const { data: profileData } = useGetUserProfileQuery()
  const currentAvatarUrl = profileData?.data?.meetingAvatarUrl || ""

  const [inputUrl, setInputUrl] = useState("")
  const [updateMeetingAvatar, { isLoading }] = useUpdateMeetingAvatarMutation()

  useEffect(() => {
    if (currentAvatarUrl) setInputUrl(currentAvatarUrl)
  }, [currentAvatarUrl])

  const handleSave = async () => {
    try {
      await updateMeetingAvatar({ meetingAvatarUrl: inputUrl }).unwrap()
      toast.success(
        t?.rooms?.avatarPicker?.success || "Avatar updated successfully",
      )
    } catch (err) {
      toast.error(t?.rooms?.avatarPicker?.error || "Failed to update avatar")
    }
  }

  return (
    <div className={`flex flex-col h-full w-full ${className}`}>
      <div className="font-medium mb-6">
        {t?.rooms?.avatarPicker?.title || "Meeting Avatar"}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-center">
          <Avatar
            size={120}
            src={inputUrl || currentAvatarUrl}
            className="shadow-md"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label>{t?.rooms?.avatarPicker?.imageUrl || "Image URL"}</label>

          <TextInput
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={
              t?.rooms?.avatarPicker?.placeholder || "Paste image URL here..."
            }
            className="!h-12 !text-base"
          />

          <p className="text-xs text-[#606060]">
            {t?.rooms?.avatarPicker?.description ||
              "Paste a valid image URL. If invalid, it will fallback to your initial."}
          </p>
        </div>

        <PillButton
          onClick={handleSave}
          disabled={inputUrl === currentAvatarUrl}
          loading={isLoading}
          loadingText={t?.rooms?.avatarPicker?.saving || "Saving..."}
          startIcon={<Check size={16} />}
          className="mt-2 w-full"
        >
          {t?.rooms?.avatarPicker?.saveAvatar || "Save Avatar"}
        </PillButton>
      </div>
    </div>
  )
}

export default AvatarUrlPicker
