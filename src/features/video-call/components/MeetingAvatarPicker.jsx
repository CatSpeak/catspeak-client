import React, { useRef, useState } from "react"
import toast from "react-hot-toast"
import { Upload, RotateCcw } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import ImageCropModal from "@/shared/components/ui/ImageCropModal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useUpdateMeetingAvatarMutation,
  useUploadMeetingAvatarMutation,
} from "@/store/api/userApi"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useMeetingAvatar } from "@/features/video-call/hooks/useMeetingAvatar"
import { safeSetLiveKitMetadata } from "@/features/video-call/utils/livekitMetadataUtils"

/**
 * MeetingAvatarPicker — upload a meeting-room avatar image (file upload + crop)
 * or reset back to the regular profile avatar. Shared by the waiting-room
 * "Backgrounds and effects" modal and the in-call avatar panel.
 */
const MeetingAvatarPicker = ({ className = "p-4" }) => {
  const { t } = useLanguage()
  const { localParticipant } = useGlobalVideoCall()

  const { profile, meetingAvatarUrl, profileAvatarUrl, displayAvatar } =
    useMeetingAvatar()

  const [fileToCrop, setFileToCrop] = useState(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const fileInputRef = useRef(null)

  const [uploadMeetingAvatar, { isLoading: isUploading }] =
    useUploadMeetingAvatarMutation()
  const [updateMeetingAvatar, { isLoading: isClearing }] =
    useUpdateMeetingAvatarMutation()
  const isBusy = isUploading || isClearing

  const syncToLiveKit = async (url) => {
    if (localParticipant && url) {
      try {
        await safeSetLiveKitMetadata(localParticipant, { avatarImageUrl: url })
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error(
        t?.rooms?.avatarPicker?.invalidFile ||
          "Please choose a valid image file",
      )
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    setFileToCrop(file)
    setIsCropModalOpen(true)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleCropComplete = async (croppedFile) => {
    const formData = new FormData()
    formData.append("file", croppedFile)

    try {
      toast.loading(t?.rooms?.avatarPicker?.saving || "Saving...", {
        id: "meeting-avatar-upload",
      })
      const res = await uploadMeetingAvatar(formData).unwrap()
      const newUrl = res?.data?.avatarUrl || res?.avatarUrl || res?.data
      if (newUrl && typeof newUrl === "string") {
        await syncToLiveKit(newUrl)
      }
      toast.success(
        t?.rooms?.avatarPicker?.success || "Avatar updated successfully",
        { id: "meeting-avatar-upload" },
      )
    } catch (err) {
      console.error(err)
      toast.error(
        t?.rooms?.avatarPicker?.error || "Failed to update avatar",
        { id: "meeting-avatar-upload" },
      )
    }
  }

  const handleReset = async () => {
    try {
      toast.loading(t?.rooms?.avatarPicker?.saving || "Saving...", {
        id: "meeting-avatar-reset",
      })
      await updateMeetingAvatar({ meetingAvatarUrl: "" }).unwrap()
      await syncToLiveKit(profileAvatarUrl || "")
      toast.success(
        t?.rooms?.avatarPicker?.resetSuccess ||
          "Using your profile avatar now",
        { id: "meeting-avatar-reset" },
      )
    } catch (err) {
      console.error(err)
      toast.error(
        t?.rooms?.avatarPicker?.error || "Failed to update avatar",
        { id: "meeting-avatar-reset" },
      )
    }
  }

  return (
    <div className={`flex flex-col h-full w-full ${className}`}>
      <div className="flex justify-center">
        <Avatar
          size={120}
          src={displayAvatar}
          alt={profile?.username || "User"}
          name={profile?.fullName || profile?.username || "User"}
          className="shadow-md"
        />
      </div>

      <div className="flex flex-col gap-3 mt-6">
        <p className="text-xs text-[#606060] text-center">
          {t?.rooms?.avatarPicker?.description ||
            "Upload an image to change your meeting-room avatar. If empty, your profile avatar is used."}
        </p>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />

        <PillButton
          onClick={() => fileInputRef.current?.click()}
          loading={isUploading}
          startIcon={<Upload size={16} />}
          className="w-full"
        >
          {t?.rooms?.avatarPicker?.uploadImage || "Upload new image"}
        </PillButton>

        {meetingAvatarUrl && (
          <PillButton
            onClick={handleReset}
            variant="outline"
            loading={isClearing}
            disabled={isBusy}
            startIcon={<RotateCcw size={16} />}
            className="w-full"
          >
            {t?.rooms?.avatarPicker?.resetToProfile ||
              "Use my profile avatar"}
          </PillButton>
        )}
      </div>

      {isCropModalOpen && fileToCrop && (
        <ImageCropModal
          image={fileToCrop}
          isOpen={isCropModalOpen}
          cropPreset="avatar"
          title={
            t?.rooms?.avatarPicker?.cropTitle || "Crop meeting-room avatar"
          }
          onClose={() => {
            setIsCropModalOpen(false)
            setFileToCrop(null)
          }}
          onCropComplete={(croppedFile) => {
            handleCropComplete(croppedFile)
            setIsCropModalOpen(false)
            setFileToCrop(null)
          }}
        />
      )}
    </div>
  )
}

export default MeetingAvatarPicker