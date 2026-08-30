import React, { memo, useState } from "react"
import {
  MoreHorizontal,
  UserPlus,
  UserMinus,
  UserCheck,
  MessageSquare,
} from "lucide-react"
import Popover from "@/shared/components/ui/Popover"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import Avatar from "@/shared/components/ui/Avatar"
import ListItem from "@/shared/components/ui/ListItem"
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

    // Mobile popover menu content (all actions inside the more menu)
    const renderMobileMenu = (close) => (
      <MenuList className="w-52 shadow-lg">
        {/* Find tab action */}
        {activeSubTab === "find" && !isSelf && (
          <MenuItem
            icon={<UserPlus />}
            label={t.profile?.friends?.actions?.addFriend || "Thêm bạn bè"}
            onClick={() => {
              handleSendRequest(user.accountId)
              close()
            }}
          />
        )}

        {/* Pending tab actions */}
        {activeSubTab === "pending" && user.isPendingRequest && (
          <>
            <MenuItem
              icon={<UserPlus className="text-emerald-600" />}
              label={t.profile?.friends?.actions?.accept || "Chấp nhận"}
              className="text-emerald-600 font-medium"
              onClick={() => {
                handleAcceptRequest(user.friendshipId)
                close()
              }}
            />
            <MenuItem
              icon={<UserMinus className="text-red-600" />}
              label={t.profile?.friends?.actions?.decline || "Từ chối"}
              className="text-red-600"
              onClick={() => {
                handleDeclineRequest(user.friendshipId)
                close()
              }}
            />
          </>
        )}

        {/* Following tab action */}
        {activeSubTab === "following" && isOwnProfile && (
          <MenuItem
            icon={<UserMinus className="text-red-600" />}
            label={t.profile?.friends?.actions?.unfollow || "Bỏ theo dõi"}
            className="text-red-600"
            onClick={() => {
              handleUnfollow(user.accountId)
              close()
            }}
          />
        )}

        {/* Followers tab action */}
        {activeSubTab === "followers" && !isSelf && (
          <MenuItem
            icon={<UserPlus />}
            label={t.profile?.friends?.actions?.followBack || "Theo dõi lại"}
            onClick={() => {
              handleFollow(user.accountId)
              close()
            }}
          />
        )}

        {/* Nhắn tin: Available for any non-self profile */}
        {!isSelf && (
          <MenuItem
            icon={<MessageSquare />}
            label={t.profile?.friends?.actions?.message || "Nhắn tin"}
            onClick={() => handleStartChat(user.accountId, close)}
          />
        )}

        {/* Hủy kết bạn: only in 'all' subtab for own profile */}
        {activeSubTab === "all" && isOwnProfile && (
          <MenuItem
            icon={<UserMinus className="text-red-600" />}
            label={t.profile?.friends?.actions?.unfriend || "Hủy kết bạn"}
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
    )

    // Desktop popover menu content (secondary actions only)
    const renderDesktopMenu = (close) => (
      <MenuList className="w-52 shadow-lg">
        {/* Nhắn tin: shown in popover whenever it is not the primary card button */}
        {activeSubTab !== "all" && !isSelf && (
          <MenuItem
            icon={<MessageSquare />}
            label={t.profile?.friends?.actions?.message || "Nhắn tin"}
            onClick={() => handleStartChat(user.accountId, close)}
          />
        )}

        {/* Hủy kết bạn: only in 'all' subtab for own profile */}
        {activeSubTab === "all" && isOwnProfile && (
          <MenuItem
            icon={<UserMinus className="text-red-600" />}
            label={t.profile?.friends?.actions?.unfriend || "Hủy kết bạn"}
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
    )

    const hasDesktopMenu =
      (activeSubTab !== "all" && !isSelf) ||
      (activeSubTab === "all" && isOwnProfile)

    return (
      <div
        onClick={() => onNavigate?.(user.accountId)}
        className="group/card flex flex-col overflow-hidden rounded-xl bg-white border border-border cursor-pointer select-none"
      >
        {/* Mobile View: ListItem */}
        <ListItem
          lines={2}
          className="sm:hidden"
          leftContent={
            <Avatar
              src={avatarUrl}
              name={displayName}
              size={48}
              clickable={false}
              style={{ backgroundColor: solidColor }}
            />
          }
          rightContent={
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <Popover
                placement="bottom-right"
                trigger={
                  <IconButton
                    title={t.profile?.friends?.options || "Tùy chọn"}
                    size="sm"
                    variant="ghost"
                  >
                    <MoreHorizontal />
                  </IconButton>
                }
                content={renderMobileMenu}
              />
            </div>
          }
        >
          <span className="font-semibold truncate">{displayName}</span>
          <span className="text-sm text-secondary truncate">{userRole}</span>
        </ListItem>

        {/* Desktop Card Cover: Full 1:1 square photo with AnimatedNameFallback */}
        <div className="hidden sm:block relative aspect-square w-full overflow-hidden shrink-0">
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt={displayName}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
              loading="lazy"
            />
          ) : (
            <AnimatedNameFallback name={displayName} color={solidColor} />
          )}
        </div>

        {/* Desktop View: Card Body (Info at top, PillButton at bottom) */}
        <div className="hidden sm:flex flex-col justify-between p-4 gap-4 flex-1">
          {/* Header info with 3-dot Popover */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base text-gray-900 truncate">
                {displayName}
              </h3>
              <p className="text-sm text-secondary truncate">{userRole}</p>
            </div>

            {/* Context Menu inline with Name */}
            {hasDesktopMenu && (
              <div
                className="shrink-0 -mt-1 -mr-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Popover
                  placement="bottom-right"
                  trigger={
                    <IconButton
                      title={t.profile?.friends?.options || "Tùy chọn"}
                      size="sm"
                      variant="ghost"
                    >
                      <MoreHorizontal />
                    </IconButton>
                  }
                  content={renderDesktopMenu}
                />
              </div>
            )}
          </div>

          {/* Primary Action Button via PillButton (Desktop only) */}
          <div className="w-full mt-auto" onClick={(e) => e.stopPropagation()}>
            {/* Find Friends / Recommendations */}
            {activeSubTab === "find" && !isSelf && (
              <PillButton
                variant="primary"
                className="w-full"
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
