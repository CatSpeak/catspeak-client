// Nút yêu cầu kết bạn & xử lý quan hệ kết bạn

import React, { useState, useMemo, useEffect } from "react"
import toast from "react-hot-toast"
import { UserPlus, UserMinus, Check, X } from "lucide-react"
import PillButton from "./PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import {
  useSendFriendRequestMutation,
  useDeleteFriendshipMutation,
  useRespondFriendRequestMutation,
} from "@/store/api/social/friendshipApi"

const RequestButton = ({
  id,
  targetAccountId,
  userId,
  relationship,
  status,
  isFriend: isFriendProp,
  friendshipStatus: friendshipStatusProp,
  friendshipId: friendshipIdProp,
  size = "default", // "default" | "sm" | "compact"
  className = "",
  t: customT,
  disabled = false,
  onSuccess,
  onError,
  ...props
}) => {
  const { user: currentUser } = useAuth()
  const { t: langT } = useLanguage()
  const t = customT || langT

  const targetId = id ?? targetAccountId ?? userId
  const currentUserId = currentUser?.accountId ?? currentUser?.id

  // Check if viewing own profile or invalid ID
  const isSelf =
    Boolean(targetId) &&
    Boolean(currentUserId) &&
    Number(targetId) === Number(currentUserId)

  // External relationship object/props normalization
  const externalStatus = useMemo(() => {
    const raw = relationship !== undefined ? relationship : status
    if (raw && typeof raw === "object") {
      return {
        isFriend: raw.isFriend ?? raw.data?.isFriend ?? false,
        friendshipStatus:
          raw.friendshipStatus ?? raw.data?.friendshipStatus ?? null,
        friendshipId: raw.friendshipId ?? raw.data?.friendshipId ?? null,
        isRequester: raw.isRequester ?? raw.data?.isRequester,
        isAddressee: raw.isAddressee ?? raw.data?.isAddressee,
        requesterId:
          raw.requesterId ??
          raw.data?.requesterId ??
          raw.senderId ??
          raw.data?.senderId,
        addresseeId:
          raw.addresseeId ??
          raw.data?.addresseeId ??
          raw.receiverId ??
          raw.data?.receiverId,
        isReceived: raw.isReceived ?? raw.data?.isReceived,
        isIncoming: raw.isIncoming ?? raw.data?.isIncoming,
        isPendingRequest: raw.isPendingRequest ?? raw.data?.isPendingRequest,
      }
    }
    return {
      isFriend: isFriendProp ?? false,
      friendshipStatus: friendshipStatusProp ?? null,
      friendshipId: friendshipIdProp ?? null,
      isRequester: props.isRequester,
      isAddressee: props.isAddressee,
      requesterId: props.requesterId ?? props.senderId,
      addresseeId: props.addresseeId ?? props.receiverId,
      isReceived: props.isReceived,
      isIncoming: props.isIncoming,
      isPendingRequest: props.isPendingRequest,
    }
  }, [
    relationship,
    status,
    isFriendProp,
    friendshipStatusProp,
    friendshipIdProp,
    props.isRequester,
    props.isAddressee,
    props.requesterId,
    props.senderId,
    props.addresseeId,
    props.receiverId,
    props.isReceived,
    props.isIncoming,
    props.isPendingRequest,
  ])

  // Internal state for optimistic updates / standalone usage
  const [localStatus, setLocalStatus] = useState(externalStatus)

  useEffect(() => {
    setLocalStatus(externalStatus)
  }, [externalStatus])

  const effectiveStatus = localStatus || externalStatus

  // API Mutations
  const [sendFriendRequest, { isLoading: isSendingRequest }] =
    useSendFriendRequestMutation()
  const [deleteFriendship, { isLoading: isDeletingFriendship }] =
    useDeleteFriendshipMutation()
  const [respondFriendRequest, { isLoading: isResponding }] =
    useRespondFriendRequestMutation()

  const [respondingAction, setRespondingAction] = useState(null) // "accept" | "decline" | null

  const isFriendshipLoading = isSendingRequest || isDeletingFriendship
  const isRespondingLoading = isResponding || Boolean(respondingAction)
  const isFriendshipDisabled =
    disabled || isFriendshipLoading || isRespondingLoading

  // Relationship state determination
  const isFriend = Boolean(effectiveStatus?.isFriend)
  const isPending = Boolean(
    effectiveStatus?.friendshipStatus === 1 ||
      effectiveStatus?.friendshipStatus === "Pending" ||
      effectiveStatus?.friendshipStatus === "PENDING" ||
      effectiveStatus?.isPendingRequest
  )

  // Incoming request: Target user sent request to Current user (Current user is the Addressee)
  const isIncomingRequest = Boolean(
    !isFriend &&
      isPending &&
      (effectiveStatus?.isReceived ||
        effectiveStatus?.isIncoming ||
        effectiveStatus?.isAddressee ||
        effectiveStatus?.isPendingRequest ||
        effectiveStatus?.isRequester === false ||
        (effectiveStatus?.requesterId &&
          targetId &&
          Number(effectiveStatus.requesterId) === Number(targetId)) ||
        (effectiveStatus?.addresseeId &&
          currentUserId &&
          Number(effectiveStatus.addresseeId) === Number(currentUserId)))
  )

  // Outgoing pending request: Current user sent request to Target user
  const isOutgoingPending = !isFriend && isPending && !isIncomingRequest

  const handleFriendshipToggle = async (e) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation()
    }
    if (isFriendshipDisabled || !targetId) return

    try {
      if (isFriend || isOutgoingPending) {
        const fId = effectiveStatus?.friendshipId
        if (fId) {
          await deleteFriendship(fId).unwrap()
          setLocalStatus({
            isFriend: false,
            friendshipStatus: null,
            friendshipId: null,
            isRequester: null,
            isAddressee: null,
          })
          toast.success(
            isFriend
              ? t.profile?.social?.unfriendSuccess || "Đã hủy kết bạn"
              : t.profile?.social?.cancelRequestSuccess ||
                  "Đã hủy yêu cầu kết bạn",
            { id: "friendship-action" }
          )
        } else {
          setLocalStatus({
            isFriend: false,
            friendshipStatus: null,
            friendshipId: null,
            isRequester: null,
            isAddressee: null,
          })
        }
      } else {
        if (effectiveStatus?.friendshipId) {
          await deleteFriendship(effectiveStatus.friendshipId).unwrap()
        }
        const res = await sendFriendRequest(targetId).unwrap()
        const newFriendshipId =
          res?.data?.friendshipId ?? res?.friendshipId ?? res?.id ?? null
        setLocalStatus({
          isFriend: false,
          friendshipStatus: "Pending",
          friendshipId: newFriendshipId,
          isRequester: true,
          isAddressee: false,
        })
        toast.success(
          t.profile?.social?.requestSent || "Đã gửi yêu cầu kết bạn",
          { id: "friendship-action" }
        )
      }
      onSuccess?.()
    } catch (err) {
      if (err?.status === 422) {
        toast.error(
          t.profile?.social?.requestPending ||
            "Yêu cầu kết bạn đã tồn tại hoặc đang chờ xử lý",
          { id: "friendship-action" }
        )
        setLocalStatus((prev) => ({
          ...prev,
          friendshipStatus: "Pending",
        }))
      } else {
        toast.error(t.profile?.social?.errorOccurred || "Có lỗi xảy ra", {
          id: "friendship-action",
        })
      }
      console.error(err)
      onError?.(err)
    }
  }

  const handleAccept = async (e) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation()
    }
    if (isFriendshipDisabled || !effectiveStatus?.friendshipId) return

    setRespondingAction("accept")

    try {
      await respondFriendRequest({
        friendshipId: effectiveStatus.friendshipId,
        action: "accept",
      }).unwrap()

      setLocalStatus({
        isFriend: true,
        friendshipStatus: "Accepted",
        friendshipId: effectiveStatus.friendshipId,
        isRequester: null,
        isAddressee: null,
      })

      toast.success(
        t.profile?.friends?.actions?.acceptSuccess || "Đã chấp nhận kết bạn!",
        { id: "friendship-action" }
      )
      onSuccess?.("accept")
    } catch (err) {
      toast.error(
        t.profile?.friends?.actions?.error ||
          t.profile?.social?.errorOccurred ||
          "Có lỗi xảy ra",
        { id: "friendship-action" }
      )
      console.error(err)
      onError?.(err)
    } finally {
      setRespondingAction(null)
    }
  }

  const handleDecline = async (e) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation()
    }
    if (isFriendshipDisabled || !effectiveStatus?.friendshipId) return

    setRespondingAction("decline")

    try {
      await respondFriendRequest({
        friendshipId: effectiveStatus.friendshipId,
        action: "decline",
      }).unwrap()

      setLocalStatus({
        isFriend: false,
        friendshipStatus: null,
        friendshipId: null,
        isRequester: null,
        isAddressee: null,
      })

      toast.success(
        t.profile?.friends?.actions?.declineSuccess || "Đã từ chối kết bạn",
        { id: "friendship-action" }
      )
      onSuccess?.("decline")
    } catch (err) {
      toast.error(
        t.profile?.friends?.actions?.error ||
          t.profile?.social?.errorOccurred ||
          "Có lỗi xảy ra",
        { id: "friendship-action" }
      )
      console.error(err)
      onError?.(err)
    } finally {
      setRespondingAction(null)
    }
  }

  // If user is viewing their own profile or invalid ID, do not render
  if (isSelf || !targetId) {
    return null
  }

  const sizeClasses =
    size === "sm" || size === "compact"
      ? "!h-8 [&>div]:!h-7 [&>div]:px-2.5 [&>div]:text-xs [&>div_span]:w-3.5 [&>div_span]:h-3.5"
      : ""

  // Case: B received a friend request from A -> Display "Chấp nhận" and "Từ chối" buttons
  if (isIncomingRequest) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <PillButton
          variant="primary"
          startIcon={<Check />}
          onClick={handleAccept}
          disabled={isFriendshipDisabled}
          loading={respondingAction === "accept"}
          className={`${sizeClasses} ${isFriendshipDisabled ? "cursor-not-allowed" : ""}`}
          {...props}
        >
          {t.profile?.friends?.actions?.accept || "Chấp nhận"}
        </PillButton>

        <PillButton
          variant="secondary"
          startIcon={<X />}
          onClick={handleDecline}
          disabled={isFriendshipDisabled}
          loading={respondingAction === "decline"}
          className={`${sizeClasses} ${isFriendshipDisabled ? "cursor-not-allowed" : ""}`}
          {...props}
        >
          {t.profile?.friends?.actions?.decline || "Từ chối"}
        </PillButton>
      </div>
    )
  }

  // Standard Cases: Friends ("Hủy kết bạn"), Outgoing Pending ("Hủy yêu cầu"), or Stranger ("Kết bạn")
  const friendshipVariant = isFriend
    ? "outline"
    : isOutgoingPending
    ? "secondary"
    : "outline"

  const friendshipIcon = isFriend || isOutgoingPending ? (
    <UserMinus />
  ) : (
    <UserPlus />
  )

  const friendshipLabel = isFriend
    ? t.profile?.social?.unfriend || "Hủy kết bạn"
    : isOutgoingPending
    ? t.profile?.social?.cancelRequest || "Hủy yêu cầu"
    : t.profile?.social?.addFriend || "Kết bạn"

  return (
    <PillButton
      variant={friendshipVariant}
      startIcon={friendshipIcon}
      onClick={handleFriendshipToggle}
      disabled={isFriendshipDisabled}
      loading={isFriendshipLoading}
      className={`${sizeClasses} ${isFriendshipDisabled ? "cursor-not-allowed" : ""} ${className}`}
      {...props}
    >
      {friendshipLabel}
    </PillButton>
  )
}

export default RequestButton
