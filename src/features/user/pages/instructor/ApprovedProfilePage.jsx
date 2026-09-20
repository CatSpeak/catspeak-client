import React, { useMemo, useRef, useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetInstructorProfileQuery,
  useGetLanguageRequestsQuery,
  useReplaceInstructorIntroVideoMutation,
  useRemoveInstructorIntroVideoMutation,
} from "@/store/api/instructorApi"
import { useGetInstructorBankAccountsQuery } from "@/features/bank-accounts/api/instructorBankAccountsApi"
import PageTitle from "@/shared/components/ui/PageTitle"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import MediaViewerModal from "@/shared/components/ui/MediaViewerModal"
import PersonalInfoCard from "@/features/user/components/instructor/approved/PersonalInfoCard"
import VerificationCard from "@/features/user/components/instructor/approved/VerificationCard"
import LanguagesCard from "@/features/user/components/instructor/approved/LanguagesCard"
import VideoCard from "@/features/user/components/instructor/approved/VideoCard"
import ChangeEmailDrawer from "@/features/user/components/instructor/approved/contact/ChangeEmailDrawer"
import ChangePhoneDrawer from "@/features/user/components/instructor/approved/contact/ChangePhoneDrawer"
import BankAccountDrawer from "@/features/user/components/instructor/approved/BankAccountDrawer"
import IdCardDrawer from "@/features/user/components/instructor/approved/IdCardDrawer"
import {
  fileNameFromUrl,
  pick,
} from "@/features/user/components/instructor/approved/utils"
import { toast } from "@/shared/utils/toastBridge"
import { parseApiError } from "@/shared/utils/apiError"

const VIDEO_MAX_BYTES = 50 * 1024 * 1024
const VIDEO_EXTENSIONS = ["mp4", "mov"]

const videoExtensionOf = (name) => {
  const parts = String(name || "").toLowerCase().split(".")
  return parts.length > 1 ? parts.pop() : ""
}

/**
 * MP4/MOV are ISO base media files: every top-level box starts with a 4-byte
 * size followed by a 4-byte box type. Check the first box type is one of the
 * known container signatures so a renamed non-video file is rejected.
 */
const videoMagicOk = async (file) => {
  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
    if (bytes.length < 8) return false
    const boxType = String.fromCharCode(...bytes.slice(4, 8))
    return ["ftyp", "moov", "mdat", "wide", "free", "skip"].includes(boxType)
  } catch {
    return false
  }
}

