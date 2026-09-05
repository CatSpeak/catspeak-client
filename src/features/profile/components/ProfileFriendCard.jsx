import React, { memo, useState } from "react"
import {
  MoreHorizontal,
  UserPlus,
  UserMinus,
  UserCheck,
  MessageSquare,
} from "lucide-react"
import toast from "react-hot-toast"
import Popover from "@/shared/components/ui/Popover"
import Modal from "@/shared/components/ui/Modal"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import Avatar from "@/shared/components/ui/Avatar"
import ListItem from "@/shared/components/ui/ListItem"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getUserColor } from "@/features/video-call/utils/participantTheme"
import { useFriendActions } from "../hooks/useFriendActions"
import { useSendFriendRequestMutation } from "@/store/api/social/friendshipApi"
import AnimatedNameFallback from "./AnimatedNameFallback"

const isUserTeacher = (user) => {
  const v =
    user?.isTeacher ?? user?.IsTeacher ?? user?.isTeacherAccount ?? user?.IsTeacherAccount
  if (v === true || v === 1 || v === "true") return true
  const role = String(user?.roleName ?? user?.RoleName ?? "").toLowerCase()
  if (role === "teacher" || role === "instructor" || role === "expert") return true
  return false
}

const ProfileFriendCard = memo(
  ({
    user,
    activeSubTab,
    isOwnProfile,
    currentUserId,
    isFollowing = false,
    isRequestSent = false,
    friendshipId: friendshipIdProp,
    isOutgoingRequest = false,
    onRequestSent,
    onRequestFailed,
    onNavigate,
  }) => {
    const { t } = useLanguage()
    const [imgError, setImgError] = useState(false)
    const [requestSent, setRequestSent] = useState(false)
    const [confirmCancel, setConfirmCancel] = useState(false)
    const [sendFriendRequest, { isLoading: isSendingRequest }] =
      useSendFriendRequestMutation()
    const {
      handleStartChat,
      handleFollow,
      handleUnfollow,
      handleUnfriend,
      handleAcceptRequest,
      handleDeclineRequest,
      handleCancelRequest,
    } = useFriendActions()

    const handleAddFriend = async (close) => {
      const accountId = user.accountId ?? user.id ?? user.userId
      if (isSendingRequest || requestSent || isRequestSent) {
        if (close) close()
        return
      }
      if (!accountId) {
        if (close) close()
        toast.error(t.profile?.friends?.actions?.error || "Có lỗi xảy ra")
        return
      }
      if (close) close()
      // Optimistic: cập nhật nút ngay lập tức, giữ qua refetch nhờ parent Set.
      setRequestSent(true)
      onRequestSent?.(accountId)
      try {
        await sendFriendRequest(accountId).unwrap()
        toast.success(
          t.profile?.social?.requestSent || "Đã gửi yêu cầu kết bạn",
        )
      } catch {
        // Rollback khi gửi thất bại (vd. đã tồn tại request) để nút không kẹt.
        setRequestSent(false)
        onRequestFailed?.(accountId)
        toast.error(t.profile?.friends?.actions?.error || "Có lỗi xảy ra")
      }
    }

    // Đã gửi = local optimistic hoặc parent Set (server-persistent outgoing + optimistic).
    // Reload persistence do backend đảm nhiệm (GET /requests/sent).
    const sent = requestSent || isRequestSent || isOutgoingRequest || Boolean(user?.isOutgoingRequest)
    const resolvedFriendshipId =
      friendshipIdProp ?? user?.friendshipId ?? user?.FriendshipId ?? null

    const handleCancel = (close) => {
      if (close) close()
      if (!resolvedFriendshipId) return
      // Confirm nhẹ trước khi thu hồi (tránh bấm nhầm mất follow kèm theo).
      setConfirmCancel(true)
    }

    const confirmCancelRequest = () => {
      setConfirmCancel(false)
      if (resolvedFriendshipId) handleCancelRequest(resolvedFriendshipId)
    }

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
    const userRole = roleLabel
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
        {activeSubTab === "find" && !isSelf && !sent && (
          <MenuItem
            icon={<UserPlus />}
            label={t.profile?.friends?.actions?.addFriend || "Thêm bạn bè"}
            onClick={() => {
              handleAddFriend(close)
            }}
          />
        )}
        {activeSubTab === "find" && !isSelf && sent && (
          <MenuItem
            icon={<UserMinus className="text-red-600" />}
            label={t.profile?.friends?.actions?.cancelRequest || "Thu hồi lời mời"}
            className="text-red-600"
            onClick={() => handleCancel(close)}
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
        {(isOutgoingRequest || user?.isOutgoingRequest) && (
          <MenuItem
            icon={<UserMinus className="text-red-600" />}
            label={t.profile?.friends?.actions?.cancelRequest || "Thu hồi lời mời"}
            className="text-red-600"
            onClick={() => handleCancel(close)}
          />
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
        {activeSubTab === "followers" && !isSelf && !isFollowing && (
          <MenuItem
            icon={<UserPlus />}
            label={t.profile?.friends?.actions?.followBack || "Theo dõi lại"}
            onClick={() => {
              handleFollow(user.accountId)
              close()
            }}
          />
        )}
        {activeSubTab === "followers" && !isSelf && isFollowing && (
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
            <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {((activeSubTab === "find" && sent && !isSelf) || isOutgoingRequest || user?.isOutgoingRequest) && resolvedFriendshipId ? (
                <PillButton
                  variant="secondary"
                  className="!h-8 !px-3 !text-xs !text-red-600"
                  onClick={() => handleCancel()}
                >
                  {t.profile?.friends?.actions?.cancelRequest || "Thu hồi"}
                </PillButton>
              ) : null}
              {!(activeSubTab === "find" && sent && !isSelf && !resolvedFriendshipId) && (
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
              )}
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
          <div className="w-full mt-auto flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            {/* Find Friends / Recommendations */}
            {activeSubTab === "find" && !isSelf && !sent && (
              <PillButton
                variant="primary"
                className="w-full"
                onClick={() => handleAddFriend()}
                loading={isSendingRequest}
                disabled={isSendingRequest}
              >
                {t.profile?.friends?.actions?.addFriend || "Thêm bạn bè"}
              </PillButton>
            )}
            {activeSubTab === "find" && !isSelf && sent && (
              <div className="flex items-center gap-2 w-full">
                <PillButton variant="secondary" className="flex-1" disabled>
                  {t.profile?.friends?.actions?.requestSent || "Đã gửi yêu cầu"}
                </PillButton>
                {resolvedFriendshipId && (
                  <PillButton
                    variant="secondary"
                    className="flex-1 !text-red-600"
                    onClick={() => handleCancel()}
                  >
                    {t.profile?.friends?.actions?.cancelRequest || "Thu hồi"}
                  </PillButton>
                )}
              </div>
            )}

            {/* Outgoing requests (pending tab section + anywhere flagged) */}
            {(isOutgoingRequest || user?.isOutgoingRequest) && (
              <PillButton
                variant="secondary"
                className="w-full !text-red-600"
                onClick={() => handleCancel()}
              >
                {t.profile?.friends?.actions?.cancelRequest || "Thu hồi lời mời"}
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
            {activeSubTab === "followers" && !isSelf && !isFollowing && (
              <PillButton
                variant="primary"
                className="w-full"
                onClick={() => handleFollow(user.accountId)}
              >
                {t.profile?.friends?.actions?.followBack || "Theo dõi lại"}
              </PillButton>
            )}
            {activeSubTab === "followers" && !isSelf && isFollowing && (
              <PillButton
                variant="secondary"
                className="w-full"
                onClick={() => handleUnfollow(user.accountId)}
              >
                {t.profile?.friends?.actions?.unfollow || "Bỏ theo dõi"}
              </PillButton>
            )}
          </div>
        </div>

        {/* Confirm nhẹ trước khi thu hồi lời mời đã gửi */}
        <Modal
          open={confirmCancel}
          onClose={() => setConfirmCancel(false)}
          title={t.profile?.friends?.actions?.cancelTitle || "Thu hồi lời mời"}
          className="max-w-sm"
          fullScreenOnMobile={false}
          bodyClassName="px-4 sm:px-6 py-0 flex-1 overflow-y-auto"
          footer={
            <div className="flex items-center gap-2 w-full">
              <PillButton
                variant="secondary"
                className="flex-1"
                onClick={() => setConfirmCancel(false)}
              >
                {t.profile?.friends?.actions?.keepRequest || "Giữ lại"}
              </PillButton>
              <PillButton
                variant="primary"
                className="flex-1"
                onClick={confirmCancelRequest}
              >
                {t.profile?.friends?.actions?.cancelRequest || "Thu hồi"}
              </PillButton>
            </div>
          }
        >
          <p className="text-sm text-gray-600">
            {(t.profile?.friends?.actions?.cancelMessage || "Thu hồi lời mời kết bạn đã gửi tới {name}? Bạn sẽ đồng thời bỏ theo dõi người này.")
              .replace("{name}", displayName)}
          </p>
        </Modal>
      </div>
    )
  },
)

ProfileFriendCard.displayName = "ProfileFriendCard"

export default ProfileFriendCard
