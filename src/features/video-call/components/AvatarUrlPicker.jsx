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
      <div className="text-sm font-medium text-gray-900 mb-6">
        {t?.rooms?.avatarPicker?.title || "Meeting Avatar"}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-center">
          <Avatar
            size={120}
            src={inputUrl || currentAvatarUrl}
            className="border-2 border-white shadow-md"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500 font-medium">
            {t?.rooms?.avatarPicker?.imageUrl || "Image URL"}
          </label>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={
              t?.rooms?.avatarPicker?.placeholder || "Paste image URL here..."
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:border-[#990011] transition-colors"
          />
          <p className="text-[10px] text-gray-400">
            {t?.rooms?.avatarPicker?.description ||
              "Paste a valid image URL. If invalid, it will fallback to your initial."}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isLoading || inputUrl === currentAvatarUrl}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-[#990011] text-white py-2.5 rounded-md text-sm font-medium hover:bg-[#7a000d] disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            t?.rooms?.avatarPicker?.saving || "Saving..."
          ) : (
            <>
              <Check size={16} />{" "}
              {t?.rooms?.avatarPicker?.saveAvatar || "Save Avatar"}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default AvatarUrlPicker
