import React, { useState, useMemo } from "react"
import { Copy, Check, RefreshCw, AlertCircle } from "lucide-react"
import {
  useGetGroupInviteLinkQuery,
  useResetGroupInviteLinkMutation,
  useUpdateGroupInviteLinkStatusMutation,
} from "@/store/api/social/conversationsApi"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Switch from "@/shared/components/ui/inputs/Switch"
import ListItem from "@/shared/components/ui/ListItem"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import MediaViewerModal from "@/shared/components/ui/MediaViewerModal"
import { PillButton, IconButton } from "@/shared/components/ui/buttons"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

/**
 * GroupInviteLinkView — Manages group invite links in the ChatUserPanel.
 * Allows viewing, copying, toggling enabled status, resetting links, and showing QR code.
 */
const GroupInviteLinkView = ({ conversation, canManage = false }) => {
  const { t } = useLanguage()
  const conversationId = conversation?.id
  const [copied, setCopied] = useState(false)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [isQrViewerOpen, setIsQrViewerOpen] = useState(false)

  const {
    data: inviteDataResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetGroupInviteLinkQuery(conversationId, {
    skip: !conversationId,
  })

  const [resetGroupInviteLink, { isLoading: isResetting }] =
    useResetGroupInviteLinkMutation()
  const [updateGroupInviteLinkStatus, { isLoading: isUpdatingStatus }] =
    useUpdateGroupInviteLinkStatusMutation()

  const inviteCode = inviteDataResponse?.inviteCode
  const isEnabled = Boolean(inviteDataResponse?.isEnabled)

  const fullInviteUrl = useMemo(() => {
    const rawUrl = inviteDataResponse?.inviteUrl
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://catspeak.com.vn"

    if (rawUrl) {
      if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
        return rawUrl
      }
      return `${origin}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`
    }

    if (inviteCode) {
      return `${origin}/invite/${inviteCode}`
    }

    return ""
  }, [inviteDataResponse?.inviteUrl, inviteCode])

  const largeQrUrl = useMemo(() => {
    if (!fullInviteUrl) return ""
    return `https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=16&data=${encodeURIComponent(
      fullInviteUrl,
    )}`
  }, [fullInviteUrl])

  const handleCopy = async () => {
    if (!fullInviteUrl) return
    try {
      await navigator.clipboard.writeText(fullInviteUrl)
      setCopied(true)
      toast.success(
        t?.chat?.inviteLinkCopied ||
          "Đã sao chép liên kết mời vào khay nhớ tạm!",
      )
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t?.chat?.copyLinkFailed || "Không thể sao chép liên kết")
    }
  }

  const handleToggleStatus = async (targetValue) => {
    if (!conversationId || !canManage) return
    const nextVal = typeof targetValue === "boolean" ? targetValue : !isEnabled
    try {
      await updateGroupInviteLinkStatus({
        conversationId,
        isEnabled: nextVal,
      }).unwrap()
      toast.success(
        nextVal
          ? t?.chat?.inviteLinkEnabledToast || "Đã bật liên kết mời vào nhóm"
          : t?.chat?.inviteLinkDisabledToast || "Đã vô hiệu hóa liên kết mời",
      )
    } catch (err) {
      toast.error(
        t?.chat?.updateInviteStatusFailed ||
          "Không thể cập nhật trạng thái liên kết",
      )
    }
  }

  const handleResetLink = async () => {
    if (!conversationId || !canManage) return
    try {
      await resetGroupInviteLink(conversationId).unwrap()
      setIsResetConfirmOpen(false)
      toast.success(
        t?.chat?.resetInviteLinkSuccess || "Đã tạo liên kết mời mới!",
      )
    } catch (err) {
      toast.error(
        t?.chat?.resetInviteLinkFailed || "Không thể đặt lại liên kết mời",
      )
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          {/* Link & QR Skeleton */}
          <div className="space-y-4 px-4 pt-2">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="w-28 h-28 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>

            <Skeleton className="h-11 w-full rounded-md" />
          </div>

          {/* Admin Controls Skeleton */}
          {canManage && (
            <div className="pt-2">
              <div className="px-4 mb-2">
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>
              <div className="px-4 flex items-center justify-between h-14">
                <Skeleton className="h-4 w-44 rounded-md" />
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
              <div className="p-4">
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (error || !inviteDataResponse) {
    return (
      <div className="p-6 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <p className="text-sm text-secondary">
          {t?.chat?.loadInviteLinkFailed ||
            "Không thể tải liên kết mời cho nhóm này."}
        </p>
        <PillButton size="sm" variant="secondary" onClick={() => refetch()}>
          {t?.chat?.retry || t?.common?.retry || "Thử lại"}
        </PillButton>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto">
      <div className="space-y-4">
        {/* Link & QR Section */}
        <div className="space-y-4 px-4">
          {/* 1. Hero QR Code (Click to Enlarge) */}
          {isEnabled && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setIsQrViewerOpen(true)}
                title={t?.chat?.clickToEnlargeQr || "Nhấn để phóng to mã QR"}
                aria-label={t?.chat?.clickToEnlargeQr || "Enlarge QR Code"}
                className="group flex flex-col items-center gap-2 cursor-zoom-in focus:outline-none"
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${encodeURIComponent(
                    fullInviteUrl,
                  )}`}
                  alt="QR Code"
                  className="w-28 h-28 block"
                  loading="lazy"
                />
                <span className="text-xs text-secondary">
                  {t?.chat?.clickToEnlargeQr || "Nhấn để phóng to mã QR"}
                </span>
              </button>
            </div>
          )}

          {/* TextInput with Copy Button */}
          <div className="space-y-1">
            <TextInput
              readOnly
              value={
                isEnabled
                  ? fullInviteUrl
                  : t?.chat?.inviteLinkDisabled || "Liên kết đã bị vô hiệu hóa"
              }
              containerClassName="w-full"
              variant="square"
              className="hover:!border-border focus:!border-border select-all"
              rightContentClassName="right-1"
              rightContentWidthClass="!pr-14"
              rightContent={
                isEnabled && (
                  <IconButton
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    title={t?.chat?.copyLink || "Sao chép liên kết"}
                    aria-label={t?.chat?.copyLink || "Copy Link"}
                  >
                    {copied ? <Check className="text-emerald-500" /> : <Copy />}
                  </IconButton>
                )
              }
            />

            {/* Helper notice for non-managers when invite link is disabled */}
            {!isEnabled && !canManage && (
              <p className="text-xs text-secondary px-4">
                {t?.chat?.askAdminToEnableInvite ||
                  "Liên kết mời đang bị tắt. Bạn có thể nhờ quản trị viên hoặc trưởng nhóm bật lại."}
              </p>
            )}
          </div>
        </div>

        {/* Admin Controls */}
        {canManage && (
          <div>
            <div className="px-4 mb-1 select-none">
              <h4 className="text-xs text-secondary">
                {t?.chat?.adminSettings || "Cài đặt quản trị viên"}
              </h4>
            </div>

            {/* Toggle Enable/Disable Switch */}
            <ListItem
              lines="1"
              hoverEffect={true}
              onClick={() => {
                if (!isUpdatingStatus) {
                  handleToggleStatus(!isEnabled)
                }
              }}
              rightContent={
                <div onClick={(e) => e.stopPropagation()}>
                  <Switch
                    size="sm"
                    checked={isEnabled}
                    disabled={isUpdatingStatus}
                    onChange={(e) => handleToggleStatus(e.target.checked)}
                  />
                </div>
              }
            >
              <span>
                {t?.chat?.allowJoinViaLink || "Cho phép tham gia qua liên kết"}
              </span>
            </ListItem>

            {/* Reset Invite Link Button */}
            <div className="p-4">
              <PillButton
                variant="outline"
                disabled={isResetting}
                onClick={() => setIsResetConfirmOpen(true)}
                className="w-full"
                startIcon={
                  <RefreshCw
                    size={20}
                    className={isResetting ? "animate-spin" : ""}
                  />
                }
              >
                {t?.chat?.generateNewLink || "Tạo liên kết mới"}
              </PillButton>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        open={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetLink}
        title={t?.chat?.resetInviteLinkModalTitle || "Đặt lại liên kết mời?"}
        message={
          t?.chat?.resetInviteLinkModalDesc ||
          "Liên kết mời hiện tại sẽ lập tức hết hạn. Bất kỳ ai cố gắng tham gia bằng liên kết cũ sẽ không thể vào nhóm được nữa."
        }
        confirmText={t?.chat?.resetInviteLinkConfirm || "Đặt lại liên kết"}
        cancelText={t?.common?.cancel || t?.chat?.cancel || "Hủy"}
        variant="danger"
        isLoading={isResetting}
      />

      {/* Fullscreen Enlarge QR Modal */}
      {isQrViewerOpen && largeQrUrl && (
        <MediaViewerModal
          media={{
            mediaUrl: largeQrUrl,
            fileName: `QR Code — ${conversation?.name || t?.chat?.unnamedGroup || "CatSpeak Group"}`,
            mediaType: "Image",
          }}
          onClose={() => setIsQrViewerOpen(false)}
        />
      )}
    </div>
  )
}

export default GroupInviteLinkView
