import React, { useState, useMemo, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import AuthModalContext from "@/shared/context/AuthModalContext"
import { useCreatePrivateConversationMutation } from "@/store/api/social/conversationsApi"
import {
  useGetConnectionStatusQuery,
  useGetPendingFriendRequestsQuery,
  useSendFriendRequestMutation,
  useDeleteFriendshipMutation,
  useRespondFriendRequestMutation,
} from "@/store/api/social/friendshipApi"
import Popover from "@/shared/components/ui/Popover"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import {
  Clock,
  Send,
  Loader2,
  EllipsisVertical,
  UserPlus,
  UserCheck,
  UserX,
} from "lucide-react"

const ClassMemberActionDropdown = ({
  targetId,
  relationship,
  onStartChat,
  isMessaging: externalIsMessaging,
  className = "",
}) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const authModalCtx = useContext(AuthModalContext)
  const [createPrivateConversation] = useCreatePrivateConversationMutation()
  const [internalIsMessaging, setInternalIsMessaging] = useState(false)
  const isMessaging = externalIsMessaging ?? internalIsMessaging

  const currentUserId = user?.accountId ?? user?.id ?? user?.userId
  const isOwnAccount =
    currentUserId != null &&
    targetId != null &&
    Number(currentUserId) === Number(targetId)

  const hasExplicitRelationship = Boolean(
    relationship &&
      (relationship.isFriend !== undefined ||
        relationship.friendshipStatus !== undefined ||
        relationship.isFollowing !== undefined ||
        relationship.isIncomingRequest !== undefined ||
        relationship.isOutgoingRequest !== undefined ||
        relationship.isReceiver !== undefined ||
        relationship.isSender !== undefined ||
        relationship.requesterId !== undefined ||
        relationship.addresseeId !== undefined),
  )

  const shouldSkipQuery = !targetId || isOwnAccount || hasExplicitRelationship

  const { data: queriedStatusResponse } = useGetConnectionStatusQuery(
    targetId,
    {
      skip: shouldSkipQuery,
    },
  )

  const { data: pendingRequestsResponse } = useGetPendingFriendRequestsQuery(
    undefined,
    {
      skip: !currentUserId,
    },
  )

  const [sendFriendRequest, { isLoading: isSending }] =
    useSendFriendRequestMutation()
  const [deleteFriendship, { isLoading: isDeleting }] =
    useDeleteFriendshipMutation()
  const [respondFriendRequest, { isLoading: isResponding }] =
    useRespondFriendRequestMutation()

  const pendingRequestsList = useMemo(() => {
    return Array.isArray(pendingRequestsResponse)
      ? pendingRequestsResponse
      : pendingRequestsResponse?.data || []
  }, [pendingRequestsResponse])

  if (isOwnAccount || !targetId) return null

  const rawStatus =
    queriedStatusResponse?.data !== undefined
      ? queriedStatusResponse.data
      : queriedStatusResponse || relationship || {}

  const isFriend = Boolean(
    rawStatus?.isFriend === true ||
      rawStatus?.friendshipStatus === 2 ||
      rawStatus?.friendshipStatus === "Accepted" ||
      rawStatus?.status === "Accepted" ||
      rawStatus?.status === 2,
  )

  const hasPendingStatus = Boolean(
    !isFriend &&
      (rawStatus?.isPending === true ||
        rawStatus?.friendshipStatus === 1 ||
        rawStatus?.friendshipStatus === "Pending" ||
        rawStatus?.status === "Pending" ||
        rawStatus?.status === 1 ||
        rawStatus?.isOutgoingRequest === true ||
        rawStatus?.isIncomingRequest === true ||
        rawStatus?.isRequested === true ||
        rawStatus?.isPendingRequest === true ||
        rawStatus?.isSender === true ||
        rawStatus?.isReceiver === true),
  )

  const requesterId =
    rawStatus?.requesterId ??
    rawStatus?.requester?.accountId ??
    rawStatus?.requester?.id ??
    rawStatus?.senderId ??
    rawStatus?.sender?.accountId ??
    rawStatus?.sender?.id

  const addresseeId =
    rawStatus?.addresseeId ??
    rawStatus?.addressee?.accountId ??
    rawStatus?.addressee?.id ??
    rawStatus?.receiverId ??
    rawStatus?.receiver?.accountId ??
    rawStatus?.receiver?.id

  const matchingPendingRequest = useMemo(() => {
    if (!targetId || !pendingRequestsList.length) return null
    return pendingRequestsList.find((req) => {
      const rId =
        req.requester?.accountId ??
        req.requester?.id ??
        req.requesterId ??
        req.senderId
      const fId = req.friendshipId ?? req.id
      return (
        (rId != null && Number(rId) === targetId) ||
        (fId != null &&
          rawStatus?.friendshipId != null &&
          Number(fId) === Number(rawStatus.friendshipId))
      )
    })
  }, [targetId, pendingRequestsList, rawStatus?.friendshipId])

  const isIncomingRequest = Boolean(
    !isFriend &&
      hasPendingStatus &&
      (Boolean(matchingPendingRequest) ||
        rawStatus?.isIncomingRequest === true ||
        rawStatus?.isReceiver === true ||
        rawStatus?.isReceived === true ||
        rawStatus?.isPendingRequest === true ||
        (requesterId != null &&
          targetId != null &&
          Number(requesterId) === targetId) ||
        (addresseeId != null &&
          currentUserId != null &&
          Number(addresseeId) === Number(currentUserId))),
  )

  const isPendingOutgoing = Boolean(
    !isFriend &&
      hasPendingStatus &&
      !isIncomingRequest &&
      (Boolean(!matchingPendingRequest) ||
        rawStatus?.isOutgoingRequest === true ||
        rawStatus?.isSender === true ||
        rawStatus?.isRequested === true ||
        rawStatus?.isSent === true ||
        (requesterId != null &&
          currentUserId != null &&
          Number(requesterId) === Number(currentUserId)) ||
        (addresseeId != null &&
          targetId != null &&
          Number(addresseeId) === targetId)),
  )

  const friendshipId =
    matchingPendingRequest?.friendshipId ??
    rawStatus?.friendshipId ??
    rawStatus?.friendRequestId ??
    relationship?.friendshipId ??
    relationship?.friendRequestId ??
    rawStatus?.id ??
    relationship?.id ??
    targetId

  const ensureAuth = (actionMessage) => {
    if (!isAuthenticated) {
      if (authModalCtx?.openAuthModal) {
        authModalCtx.openAuthModal("login", window.location.pathname)
      } else {
        toast.error(
          actionMessage ||
            t.courses?.student?.loginToEnroll ||
            "Vui lòng đăng nhập để tiếp tục.",
        )
      }
      return false
    }
    return true
  }

  const handleSendFriendRequest = async () => {
    if (!ensureAuth()) return
    const toastId = "friend-request-action"
    try {
      await sendFriendRequest(targetId).unwrap()
      toast.success(
        t.profile?.social?.requestSent || "Đã gửi yêu cầu kết bạn",
        { id: toastId },
      )
    } catch {
      toast.error(
        t.profile?.social?.requestError || "Không thể gửi yêu cầu kết bạn",
        { id: toastId },
      )
    }
  }

  const handleCancelFriendRequest = async () => {
    if (!ensureAuth()) return
    const toastId = "friend-request-action"
    try {
      await deleteFriendship(friendshipId).unwrap()
      toast.success(
        t.profile?.social?.cancelRequestSuccess || "Đã hủy yêu cầu kết bạn",
        { id: toastId },
      )
    } catch {
      toast.error(t.profile?.social?.errorOccurred || "Có lỗi xảy ra", {
        id: toastId,
      })
    }
  }

  const handleAcceptFriendRequest = async () => {
    if (!ensureAuth()) return
    const toastId = "friend-request-action"
    try {
      await respondFriendRequest({
        friendshipId,
        action: "accept",
      }).unwrap()
      toast.success(
        t.profile?.friends?.actions?.acceptSuccess || "Đã chấp nhận kết bạn!",
        { id: toastId },
      )
    } catch {
      toast.error(t.profile?.friends?.actions?.error || "Có lỗi xảy ra", {
        id: toastId,
      })
    }
  }

  const handleDeclineFriendRequest = async () => {
    if (!ensureAuth()) return
    const toastId = "friend-request-action"
    try {
      await respondFriendRequest({
        friendshipId,
        action: "decline",
      }).unwrap()
      toast.success(
        t.profile?.friends?.actions?.declineSuccess || "Đã từ chối kết bạn",
        { id: toastId },
      )
    } catch {
      toast.error(t.profile?.friends?.actions?.error || "Có lỗi xảy ra", {
        id: toastId,
      })
    }
  }

  const handleUnfriend = async () => {
    if (!ensureAuth()) return
    const toastId = "friend-request-action"
    try {
      await deleteFriendship(friendshipId).unwrap()
      toast.success(
        t.profile?.social?.unfriendSuccess || "Đã hủy kết bạn",
        { id: toastId },
      )
    } catch {
      toast.error(t.profile?.social?.errorOccurred || "Có lỗi xảy ra", {
        id: toastId,
      })
    }
  }

  const handleStartChatInternal = async (e) => {
    e?.stopPropagation?.()
    if (onStartChat) {
      onStartChat(e)
      return
    }

    if (
      !ensureAuth(
        t.courses?.student?.loginToEnroll || "Vui lòng đăng nhập để nhắn tin.",
      )
    ) {
      return
    }

    if (isOwnAccount) return

    try {
      setInternalIsMessaging(true)
      const conversation = await createPrivateConversation(targetId).unwrap()
      const convId =
        conversation?.id ??
        conversation?.conversationId ??
        conversation?.data?.id
      if (convId) {
        navigate(`/chat/${encodeURIComponent(String(convId))}`)
      } else {
        toast.error(
          t.courses?.studentCourseDetail?.chatOpenFailed ||
            t.courses?.classDetail?.chatOpenFailed ||
            "Không thể mở hộp thoại.",
        )
      }
    } catch {
      toast.error(
        t.courses?.studentCourseDetail?.chatOpenFailed ||
          t.courses?.classDetail?.chatOpenFailed ||
          "Không thể mở hộp thoại.",
      )
    } finally {
      setInternalIsMessaging(false)
    }
  }

  const isActionLoading = isSending || isDeleting || isResponding

  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      <Popover
        placement="bottom-right"
        trigger={
          <button
            type="button"
            aria-label={t.common?.actions || "Tùy chọn"}
            title={t.common?.actions || "Tùy chọn"}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200/80 transition-all border border-transparent hover:border-gray-200 shadow-2xs cursor-pointer"
          >
            {isMessaging || isActionLoading ? (
              <Loader2 size={15} className="animate-spin text-gray-500" />
            ) : (
              <EllipsisVertical size={15} />
            )}
          </button>
        }
        content={(close) => (
          <MenuList className="min-w-[170px] py-1 shadow-xl border border-gray-100 rounded-2xl">
            {/* Friend Action */}
            {isFriend ? (
              <MenuItem
                onClick={(e) => {
                  e?.stopPropagation?.()
                  close?.()
                  handleUnfriend()
                }}
                icon={<UserX size={16} className="text-red-500" />}
                label={t.profile?.social?.unfriend || "Hủy kết bạn"}
                className="text-red-600 hover:text-red-700"
              />
            ) : isPendingOutgoing ? (
              <MenuItem
                onClick={(e) => {
                  e?.stopPropagation?.()
                  close?.()
                  handleCancelFriendRequest()
                }}
                icon={<Clock size={16} className="text-amber-500" />}
                label={t.profile?.social?.cancelRequest || "Hủy yêu cầu kết bạn"}
              />
            ) : isIncomingRequest ? (
              <>
                <MenuItem
                  onClick={(e) => {
                    e?.stopPropagation?.()
                    close?.()
                    handleAcceptFriendRequest()
                  }}
                  icon={<UserCheck size={16} className="text-emerald-600" />}
                  label={
                    t.profile?.friends?.actions?.accept || "Chấp nhận kết bạn"
                  }
                  className="text-emerald-600 hover:text-emerald-700"
                />
                <MenuItem
                  onClick={(e) => {
                    e?.stopPropagation?.()
                    close?.()
                    handleDeclineFriendRequest()
                  }}
                  icon={<UserX size={16} className="text-red-500" />}
                  label={
                    t.profile?.friends?.actions?.decline || "Từ chối kết bạn"
                  }
                  className="text-red-600 hover:text-red-700"
                />
              </>
            ) : (
              <MenuItem
                onClick={(e) => {
                  e?.stopPropagation?.()
                  close?.()
                  handleSendFriendRequest()
                }}
                icon={<UserPlus size={16} className="text-[#990011]" />}
                label={t.profile?.social?.addFriend || "Kết bạn"}
              />
            )}

            {/* Message Action */}
            <MenuItem
              onClick={(e) => {
                e?.stopPropagation?.()
                close?.()
                handleStartChatInternal(e)
              }}
              icon={<Send size={16} className="text-gray-700" />}
              label={t.courses?.classDetail?.message || "Nhắn tin"}
            />
          </MenuList>
        )}
      />
    </div>
  )
}

export default ClassMemberActionDropdown
