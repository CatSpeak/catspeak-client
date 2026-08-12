// Nút gửi yêu cầu kết bạn

import React, { useState, useRef, useEffect, useMemo } from "react"
import toast from "react-hot-toast"
import { UserPlus, UserMinus } from "lucide-react"
import PillButton from "./PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import {
  useSendFriendRequestMutation,
  useDeleteFriendshipMutation,
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

  // External relationship object/props
  const externalStatus = useMemo(() => {
    const raw = relationship !== undefined ? relationship : status
    if (raw && typeof raw === "object") {
      return {
        isFriend: raw.isFriend ?? raw.data?.isFriend ?? false,
        friendshipStatus:
          raw.friendshipStatus ?? raw.data?.friendshipStatus ?? null,
        friendshipId: raw.friendshipId ?? raw.data?.friendshipId ?? null,
      }
    }
    return {
      isFriend: isFriendProp ?? false,
      friendshipStatus: friendshipStatusProp ?? null,
      friendshipId: friendshipIdProp ?? null,
    }
  }, [relationship, status, isFriendProp, friendshipStatusProp, friendshipIdProp])

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

  // Cooldown mechanism
  const [isFriendCooldown, setIsFriendCooldown] = useState(false)
  const cooldownTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current)
      }
    }
  }, [])

  const isFriendshipLoading = isSendingRequest || isDeletingFriendship
  const isFriendshipDisabled =
    disabled || isFriendshipLoading || isFriendCooldown

  // Relationship state determination
  const isFriendOrPending = Boolean(
    effectiveStatus?.isFriend ||
      effectiveStatus?.friendshipStatus === 1 ||
      effectiveStatus?.friendshipStatus === "Pending" ||
      effectiveStatus?.friendshipStatus === "PENDING"
  )

  const handleFriendshipToggle = async (e) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation()
    }
    if (isFriendshipDisabled || !targetId) return

    // Start 3-second cooldown immediately
    setIsFriendCooldown(true)
    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current)
    }
    cooldownTimeoutRef.current = setTimeout(() => {
      setIsFriendCooldown(false)
    }, 3000)

    try {
      if (isFriendOrPending) {
        const fId = effectiveStatus?.friendshipId
        if (fId) {
          await deleteFriendship(fId).unwrap()
          const isFriendNow = Boolean(effectiveStatus?.isFriend)
          setLocalStatus({
            isFriend: false,
            friendshipStatus: null,
            friendshipId: null,
          })
          toast.success(
            isFriendNow
              ? t.profile?.social?.unfriendSuccess || "Đã hủy kết bạn"
              : t.profile?.social?.cancelRequestSuccess ||
                  "Đã hủy yêu cầu kết bạn",
            { id: "friendship-action" }
          )
        } else {
          // If no friendshipId available, attempt request with targetId if delete fails or fallback
          setLocalStatus({
            isFriend: false,
            friendshipStatus: null,
            friendshipId: null,
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

  // If user is viewing their own profile or invalid ID, do not render
  if (isSelf || !targetId) {
    return null
  }

  const friendshipVariant = effectiveStatus?.isFriend
    ? "outline"
    : isFriendOrPending
    ? "secondary"
    : "outline"

  const friendshipIcon = isFriendOrPending ? <UserMinus /> : <UserPlus />

  const friendshipLabel = effectiveStatus?.isFriend
    ? t.profile?.social?.unfriend || "Hủy kết bạn"
    : isFriendOrPending
    ? t.profile?.social?.cancelRequest || "Hủy yêu cầu"
    : t.profile?.social?.addFriend || "Kết bạn"

  const sizeClasses =
    size === "sm" || size === "compact"
      ? "!h-8 [&>div]:!h-7 [&>div]:px-2.5 [&>div]:text-xs [&>div_span]:w-3.5 [&>div_span]:h-3.5"
      : ""

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
