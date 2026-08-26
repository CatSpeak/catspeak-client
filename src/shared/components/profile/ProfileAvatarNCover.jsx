import React, { useRef, useState } from "react"
import toast from "react-hot-toast"
import { Camera, Users, Check } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import Modal from "@/shared/components/ui/Modal"
import ImageCropModal from "@/shared/components/ui/ImageCropModal"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import {
  useUpdateAvatarMutation,
  useUpdateMeetingAvatarMutation,
} from "@/store/api/userApi"
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
  const displayMeetingAvatarUrl =
    profileData?.meetingAvatarUrl || displayAvatarUrl
  const displayName = profileData?.username || ""

  const [isMeetingAvatarModalOpen, setIsMeetingAvatarModalOpen] =
    useState(false)
  const [meetingAvatarUrlInput, setMeetingAvatarUrlInput] = useState("")

  const [fileToCrop, setFileToCrop] = useState(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)

  const [updateAvatar, { isLoading: isUpdatingAvatar }] =
    useUpdateAvatarMutation()
  const [updateMeetingAvatar, { isLoading: isUpdatingMeetingAvatar }] =
    useUpdateMeetingAvatarMutation()

  // Optional: khi user đang trong call, đồng bộ avatar mới xuống LiveKit metadata ngay lập tức
  let localParticipant = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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

  const handleOpenMeetingAvatarModal = () => {
    if (!isOwnProfile) return
    setMeetingAvatarUrlInput(displayMeetingAvatarUrl || "")
    setIsMeetingAvatarModalOpen(true)
  }

  const handleSaveMeetingAvatarUrl = async () => {
    if (!isOwnProfile) return
    const trimmed = (meetingAvatarUrlInput || "").trim()

    if (trimmed.startsWith("data:")) {
      toast.error(
        "Vui lòng nhập đường dẫn URL (http/https), không sử dụng chuỗi base64.",
      )
      return
    }

    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      toast.error("Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://")
      return
    }

    try {
      toast.loading(
        t.profile?.personalInfo?.updatingMeetingAvatar ||
          "Đang cập nhật ảnh đại diện phòng họp...",
        { id: "meeting-avatar-update" },
      )

      await updateMeetingAvatar({ meetingAvatarUrl: trimmed }).unwrap()

      if (localParticipant) {
        await safeSetLiveKitMetadata(localParticipant, {
          avatarImageUrl: trimmed,
        })
      }

      toast.success(
        t.profile?.personalInfo?.updateMeetingAvatarSuccess ||
          "Cập nhật ảnh đại diện phòng họp thành công",
        { id: "meeting-avatar-update" },
      )
      setIsMeetingAvatarModalOpen(false)
    } catch (err) {
      console.error(err)
      toast.error(
        t.profile?.personalInfo?.updateMeetingAvatarError ||
          "Không thể cập nhật ảnh đại diện phòng họp",
        { id: "meeting-avatar-update" },
      )
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

      {/* Meeting Avatar Badge on Top-Right of Cover Photo (Only when isOwnProfile) */}
      {isOwnProfile && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            if (!isUpdatingMeetingAvatar) {
              handleOpenMeetingAvatarModal()
            }
          }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 bg-black/65 backdrop-blur-md border border-white/30 rounded-2xl px-3 py-2 flex items-center gap-3 shadow-lg hover:bg-black/80 transition-all cursor-pointer group/meeting"
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 border-2 border-white/80 bg-cath-red-700 shadow-sm">
            <Avatar
              size={44}
              src={displayMeetingAvatarUrl}
              alt={displayName}
              name={displayName}
              className="w-full h-full text-white text-base"
              style={{ border: "none" }}
            />
            <div
              className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                isUpdatingMeetingAvatar
                  ? "opacity-100"
                  : "opacity-0 group-hover/meeting:opacity-100"
              }`}
            >
              {isUpdatingMeetingAvatar ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </div>
          </div>

          <div className="flex flex-col text-left pr-1">
            <div className="flex items-center gap-1.5 text-white font-bold text-xs whitespace-nowrap">
              <Users size={13} className="text-amber-400 shrink-0" />
              <span>
                {t.profile?.personalInfo?.meetingAvatarLabel || "Ảnh phòng họp"}
              </span>
            </div>
            <span className="text-[10px] text-gray-200 mt-0.5 group-hover/meeting:text-white transition-colors font-medium whitespace-nowrap">
              {isUpdatingMeetingAvatar
                ? t.profile?.personalInfo?.updatingAvatar || "Đang cập nhật..."
                : t.profile?.personalInfo?.clickToChangeMeetingAvatar ||
                  "Bấm để đổi ảnh phòng họp"}
            </span>
          </div>
        </div>
      )}
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

      {/* Meeting Avatar URL Modal (Only when isOwnProfile) */}
      {isOwnProfile && (
        <Modal
          open={isMeetingAvatarModalOpen}
          onClose={() => setIsMeetingAvatarModalOpen(false)}
          title={t.profile?.personalInfo?.meetingAvatarLabel || "Ảnh phòng họp"}
          className="max-w-md w-full"
          bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
          footer={
            <PillButton
              onClick={handleSaveMeetingAvatarUrl}
              loading={isUpdatingMeetingAvatar}
              className="w-full"
            >
              {t.profile?.personalInfo?.save || t.save || "Lưu ảnh"}
            </PillButton>
          }
        >
          <div className="flex flex-col items-center gap-6">
            <Avatar
              size={100}
              src={meetingAvatarUrlInput || displayMeetingAvatarUrl}
              alt={displayName}
              name={displayName}
              className="shadow-md border-2 border-white"
            />

            <TextInput
              label={t?.rooms?.avatarPicker?.imageUrl || "Đường dẫn ảnh (URL)"}
              helperText={
                t?.rooms?.avatarPicker?.description ||
                "Dán đường dẫn ảnh hợp lệ (http:// hoặc https://). Nếu để trống, hệ thống sẽ mặc định dùng ảnh đại diện chính."
              }
              value={meetingAvatarUrlInput}
              onChange={(e) => setMeetingAvatarUrlInput(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              containerClassName="w-full"
            />
          </div>
        </Modal>
      )}
    </>
  )

  // Standalone mode (no children, no actions - used in AccountHeader)
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
