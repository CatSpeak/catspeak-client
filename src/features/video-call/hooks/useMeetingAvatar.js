import { useAuth } from "@/features/auth"
import { useGetUserProfileQuery } from "@/store/api/userApi"

/**
 * Resolves the display avatar for the current user's meeting room:
 * the meeting-room avatar takes precedence, falling back to the profile avatar.
 * Optionally folds in the auth `user` object so callers get the freshest data.
 */
export const useMeetingAvatar = (extraUser) => {
  const { isAuthenticated } = useAuth()
  const { data: profileData } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated,
  })
  const profile = profileData?.data ?? profileData ?? {}
  const meetingAvatarUrl =
    profile?.meetingAvatarUrl || extraUser?.meetingAvatarUrl || ""
  const profileAvatarUrl =
    profile?.avatarImageUrl || extraUser?.avatarImageUrl || ""

  return {
    profile,
    meetingAvatarUrl,
    profileAvatarUrl,
    displayAvatar: meetingAvatarUrl || profileAvatarUrl,
  }
}