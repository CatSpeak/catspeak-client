import React, { useState } from "react"
import toast from "react-hot-toast"
import { Edit2, UserPlus, Check } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import RequestButton from "@/shared/components/ui/buttons/RequestButton"
import TeacherBadge from "@/shared/components/ui/TeacherBadge"
import {
  useGetConnectionStatusQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../../../store/api/social/friendshipApi"
import ProfileAvatarNCover from "@/shared/components/profile/ProfileAvatarNCover"

const BIO_TRUNCATE_LENGTH = 120
const APPROVED_STATUS = "approved"

const getIsTeacher = (profile) => (profile?.isTeacher ?? profile?.IsTeacher) === true
const getInstructorStatus = (profile) => profile?.instructorStatus ?? profile?.InstructorStatus ?? null
const getIntroduction = (profile) => profile?.introduction ?? profile?.Introduction ?? ""

const SocialProfileHeader = ({
  profile = {},
  t = {},
  targetAccountId,
  isOwnProfile,
  onEditClick,
  friendsCount = 0,
  followersCount = 0,
}) => {
  const displayName = profile?.username || ""

  const isTeacher = getIsTeacher(profile)
  const instructorStatus = getInstructorStatus(profile)
  // Only Approved instructors show badge/intro (Q4). IsTeacher from backend already gated, but verify status explicitly.
  const isApprovedTeacher = isTeacher && String(instructorStatus ?? "").toLowerCase() === APPROVED_STATUS

  const teacherIntroduction = getIntroduction(profile)

  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const shouldTruncateBio = teacherIntroduction.length > BIO_TRUNCATE_LENGTH

  // API Hooks
  const { data: statusResponse } = useGetConnectionStatusQuery(
    targetAccountId,
    {
      skip: isOwnProfile || !targetAccountId,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  )
  const status =
    statusResponse?.data !== undefined ? statusResponse.data : statusResponse

  const [followUser, { isLoading: isFollowingLoading }] =
    useFollowUserMutation()
  const [unfollowUser, { isLoading: isUnfollowingLoading }] =
    useUnfollowUserMutation()

  const isFollowLoading = isFollowingLoading || isUnfollowingLoading

  const handleFollowToggle = async () => {
    if (isFollowLoading) return
    const toastId = "follow-action"

    try {
      if (status?.isFollowing) {
        await unfollowUser(targetAccountId).unwrap()
        toast.success(t.profile?.social?.unfollowSuccess || "Đã hủy theo dõi", {
          id: toastId,
        })
      } else {
        await followUser(targetAccountId).unwrap()
        toast.success(t.profile?.social?.followSuccess || "Đã theo dõi", {
          id: toastId,
        })
      }
    } catch (error) {
      toast.error(t.profile?.social?.errorOccurred || "Có lỗi xảy ra", {
        id: toastId,
      })
      console.error(error)
    }
  }

  const actions = (
    <>
      {isOwnProfile ? (
        onEditClick && (
          <PillButton
            variant="outline"
            startIcon={<Edit2 />}
            onClick={onEditClick}
            className="max-[425px]:flex-1"
          >
            {t.profile?.personalInfo?.edit || "Chỉnh sửa"}
          </PillButton>
        )
      ) : (
        <>
          <PillButton
            variant={status?.isFollowing ? "secondary" : "primary"}
            startIcon={status?.isFollowing ? <Check /> : <UserPlus />}
            onClick={handleFollowToggle}
            disabled={isFollowLoading}
            loading={isFollowLoading}
            className={`max-[425px]:flex-1 ${
              isFollowLoading ? "cursor-not-allowed" : ""
            }`}
          >
            {status?.isFollowing
              ? t.profile?.social?.following || "Đang theo dõi"
              : t.profile?.social?.follow || "Theo dõi"}
          </PillButton>

          <RequestButton
            id={targetAccountId}
            relationship={status}
            t={t}
            className="max-[425px]:flex-1"
          />
        </>
      )}
    </>
  )

  return (
    <ProfileAvatarNCover
      profile={profile}
      t={t}
      isOwnProfile={isOwnProfile}
      actions={actions}
    >
      {/* Text Info */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-3xl font-bold truncate whitespace-nowrap overflow-hidden">
            {displayName}
          </h1>
          {isApprovedTeacher && (
            <TeacherBadge className="w-5 h-5 border-amber-300 bg-amber-50 shadow-sm" />
          )}
        </div>
        {isApprovedTeacher && teacherIntroduction && (
          <div className="text-[15px] leading-[1.45] text-[#050505] dark:text-zinc-200 whitespace-pre-wrap break-words">
            <span className={shouldTruncateBio && !isBioExpanded ? "line-clamp-2" : ""}>
              {teacherIntroduction}
            </span>
            {shouldTruncateBio && (
              <button
                type="button"
                onClick={() => setIsBioExpanded((v) => !v)}
                className="ml-1 inline text-sm font-medium text-primary hover:underline"
              >
                {isBioExpanded
                  ? t.profile?.post?.showLess || "Thu gọn"
                  : t.profile?.post?.seeMore || "Xem thêm"}
              </button>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-secondary mt-1 lowercase">
          <span>
            {friendsCount} {t.profile?.tabs?.friends || "bạn bè"}
          </span>
          <span className="w-1 h-1 rounded-full bg-secondary" />
          <span>
            {followersCount}{" "}
            {t.profile?.friends?.subTabs?.followers || "người theo dõi"}
          </span>
        </div>
      </div>
    </ProfileAvatarNCover>
  )
}

export default SocialProfileHeader
