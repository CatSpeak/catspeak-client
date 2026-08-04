import React, { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import {
  useGetUserProfileQuery,
  useUpdateMeetingAvatarMutation,
} from "@/store/api/userApi"
import { toast } from "react-hot-toast"
import Avatar from "@/shared/components/ui/Avatar"
import { Check } from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { safeSetLiveKitMetadata } from "@/features/video-call/utils/livekitMetadataUtils"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const AvatarUrlPicker = ({ className = "p-4" }) => {
  const { t } = useLanguage()
  const { localParticipant } = useGlobalVideoCall()
  const { isAuthenticated } = useAuth()

  const { data: profileData } = useGetUserProfileQuery(undefined, { skip: !isAuthenticated })
  const currentAvatarUrl = profileData?.data?.meetingAvatarUrl || ""

  const [inputUrl, setInputUrl] = useState(currentAvatarUrl)
  const [prevAvatarUrl, setPrevAvatarUrl] = useState(currentAvatarUrl)

  if (currentAvatarUrl !== prevAvatarUrl) {
    setPrevAvatarUrl(currentAvatarUrl)
    setInputUrl(currentAvatarUrl)
  }

  const [updateMeetingAvatar, { isLoading }] = useUpdateMeetingAvatarMutation()

  const handleSave = async () => {
    const trimmed = (inputUrl || "").trim()

    if (trimmed.startsWith("data:")) {
      toast.error(
        t?.rooms?.avatarPicker?.invalidUrl || "Base64 data URLs are not allowed. Please enter an http/https image URL."
      )
      return
    }

    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      toast.error(
        t?.rooms?.avatarPicker?.invalidProtocol || "Image URL must start with http:// or https://"
      )
      return
    }

    try {
      await updateMeetingAvatar({ meetingAvatarUrl: trimmed }).unwrap()

      if (localParticipant) {
        await safeSetLiveKitMetadata(localParticipant, { avatarImageUrl: trimmed })
      }

      toast.success(
        t?.rooms?.avatarPicker?.success || "Avatar updated successfully",
      )
    } catch (err) {
      console.error("Failed to save meeting avatar", err)
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
