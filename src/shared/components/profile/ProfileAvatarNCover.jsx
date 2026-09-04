import React, { useRef, useState } from "react"
import toast from "react-hot-toast"
import { Camera } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import ImageCropModal from "@/shared/components/ui/ImageCropModal"
import { useUpdateAvatarMutation } from "@/store/api/userApi"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { safeSetLiveKitMetadata } from "@/features/video-call/utils/livekitMetadataUtils"
import backgroundAccount from "@/shared/assets/backgrounds/background-account.png"

const ProfileAvatarNCover = ({
  profile = {},
  user = {},
  formData = {},
  t = {},
  isOwnProfile = true,
  className = "",
  coverClassName = "",
  avatarClassName = "",
  actions = null,
  children = null,
}) => {
  const profileData = profile ?? formData ?? user ?? {}
  const displayAvatarUrl = profileData?.avatarImageUrl
  const displayName = profileData?.username || ""

  const [fileToCrop, setFileToCrop] = useState(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)

  const [updateAvatar, { isLoading: isUpdatingAvatar }] =
    useUpdateAvatarMutation()

  // Optional: khi user đang trong call, đồng bộ avatar mới xuống LiveKit metadata ngay lập tức
  let localParticipant = null
  try {
    const callCtx = useGlobalVideoCall()
    localParticipant = callCtx?.localParticipant ?? null
  } catch {
    localParticipant = null
  }

  const fileInputRef = useRef(null)

  const handleAvatarSelect = (e) => {
    if (!isOwnProfile) return
    const file = e.target.files?.[0]
    if (!file) return

    // File validation: check image type
    if (!file.type.startsWith("image/")) {
      toast.error(
        t.profile?.personalInfo?.invalidImageFormat ||
          "Vui lòng chọn tệp hình ảnh hợp lệ",
      )
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    setFileToCrop(file)
    setIsCropModalOpen(true)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleCropComplete = async (croppedFile) => {
    if (!isOwnProfile || !croppedFile) return

    const avatarData = new FormData()
    avatarData.append("file", croppedFile)

    try {
      toast.loading(
        t.profile?.personalInfo?.updatingAvatar || "Đang cập nhật...",
        { id: "avatar-update" },
      )
      const res = await updateAvatar(avatarData).unwrap()

      const newAvatarUrl =
        res?.data?.avatarImageUrl || res?.avatarImageUrl || res?.data
      if (
        localParticipant &&
        newAvatarUrl &&
        typeof newAvatarUrl === "string"
      ) {
        await safeSetLiveKitMetadata(localParticipant, {
          avatarImageUrl: newAvatarUrl,
        })
      }

      toast.success(
        t.profile?.personalInfo?.updateAvatarSuccess ||
          "Cập nhật ảnh đại diện thành công",
        { id: "avatar-update" },
      )
    } catch (error) {
      toast.error(
        t.profile?.personalInfo?.updateAvatarError ||
          "Không thể cập nhật ảnh đại diện",
        { id: "avatar-update" },
      )
      console.error(error)
    }
  }

  const hasBottomContent = Boolean(children || actions)

  const renderCover = (hasFullBorder = false) => (
    <div
      className={`w-full h-48 md:h-[280px] bg-gray-200 relative group/cover overflow-hidden ${
        hasFullBorder ? "rounded-xl border border-[#e5e5e5]" : ""
      } ${coverClassName}`}
    >
      {/* Cover Photo Image */}
      <div className="relative w-full h-full">
        <img
          src={backgroundAccount}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )

  const renderAvatar = (isFloating = false) => (
    <div
      className={`${
        isFloating
          ? "absolute -bottom-14 md:-bottom-16 left-6 sm:left-8 z-20 group"
          : "-mt-24 md:-mt-28 mb-5 relative z-10"
      } p-1 bg-white rounded-full w-fit shadow-sm`}
    >
      <div
        className={`relative rounded-full overflow-hidden ${
          isOwnProfile ? "cursor-pointer group/avatar" : ""
        } ${avatarClassName}`}
        onClick={() => {
          if (isOwnProfile && fileInputRef.current && !isUpdatingAvatar) {
            fileInputRef.current.click()
          }
        }}
      >
        <Avatar
          size={133}
          src={displayAvatarUrl}
          alt={displayName}
          name={displayName}
          className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] bg-purple-100 text-purple-600 text-4xl"
        />
        {isOwnProfile && (
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
              isUpdatingAvatar
                ? "opacity-100"
                : "opacity-0 group-hover/avatar:opacity-100"
            }`}
          >
            {isUpdatingAvatar ? (
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Camera className="w-8 h-8 text-white" />
            )}
          </div>
        )}
      </div>
      {isOwnProfile && (
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleAvatarSelect}
        />
      )}
    </div>
  )

  const renderModals = () => (
    <>
      {/* Image Crop Modal for Profile Avatar (Only when isOwnProfile) */}
      {isOwnProfile && isCropModalOpen && fileToCrop && (
        <ImageCropModal
          image={fileToCrop}
          isOpen={isCropModalOpen}
          cropPreset="avatar"
          title={
            t.profile?.personalInfo?.cropAvatarTitle ||
            t.imageCrop?.title ||
            "Cắt ảnh đại diện"
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
    </>
  )

  // Standalone mode (no children, no actions)
  if (!hasBottomContent) {
    return (
      <div className={`w-full relative mb-16 md:mb-20 ${className}`}>
        {renderCover(true)}
        {renderAvatar(true)}
        {renderModals()}
      </div>
    )
  }

  // Card mode (has children / actions - used in SocialProfileHeader)
  return (
    <div
      className={`w-full bg-white border border-[#e5e5e5] rounded-xl overflow-hidden mb-6 ${className}`}
    >
      {renderCover(false)}

      {/* Main Profile Info / Avatar Area */}
      <div className="p-4 sm:p-6 relative border-b border-gray-100 flex flex-wrap sm:flex-nowrap items-start sm:items-end justify-between gap-4">
        <div className="flex-1 min-w-0">
          {renderAvatar(false)}
          {children}
        </div>

        {/* Right side Actions (Edit, Follow, Request buttons) */}
        {actions && (
          <div className="ml-auto flex items-center justify-end gap-2 max-[425px]:w-full max-[425px]:justify-start shrink-0 flex-nowrap">
            {actions}
          </div>
        )}
      </div>

      {renderModals()}
    </div>
  )
}

export default ProfileAvatarNCover