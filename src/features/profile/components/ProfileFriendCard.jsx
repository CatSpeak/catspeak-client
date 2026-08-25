import React, { memo, useState } from "react"
import {
  MoreHorizontal,
  UserPlus,
  UserMinus,
  MessageSquare,
} from "lucide-react"
import Popover from "@/shared/components/ui/Popover"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getUserColor } from "@/features/video-call/utils/participantTheme"
import { useFriendActions } from "../hooks/useFriendActions"
import AnimatedNameFallback from "./AnimatedNameFallback"

const isUserTeacher = (user) =>
  user?.isTeacher === true ||
  user?.isTeacher === 1 ||
  user?.isTeacher === "true" ||
  (typeof user?.level === "string" &&
    user.level.trim().toLowerCase() === "expert")

const ProfileFriendCard = memo(
  ({ user, activeSubTab, isOwnProfile, currentUserId, onNavigate }) => {
    const { t } = useLanguage()
    const [imgError, setImgError] = useState(false)
    const {
      handleStartChat,
      handleSendRequest,
      handleFollow,
      handleUnfollow,
      handleUnfriend,
      handleAcceptRequest,
      handleDeclineRequest,
    } = useFriendActions()

    const isTeacher = isUserTeacher(user)
    const roleLabel = isTeacher
      ? t.profile?.friends?.teacher || "Giảng viên"
      : t.profile?.friends?.member || "Thành viên"

    const displayName =
      user?.username ||
      user?.nickname ||
      user?.name ||
      user?.displayName ||
      "User"
    const userRole = user?.roleName || roleLabel
    const avatarUrl = user?.avatarImageUrl || user?.avatarUrl
    const isSelf =
      currentUserId != null &&
      user?.accountId != null &&
      Number(currentUserId) === Number(user?.accountId)

    const solidColor = getUserColor(user?.accountId, displayName)

    return (
      <div
        onClick={() => onNavigate?.(user.accountId)}
        className="group/card flex flex-col overflow-hidden rounded-xl bg-white border border-border transition-all duration-200 cursor-pointer select-none"
      >
        {/* Cover Photo / Letter Hover Wave Animation */}
        <div className="relative aspect-square w-full overflow-hidden shrink-0">
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt={displayName}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <AnimatedNameFallback
              name={displayName}
              color={solidColor}
            />
          )}
        </div>

        {/* Card Body: Info & Actions */}
        <div className="flex flex-col justify-between p-4 gap-4 flex-1">
          {/* Header info with 3-dot Popover */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate">{displayName}</h3>
              <p className="text-sm text-secondary truncate">{userRole}</p>
            </div>

            {/* Context Menu inline with Name */}
            <div
              className="shrink-0 -mt-1 -mr-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Popover
                placement="bottom-right"
                trigger={
                  <IconButton title="Tùy chọn" size="sm" variant="ghost">
                    <MoreHorizontal />
                  </IconButton>
                }
                content={(close) => (
                  <MenuList className="w-52 shadow-lg">
                    {/* Nhắn tin: shown in popover whenever it is not the primary card button */}
                    {activeSubTab !== "all" && !isSelf && (
                      <MenuItem
                        icon={<MessageSquare />}
                        label={
                          t.profile?.friends?.actions?.message || "Nhắn tin"
                        }
                        onClick={() => handleStartChat(user.accountId, close)}
                      />
                    )}

                    {/* Hủy kết bạn: only in 'all' subtab for own profile */}
                    {activeSubTab === "all" && isOwnProfile && (
                      <MenuItem
                        icon={<UserMinus className="text-red-600" />}
                        label={
                          t.profile?.friends?.actions?.unfriend || "Hủy kết bạn"
                        }
                        className="text-red-600"
                        onClick={() =>
                          handleUnfriend(
                            {
                              friendshipId: user.friendshipId,
                              accountId: user.accountId || user.id,
                            },
                            close,
                          )
                        }
                      />
                    )}
                  </MenuList>
                )}
              />
            </div>
          </div>

          {/* Primary Action Button via PillButton */}
          <div className="w-full" onClick={(e) => e.stopPropagation()}>
            {/* Find Friends / Recommendations */}
            {activeSubTab === "find" && !isSelf && (
              <PillButton
                variant="primary"
                className="w-full"
                startIcon={<UserPlus size={16} />}
                onClick={() => handleSendRequest(user.accountId)}
              >
                {t.profile?.friends?.actions?.addFriend || "Thêm bạn bè"}
              </PillButton>
            )}

            {/* Pending Requests */}
            {activeSubTab === "pending" && user.isPendingRequest && (
              <div className="flex items-center gap-2 w-full">
                <PillButton
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleAcceptRequest(user.friendshipId)}
                >
                  {t.profile?.friends?.actions?.accept || "Chấp nhận"}
                </PillButton>
                <PillButton
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleDeclineRequest(user.friendshipId)}
                >
                  {t.profile?.friends?.actions?.decline || "Từ chối"}
                </PillButton>
              </div>
            )}

            {/* All Friends */}
            {activeSubTab === "all" && !isSelf && (
              <PillButton
                variant="secondary"
                className="w-full"
                startIcon={<MessageSquare size={16} />}
                onClick={() => handleStartChat(user.accountId)}
              >
                {t.profile?.friends?.actions?.message || "Nhắn tin"}
              </PillButton>
            )}

            {/* Following */}
            {activeSubTab === "following" && isOwnProfile && (
              <PillButton
                variant="secondary"
                className="w-full"
                startIcon={<UserMinus size={16} />}
                onClick={() => handleUnfollow(user.accountId)}
              >
                {t.profile?.friends?.actions?.unfollow || "Bỏ theo dõi"}
              </PillButton>
            )}

            {/* Followers */}
            {activeSubTab === "followers" && !isSelf && (
              <PillButton
                variant="primary"
                className="w-full"
                startIcon={<UserPlus size={16} />}
                onClick={() => handleFollow(user.accountId)}
              >
                {t.profile?.friends?.actions?.followBack || "Theo dõi lại"}
              </PillButton>
            )}
          </div>
        </div>
      </div>
    )
  },
)

ProfileFriendCard.displayName = "ProfileFriendCard"

export default ProfileFriendCard
