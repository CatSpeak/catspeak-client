import React, { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { AlertTriangle } from "lucide-react"
import {
  usePreviewGroupInviteQuery,
  useJoinGroupViaInviteMutation,
} from "@/store/api/social/conversationsApi"
import { useAuth } from "@/features/auth"
import Avatar from "@/shared/components/ui/Avatar"
import { PillButton } from "@/shared/components/ui/buttons"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import Logo from "@/shared/assets/icons/logo/logo.svg"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

export const GroupInviteSkeleton = () => (
  <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-white to-[#FFBBC3] text-textColor px-4">
    {/* Logo */}
    <div className="absolute top-4 left-5 z-10">
      <img
        src={Logo}
        alt="Cat Speak Logo"
        className="sm:h-12 h-9 w-auto object-contain"
      />
    </div>

    <div className="relative z-10 w-full max-w-md p-4 rounded-xl bg-white border border-border shadow-xl text-center space-y-4">
      {/* Avatar Skeleton */}
      <div className="flex justify-center">
        <Skeleton className="w-24 h-24 rounded-full" />
      </div>

      {/* Badge, Title & Member count */}
      <div>
        <Skeleton className="h-4 w-32 rounded-md mx-auto mb-2" />
        <Skeleton className="h-8 w-48 rounded-md mx-auto mb-1" />
        <Skeleton className="h-4 w-24 rounded-md mx-auto" />
      </div>

      {/* Button */}
      <div className="pt-2">
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
    </div>
  </div>
)

/**
 * GroupInvitePage — Public group invite preview & join page.
 * Accessible without authentication (public preview).
 * Prompts user to join or log in to participate in the conversation.
 */
const GroupInvitePage = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()

  const {
    data: previewResponse,
    isLoading,
    isSuccess,
    isError,
    refetch,
  } = usePreviewGroupInviteQuery(code, {
    skip: !code,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })

  const [hasFailed, setHasFailed] = useState(false)

  // Reset failure state if the invite code changes in URL
  useEffect(() => {
    setHasFailed(false)
  }, [code])

  // Latch invalid state so background refetches never flash stale cached data
  useEffect(() => {
    if (isError || (previewResponse && previewResponse.isValid === false)) {
      setHasFailed(true)
    } else if (isSuccess && previewResponse && previewResponse.isValid !== false) {
      setHasFailed(false)
    }
  }, [isError, isSuccess, previewResponse])

  const [joinGroupViaInvite, { isLoading: isJoining }] =
    useJoinGroupViaInviteMutation()

  const preview = previewResponse

  const location = useLocation()

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate("/", {
        state: {
          requireLogin: true,
          redirectTo: location.pathname + location.search,
        },
      })
      return
    }

    try {
      const res = await joinGroupViaInvite(code).unwrap()
      const targetConvId = res?.conversationId || preview?.conversationId
      navigate(targetConvId ? `/chat/${targetConvId}` : "/chat")
    } catch (err) {
      console.error("Failed to join group via invite code:", err)
      refetch()
      toast.error(
        err?.data?.message ||
          t?.chat?.joinGroupFailed ||
          "Không thể tham gia nhóm. Vui lòng thử lại sau.",
      )
    }
  }

  const handleGoToChat = () => {
    if (preview?.conversationId) {
      navigate(`/chat/${preview.conversationId}`)
    } else {
      navigate("/chat")
    }
  }

  if (isLoading) {
    return <GroupInviteSkeleton />
  }

  const isInvalid =
    hasFailed || isError || !preview || preview.isValid === false

  if (isInvalid) {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-white to-[#FFBBC3] text-textColor px-4">
        {/* Logo */}
        <div className="absolute top-4 left-5 z-10">
          <img
            src={Logo}
            alt="Cat Speak Logo"
            className="sm:h-12 h-9 w-auto object-contain cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>

        <div className="relative z-10 w-full max-w-md p-4 rounded-xl bg-white border border-border shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold">
              {t?.chat?.inviteExpiredTitle || "Liên kết mời không khả dụng"}
            </h2>
            <p className="text-sm text-secondary">
              {t?.chat?.inviteExpiredDesc ||
                "Liên kết mời này đã hết hạn hoặc tính năng chia sẻ liên kết đã bị tắt. Vui lòng liên hệ quản trị viên nhóm để nhận liên kết mới hoặc yêu cầu mở lại."}
            </p>
          </div>

          <PillButton
            variant="primary"
            onClick={() => navigate("/")}
            className="w-full justify-center"
          >
            {t?.common?.backToHome || "Về trang chủ"}
          </PillButton>
        </div>
      </div>
    )
  }

  const groupName =
    preview.groupName || t?.chat?.unnamedGroup || "Nhóm trò chuyện"
  const memberCount = preview.memberCount || 0
  const isAlreadyMember = Boolean(preview.isAlreadyMember)

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-white to-[#FFBBC3] text-textColor px-4">
      {/* Logo */}
      <div className="absolute top-4 left-5 z-10">
        <img
          src={Logo}
          alt="Cat Speak Logo"
          className="sm:h-12 h-9 w-auto object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      <div className="relative z-10 w-full max-w-md p-4 rounded-xl bg-white border border-border shadow-xl text-center space-y-4">
        {/* Group Avatar */}
        <div className="flex justify-center">
          <Avatar size={96} name={groupName} src={preview.groupAvatar} />
        </div>

        {/* Group Details */}
        <div>
          <span className="text-sm text-secondary">
            {t?.chat?.groupInviteBadge || "Lời mời tham gia nhóm"}
          </span>

          <h1 className="text-2xl font-bold mb-1">{groupName}</h1>

          <p className="text-sm text-secondary">
            {t?.chat?.memberCount
              ? t.chat.memberCount.replace("{{count}}", memberCount)
              : `${memberCount} thành viên`}
          </p>
        </div>

        {/* Action Button */}
        <div>
          {isAlreadyMember ? (
            <PillButton
              variant="primary"
              onClick={handleGoToChat}
              className="w-full justify-center"
            >
              {t?.chat?.goToConversation || "Vào cuộc trò chuyện"}
            </PillButton>
          ) : isAuthenticated ? (
            <PillButton
              variant="primary"
              disabled={isJoining}
              loading={isJoining}
              onClick={handleJoin}
              className="w-full justify-center"
            >
              {t?.chat?.joinGroupAction || "Tham gia nhóm"}
            </PillButton>
          ) : (
            <PillButton
              variant="primary"
              onClick={handleJoin}
              className="w-full justify-center"
            >
              {t?.chat?.loginToJoin || "Đăng nhập để tham gia"}
            </PillButton>
          )}

          <PillButton
            variant="secondary-no-outline"
            textColor="#990011"
            onClick={() => navigate("/")}
            className="w-full justify-center"
          >
            {t?.common?.backToHome || "Về trang chủ"}
          </PillButton>
        </div>
      </div>
    </div>
  )
}

export default GroupInvitePage