const ApprovedProfilePage = () => {
  const { t } = useLanguage()
  const ins = t.profile?.instructor || {}
  const [contactDrawer, setContactDrawer] = useState(null)
  const [contactSession, setContactSession] = useState(0)
  const [bankDrawerOpen, setBankDrawerOpen] = useState(false)
  const [bankSession, setBankSession] = useState(0)
  const [idCardDrawerOpen, setIdCardDrawerOpen] = useState(false)
  const [idCardSession, setIdCardSession] = useState(0)
  const [idCardUpdated, setIdCardUpdated] = useState(false)
  const [videoViewerOpen, setVideoViewerOpen] = useState(false)
  const [confirmRemoveVideo, setConfirmRemoveVideo] = useState(false)
  const [videoMeta, setVideoMeta] = useState(null)
  const videoInputRef = useRef(null)

  const [replaceIntroVideo] = useReplaceInstructorIntroVideoMutation()
  const [removeIntroVideo, { isLoading: isRemovingVideo }] =
    useRemoveInstructorIntroVideoMutation()

  const {
    data: instructorData,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useGetInstructorProfileQuery()

  const {
    data: languageRequestsData,
    isLoading: isLoadingRequests,
    isError: isRequestsError,
    refetch: refetchRequests,
  } = useGetLanguageRequestsQuery()

  const { data: bankAccountsData } = useGetInstructorBankAccountsQuery()

  const profile = useMemo(
    () => instructorData?.data || instructorData || null,
    [instructorData],
  )

  const requests = useMemo(() => {
    const raw = languageRequestsData?.data ?? languageRequestsData
    return Array.isArray(raw) ? raw : []
  }, [languageRequestsData])

  const bankAccount = useMemo(() => {
    const list = Array.isArray(bankAccountsData) ? bankAccountsData : []
    return list.find((account) => account.isDefault) || list[0] || null
  }, [bankAccountsData])

  const isIdCardVerified = pick(profile, "isIdCardVerified", "IsIdCardVerified")
  const showIdCardUpdatedNote = idCardUpdated || isIdCardVerified === false
  const videoUrl = pick(profile, "introVideoUrl", "IntroVideoUrl")

  const handleEditPersonalInfo = () => {}
  const openContactDrawer = (which) => {
    setContactSession((session) => session + 1)
    setContactDrawer(which)
  }
  const handleChangeEmail = () => openContactDrawer("email")
  const handleChangePhone = () => openContactDrawer("phone")
  const handleChangeBank = () => {
    setBankSession((session) => session + 1)
    setBankDrawerOpen(true)
  }
  const handleUpdateIdCard = () => {
    setIdCardSession((session) => session + 1)
    setIdCardDrawerOpen(true)
  }
  const handleAddLanguage = () => {}
  const handleUpdateLanguage = () => {}
  const handleViewRequest = () => {}
  const handlePlayVideo = () => setVideoViewerOpen(true)
  const handleReplaceVideo = () => videoInputRef.current?.click()
  const handleRemoveVideo = () => setConfirmRemoveVideo(true)

  const handleVideoFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!VIDEO_EXTENSIONS.includes(videoExtensionOf(file.name))) {
      toast.error(ins.approvedVideoTypeError || "Chỉ hỗ trợ tệp MP4 hoặc MOV.")
      return
    }
    if (file.size > VIDEO_MAX_BYTES) {
      toast.error(ins.approvedVideoSizeError || "Video phải nhỏ hơn 50MB.")
      return
    }
    if (!(await videoMagicOk(file))) {
      toast.error(ins.approvedVideoInvalidError || "Tệp video không hợp lệ.")
      return
    }

    const formData = new FormData()
    formData.append("Video", file)
    try {
      await replaceIntroVideo(formData).unwrap()
      setVideoMeta({ size: file.size, uploadedAt: new Date().toISOString() })
      toast.success(
        ins.approvedVideoReplaced || "Cập nhật video giới thiệu thành công",
      )
    } catch (err) {
      const { message } = parseApiError(err)
      toast.error(
        ins.approvedVideoError ||
          message ||
          "Không thể cập nhật video. Vui lòng thử lại.",
      )
    }
  }

  const handleConfirmRemoveVideo = async () => {
    try {
      await removeIntroVideo().unwrap()
      setVideoMeta(null)
      setConfirmRemoveVideo(false)
      toast.success(ins.approvedVideoRemoved || "Đã xóa video giới thiệu")
    } catch (err) {
      const { message } = parseApiError(err)
      toast.error(
        ins.approvedVideoError ||
          message ||
          "Không thể cập nhật video. Vui lòng thử lại.",
      )
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-cath-red-700 border-t-transparent" />
      </div>
    )
  }

  if (isProfileError && !profile) {
    return (
      <div className="flex flex-col gap-4">
        <PageTitle>{t.nav?.instructor || "Hồ sơ giáo viên"}</PageTitle>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h3 className="text-sm font-bold text-red-800">
            {ins.loadErrorTitle || "Không tải được hồ sơ giảng viên"}
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {ins.loadErrorDesc || "Vui lòng kiểm tra kết nối và thử lại."}
          </p>
          <button
            type="button"
            onClick={() => refetchProfile()}
            className="mt-3 rounded-lg bg-[#990011] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a000e]"
          >
            {ins.retry || "Thử lại"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageTitle>{t.nav?.instructor || "Hồ sơ giáo viên"}</PageTitle>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[480fr_757fr]">
        <PersonalInfoCard
          profile={profile}
          t={t}
          onEdit={handleEditPersonalInfo}
        />
        <VerificationCard
          profile={profile}
          bankAccount={bankAccount}
          t={t}
          onChangeEmail={handleChangeEmail}
          onChangePhone={handleChangePhone}
          onChangeBank={handleChangeBank}
          onUpdateIdCard={handleUpdateIdCard}
          showIdCardUpdated={showIdCardUpdatedNote}
        />
      </div>

      <LanguagesCard
        languagesTeach={profile?.languagesTeach ?? profile?.LanguagesTeach}
        requests={requests}
        t={t}
        isLoading={isLoadingRequests}
        isError={isRequestsError}
        onRetry={refetchRequests}
        onAddLanguage={handleAddLanguage}
        onUpdateLanguage={handleUpdateLanguage}
        onViewRequest={handleViewRequest}
      />

      <VideoCard
        profile={profile}
        t={t}
        videoMeta={videoMeta}
        onPlay={handlePlayVideo}
        onReplace={handleReplaceVideo}
        onRemove={handleRemoveVideo}
      />

      <ChangeEmailDrawer
        key={`email-${contactSession}`}
        open={contactDrawer === "email"}
        onClose={() => setContactDrawer(null)}
        currentEmail={pick(profile, "email", "Email")}
        t={t}
      />
      <ChangePhoneDrawer
        key={`phone-${contactSession}`}
        open={contactDrawer === "phone"}
        onClose={() => setContactDrawer(null)}
        currentPhone={pick(profile, "phoneNumber", "PhoneNumber")}
        t={t}
      />
      <BankAccountDrawer
        key={`bank-${bankSession}`}
        open={bankDrawerOpen}
        onClose={() => setBankDrawerOpen(false)}
        currentBank={bankAccount}
        currentPhone={pick(profile, "phoneNumber", "PhoneNumber")}
        t={t}
      />
      <IdCardDrawer
        key={`id-card-${idCardSession}`}
        open={idCardDrawerOpen}
        onClose={() => setIdCardDrawerOpen(false)}
        currentFrontUrl={pick(profile, "idCardFrontUrl", "IdCardFrontUrl")}
        currentBackUrl={pick(profile, "idCardBackUrl", "IdCardBackUrl")}
        onUpdated={() => setIdCardUpdated(true)}
        t={t}
      />

      <input
        ref={videoInputRef}
        type="file"
        accept=".mp4,.mov,video/mp4,video/quicktime"
        className="hidden"
        onChange={handleVideoFileChange}
      />

      <ConfirmationModal
        open={confirmRemoveVideo}
        onClose={() => setConfirmRemoveVideo(false)}
        onConfirm={handleConfirmRemoveVideo}
        title={ins.approvedDeleteVideoTitle || "Xóa video giới thiệu"}
        message={
          ins.approvedDeleteVideoMessage ||
          "Bạn có chắc chắn muốn xóa video giới thiệu bản thân không? Hành động này không thể hoàn tác."
        }
        cancelText={ins.approvedCancelEdit || "Hủy"}
        confirmText={ins.approvedDeleteVideoConfirm || "Xóa"}
        isPending={isRemovingVideo}
      />

      {videoViewerOpen && videoUrl && (
        <MediaViewerModal
          media={{
            mediaUrl: videoUrl,
            mediaType: "Video",
            fileName: fileNameFromUrl(videoUrl),
          }}
          onClose={() => setVideoViewerOpen(false)}
        />
      )}
    </div>
  )
}

export default ApprovedProfilePage
