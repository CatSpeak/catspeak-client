import React, { useMemo, useContext } from "react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import AuthModalContext from "@/shared/context/AuthModalContext"
import {
  useGetConnectionStatusQuery,
  useGetPendingFriendRequestsQuery,
  useSendFriendRequestMutation,
  useDeleteFriendshipMutation,
  useRespondFriendRequestMutation,
} from "@/store/api/social/friendshipApi"
import {
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Loader2,
  X,
} from "lucide-react"

const ClassMemberFriendButton = ({
  targetId,
  relationship,
  className = "",
}) => {
  const { t } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const authModalCtx = useContext(AuthModalContext)

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

  const ensureAuth = () => {
    if (!isAuthenticated) {
      if (authModalCtx?.openAuthModal) {
        authModalCtx.openAuthModal("login", window.location.pathname)
      } else {
        toast.error(
          t.courses?.student?.loginToEnroll ||
            "Vui lòng đăng nhập để tiếp tục.",
        )
      }
      return false
    }
    return true
  }

  const handleSendFriendRequest = async (e) => {
    e?.stopPropagation?.()
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

  const handleCancelFriendRequest = async (e) => {
    e?.stopPropagation?.()
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

  const handleAcceptFriendRequest = async (e) => {
    e?.stopPropagation?.()
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

  const handleDeclineFriendRequest = async (e) => {
    e?.stopPropagation?.()
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

  const handleUnfriend = async (e) => {
    e?.stopPropagation?.()
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

  const isLoading = isSending || isDeleting || isResponding

  // 1. Trạng thái ĐÃ LÀ BẠN BÈ
  if (isFriend) {
    return (
      <button
        type="button"
        onClick={handleUnfriend}
        disabled={isLoading}
        title={t.profile?.social?.unfriend || "Bạn bè (Nhấn để hủy kết bạn)"}
        className={`h-8 px-2.5 sm:px-3 rounded-full border border-emerald-200 bg-emerald-50 hover:bg-red-50 hover:border-red-200 text-emerald-700 hover:text-red-700 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs group active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 ${className}`}
      >
        {isLoading ? (
          <Loader2 size={13} className="animate-spin text-emerald-600" />
        ) : (
          <>
            <UserCheck size={13} className="shrink-0 group-hover:hidden" />
            <UserX size={13} className="shrink-0 hidden group-hover:inline text-red-600" />
            <span className="hidden md:inline group-hover:hidden">Bạn bè</span>
            <span className="hidden md:group-hover:inline">Hủy kết bạn</span>
          </>
        )}
      </button>
    )
  }

  // 2. Trạng thái ĐANG CHỜ PHẢN HỒI (đã gửi lời mời đi)
  if (isPendingOutgoing) {
    return (
      <button
        type="button"
        onClick={handleCancelFriendRequest}
        disabled={isLoading}
        title={t.profile?.social?.cancelRequest || "Đã gửi lời mời (Nhấn để hủy)"}
        className={`h-8 px-2.5 sm:px-3 rounded-full border border-amber-200 bg-amber-50 hover:bg-red-50 hover:border-red-200 text-amber-700 hover:text-red-700 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs group active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 ${className}`}
      >
        {isLoading ? (
          <Loader2 size={13} className="animate-spin text-amber-600" />
        ) : (
          <>
            <Clock size={13} className="shrink-0 text-amber-600 group-hover:hidden" />
            <X size={13} className="shrink-0 hidden group-hover:inline text-red-600" />
            <span className="hidden md:inline group-hover:hidden">Đã gửi</span>
            <span className="hidden md:group-hover:inline">Hủy lời mời</span>
          </>
        )}
      </button>
    )
  }

  // 3. Trạng thái CÓ LỜI MỜI ĐẾN (đối phương gửi cho mình)
  if (isIncomingRequest) {
    return (
      <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`}>
        <button
          type="button"
          onClick={handleAcceptFriendRequest}
          disabled={isLoading}
          title={t.profile?.friends?.actions?.accept || "Chấp nhận kết bạn"}
          className="h-8 px-2.5 sm:px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 size={13} className="animate-spin text-white" />
          ) : (
            <>
              <UserCheck size={13} className="shrink-0" />
              <span className="hidden md:inline">Chấp nhận</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleDeclineFriendRequest}
          disabled={isLoading}
          title={t.profile?.friends?.actions?.decline || "Từ chối kết bạn"}
          className="h-8 w-8 rounded-full border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
        >
          <X size={13} />
        </button>
      </div>
    )
  }

  // 4. Trạng thái CHƯA KẾT BẠN (mặc định)
  return (
    <button
      type="button"
      onClick={handleSendFriendRequest}
      disabled={isLoading}
      title={t.profile?.social?.addFriend || "Kết bạn"}
      className={`h-8 px-2.5 sm:px-3 rounded-full border border-gray-200 hover:border-[#990011] hover:text-[#990011] hover:bg-red-50/50 bg-white text-gray-700 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 ${className}`}
    >
      {isLoading ? (
        <Loader2 size={13} className="animate-spin text-gray-400" />
      ) : (
        <>
          <UserPlus size={13} className="shrink-0" />
          <span className="hidden md:inline">{t.profile?.social?.addFriend || "Kết bạn"}</span>
        </>
      )}
    </button>
  )
}

export default ClassMemberFriendButton
