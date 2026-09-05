import React from "react"
import toast from "react-hot-toast"
import { Edit2, UserPlus, Check } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import RequestButton from "@/shared/components/ui/buttons/RequestButton"
import {
  useGetConnectionStatusQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../../../store/api/social/friendshipApi"
import ProfileAvatarNCover from "@/shared/components/profile/ProfileAvatarNCover"

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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold truncate whitespace-nowrap overflow-hidden">
          {displayName}
        </h1>
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
