import React, { useState, useMemo } from "react"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"
import { UserPlus, UserCheck, Clock, UserX, EllipsisVertical } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "./PillButton"
import Popover from "@/shared/components/ui/Popover"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import {
  useGetConnectionStatusQuery,
  useGetPendingFriendRequestsQuery,
  useSendFriendRequestMutation,
  useDeleteFriendshipMutation,
  useRespondFriendRequestMutation,
} from "@/store/api/social/friendshipApi"
import { selectCurrentUser } from "@/store/slices/authSlice"

const RequestButton = ({
  id,
  relationship,
  size = "md",
  t: propT,
  className = "",
  disabled = false,
  ...props
}) => {
  const { t: contextT } = useLanguage()
  const t = propT || contextT || {}
  const currentUser = useSelector(selectCurrentUser)
  const [loadingAction, setLoadingAction] = useState(null)

  const currentUserId =
    currentUser?.accountId ?? currentUser?.id ?? currentUser?.userId
  const targetId = id != null ? Number(id) : null
  const isOwnAccount =
    currentUserId != null && targetId != null && Number(currentUserId) === targetId

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

  const { data: queriedStatusResponse, isLoading: isQueryLoading } =
    useGetConnectionStatusQuery(targetId, {
      skip: shouldSkipQuery,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    })

  // Fetch incoming pending requests of current user to distinguish incoming vs outgoing
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

  if (isOwnAccount || !targetId) {
    return null
  }

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

  // Match target user in incoming pending requests list
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
        (fId != null && rawStatus?.friendshipId != null && Number(fId) === Number(rawStatus.friendshipId))
      )
    })
  }, [targetId, pendingRequestsList, rawStatus?.friendshipId])

  // Incoming: Current user B received request from target user A (B viewing A)
  const isIncomingRequest = Boolean(
    !isFriend &&
      hasPendingStatus &&
      (Boolean(matchingPendingRequest) ||
        rawStatus?.isIncomingRequest === true ||
        rawStatus?.isReceiver === true ||
        rawStatus?.isReceived === true ||
        rawStatus?.isPendingRequest === true ||
        (requesterId != null && targetId != null && Number(requesterId) === targetId) ||
        (addresseeId != null && currentUserId != null && Number(addresseeId) === Number(currentUserId))),
  )

  // Outgoing: Current user A sent request to target user B (A viewing B)
  const isPendingOutgoing = Boolean(
    !isFriend &&
      hasPendingStatus &&
      !isIncomingRequest &&
      (Boolean(!matchingPendingRequest) ||
        rawStatus?.isOutgoingRequest === true ||
        rawStatus?.isSender === true ||
        rawStatus?.isRequested === true ||
        rawStatus?.isSent === true ||
        (requesterId != null && currentUserId != null && Number(requesterId) === Number(currentUserId)) ||
        (addresseeId != null && targetId != null && Number(addresseeId) === targetId)),
  )

  const isActionLoading = isSending || isDeleting || isResponding || Boolean(loadingAction)

  const friendshipId =
    matchingPendingRequest?.friendshipId ??
    rawStatus?.friendshipId ??
    rawStatus?.friendRequestId ??
    relationship?.friendshipId ??
    relationship?.friendRequestId ??
    rawStatus?.id ??
    relationship?.id ??
    targetId

  const isSmall = size === "sm"
  const iconSize = isSmall ? 14 : 16
  const buttonSizeClass = isSmall
    ? "!h-8 !px-3 !text-xs !gap-1.5"
    : ""

  const handleSendFriendRequest = async (e) => {
    e?.stopPropagation?.()
    if (isActionLoading || disabled) return
    setLoadingAction("send")
    const toastId = "friend-request-action"

    try {
      await sendFriendRequest(targetId).unwrap()
      toast.success(
        t.profile?.social?.requestSent || "Đã gửi yêu cầu kết bạn",
        { id: toastId },
      )
    } catch (error) {
      toast.error(
        t.profile?.social?.requestError ||
          t.profile?.social?.errorOccurred ||
          "Không thể gửi yêu cầu kết bạn",
        { id: toastId },
      )
      console.error(error)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleCancelFriendRequest = async (e) => {
    e?.stopPropagation?.()
    if (isActionLoading || disabled) return
    setLoadingAction("cancel")
    const toastId = "friend-request-action"

    try {
      await deleteFriendship(friendshipId).unwrap()
      toast.success(
        t.profile?.social?.cancelRequestSuccess ||
          "Đã hủy yêu cầu kết bạn",
        { id: toastId },
      )
    } catch (error) {
      toast.error(
        t.profile?.social?.errorOccurred || "Có lỗi xảy ra",
        { id: toastId },
      )
      console.error(error)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleAcceptFriendRequest = async (e) => {
    e?.stopPropagation?.()
    if (isActionLoading || disabled) return
    setLoadingAction("accept")
    const toastId = "friend-request-action"

    try {
      await respondFriendRequest({
        friendshipId,
        action: "accept",
      }).unwrap()
      toast.success(
        t.profile?.friends?.actions?.acceptSuccess ||
          "Đã chấp nhận kết bạn!",
        { id: toastId },
      )
    } catch (error) {
      toast.error(
        t.profile?.friends?.actions?.error ||
          t.profile?.social?.errorOccurred ||
          "Có lỗi xảy ra",
        { id: toastId },
      )
      console.error(error)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleDeclineFriendRequest = async (e) => {
    e?.stopPropagation?.()
    if (isActionLoading || disabled) return
    setLoadingAction("decline")
    const toastId = "friend-request-action"

    try {
      await respondFriendRequest({
        friendshipId,
        action: "decline",
      }).unwrap()
      toast.success(
        t.profile?.friends?.actions?.declineSuccess ||
          "Đã từ chối kết bạn",
        { id: toastId },
      )
    } catch (error) {
      toast.error(
        t.profile?.friends?.actions?.error ||
          t.profile?.social?.errorOccurred ||
          "Có lỗi xảy ra",
        { id: toastId },
      )
      console.error(error)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleUnfriend = async (e) => {
    e?.stopPropagation?.()
    if (isActionLoading || disabled) return
    setLoadingAction("unfriend")
    const toastId = "friend-request-action"

    try {
      await deleteFriendship(friendshipId).unwrap()
      toast.success(
        t.profile?.social?.unfriendSuccess || "Đã hủy kết bạn",
        { id: toastId },
      )
    } catch (error) {
      toast.error(
        t.profile?.social?.errorOccurred || "Có lỗi xảy ra",
        { id: toastId },
      )
      console.error(error)
    } finally {
      setLoadingAction(null)
    }
  }

  // State: Friend
  if (isFriend) {
    return (
      <PillButton
        variant="secondary"
        startIcon={<UserCheck size={iconSize} className="text-cath-red-700" />}
        onClick={handleUnfriend}
        loading={loadingAction === "unfriend"}
        disabled={disabled || isActionLoading}
        className={`${buttonSizeClass} ${className}`}
        {...props}
      >
        {t.profile?.social?.unfriend || t.profile?.tabs?.friends || "Bạn bè"}
      </PillButton>
    )
  }

  // State: Sent request (Pending outgoing - A viewing B)
  if (isPendingOutgoing) {
    return (
      <PillButton
        variant="secondary"
        startIcon={<Clock size={iconSize} />}
        onClick={handleCancelFriendRequest}
        loading={loadingAction === "cancel"}
        disabled={disabled || isActionLoading}
        className={`${buttonSizeClass} ${className}`}
        {...props}
      >
        {t.profile?.social?.cancelRequest || "Hủy yêu cầu"}
      </PillButton>
    )
  }

  // State: Received request (Pending incoming - B viewing A)
  if (isIncomingRequest) {
    const actionLabel =
      t.profile?.friends?.actions?.actionButton ||
      t.common?.actions ||
      t.profile?.friends?.actions?.title ||
      "Hành động"

    return (
      <div className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
        {/* Large screens: 2 horizontal buttons side-by-side */}
        <div className="hidden sm:inline-flex items-center gap-2 shrink-0">
          <PillButton
            variant="primary"
            startIcon={<UserCheck size={iconSize} />}
            onClick={handleAcceptFriendRequest}
            loading={loadingAction === "accept"}
            disabled={disabled || isActionLoading}
            className={buttonSizeClass}
            {...props}
          >
            {t.profile?.friends?.actions?.accept || "Chấp nhận"}
          </PillButton>
          <PillButton
            variant="secondary"
            startIcon={<UserX size={iconSize} className="text-red-600" />}
            onClick={handleDeclineFriendRequest}
            loading={loadingAction === "decline"}
            disabled={disabled || isActionLoading}
            className={buttonSizeClass}
            {...props}
          >
            {t.profile?.friends?.actions?.decline || "Từ chối"}
          </PillButton>
        </div>

        {/* Small screens: Single "<EllipsisVertical /> Hành động" button with Popover */}
        <div className="inline-flex sm:hidden w-full">
          <Popover
            placement="bottom-right"
            triggerClassName="w-full"
            trigger={
              <PillButton
                variant="secondary"
                startIcon={<EllipsisVertical size={iconSize} />}
                loading={Boolean(loadingAction)}
                disabled={disabled || isActionLoading}
                className={`${buttonSizeClass} w-full`}
                {...props}
              >
                {actionLabel}
              </PillButton>
            }
            content={(close) => (
              <MenuList className="min-w-[150px] shadow-lg border border-gray-100 py-1">
                <MenuItem
                  onClick={(e) => {
                    close?.()
                    handleAcceptFriendRequest(e)
                  }}
                  icon={<UserCheck size={16} className="text-cath-red-700" />}
                  label={t.profile?.friends?.actions?.accept || "Chấp nhận"}
                />
                <MenuItem
                  onClick={(e) => {
                    close?.()
                    handleDeclineFriendRequest(e)
                  }}
                  icon={<UserX size={16} className="text-red-600" />}
                  label={t.profile?.friends?.actions?.decline || "Từ chối"}
                  className="text-red-600 hover:text-red-700"
                />
              </MenuList>
            )}
          />
        </div>
      </div>
    )
  }

  // State: Not friends (Default)
  return (
    <PillButton
      variant="primary"
      startIcon={<UserPlus size={iconSize} />}
      onClick={handleSendFriendRequest}
      loading={loadingAction === "send" || (isQueryLoading && !relationship)}
      disabled={disabled || isActionLoading}
      className={`${buttonSizeClass} ${className}`}
      {...props}
    >
      {t.profile?.social?.addFriend || "Kết bạn"}
    </PillButton>
  )
}

export default RequestButton
