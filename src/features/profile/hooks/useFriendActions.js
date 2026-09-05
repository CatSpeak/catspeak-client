import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useSendFriendRequestMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useDeleteFriendshipMutation,
  useRespondFriendRequestMutation,
  friendshipApi,
} from "@/store/api/social/friendshipApi"
import { useCreatePrivateConversationMutation } from "@/store/api/social/conversationsApi"

export const useFriendActions = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [createPrivateConversation] = useCreatePrivateConversationMutation()
  const [sendFriendRequest] = useSendFriendRequestMutation()
  const [followUser] = useFollowUserMutation()
  const [unfollowUser] = useUnfollowUserMutation()
  const [deleteFriendship] = useDeleteFriendshipMutation()
  const [respondFriendRequest] = useRespondFriendRequestMutation()

  const handleStartChat = async (targetId, close) => {
    if (close) close()
    if (!targetId) return
    try {
      const res = await createPrivateConversation(targetId).unwrap()
      const convId = res?.id ?? res?.conversationId ?? res?.data?.id
      navigate(convId ? `/chat/${encodeURIComponent(String(convId))}` : "/chat")
    } catch {
      toast.error(
        t.profile?.friends?.actions?.chatError || "Không thể mở cuộc trò chuyện",
      )
    }
  }

  const handleSendRequest = async (targetId, close) => {
    if (close) close()
    try {
      await sendFriendRequest(targetId).unwrap()
      toast.success(t.profile?.social?.requestSent || "Đã gửi yêu cầu kết bạn")
    } catch {
      toast.error(t.profile?.friends?.actions?.error || "Có lỗi xảy ra")
    }
  }

  const handleFollow = async (targetId, close) => {
    if (close) close()
    try {
      await followUser(targetId).unwrap()
      toast.success(t.profile?.social?.followSuccess || "Đã theo dõi")
    } catch {
      toast.error(t.profile?.friends?.actions?.error || "Có lỗi xảy ra")
    }
  }

  const handleUnfollow = async (targetId, close) => {
    if (close) close()
    try {
      await unfollowUser(targetId).unwrap()
      toast.success(t.profile?.social?.unfollowSuccess || "Đã hủy theo dõi")
    } catch {
      toast.error(t.profile?.friends?.actions?.error || "Có lỗi xảy ra")
    }
  }

  const handleUnfriend = async (idOrObj, close) => {
    if (close) close()
    const targetAccountId =
      typeof idOrObj === "object" ? idOrObj?.accountId : idOrObj
    let friendshipId =
      typeof idOrObj === "object" ? idOrObj?.friendshipId : undefined

    try {
      if (!friendshipId && targetAccountId) {
        try {
          const statusRes = await dispatch(
            friendshipApi.endpoints.getConnectionStatus.initiate(
              targetAccountId,
              { forceRefetch: true },
            ),
          ).unwrap()
          const raw = statusRes?.data ?? statusRes
          friendshipId = raw?.friendshipId ?? raw?.id
        } catch {
          friendshipId = targetAccountId
        }
      }

      const finalId = friendshipId || targetAccountId
      if (!finalId) return

      await deleteFriendship(finalId).unwrap()
    } catch {
      toast.error(t.profile?.friends?.actions?.error || "Có lỗi xảy ra")
    }
  }

  const handleAcceptRequest = async (friendshipId, close) => {
    if (close) close()
    try {
      await respondFriendRequest({ friendshipId, action: "accept" }).unwrap()
    } catch {
      toast.error(t.profile?.friends?.actions?.error || "Có lỗi xảy ra")
    }
  }

  const handleDeclineRequest = async (friendshipId, close) => {
    if (close) close()
    try {
      await respondFriendRequest({ friendshipId, action: "decline" }).unwrap()
    } catch {
      toast.error(t.profile?.friends?.actions?.error || "Có lỗi xảy ra")
    }
  }

  const handleCancelRequest = async (friendshipId, close) => {
    if (close) close()
    if (!friendshipId) return
    try {
      await deleteFriendship(friendshipId).unwrap()
      toast.success(t.profile?.friends?.actions?.cancelSuccess || "Đã thu hồi lời mời")
    } catch {
      toast.error(t.profile?.friends?.actions?.error || "Có lỗi xảy ra")
    }
  }

  return {
    handleStartChat,
    handleSendRequest,
    handleFollow,
    handleUnfollow,
    handleUnfriend,
    handleAcceptRequest,
    handleDeclineRequest,
    handleCancelRequest,
  }
}

export default useFriendActions
