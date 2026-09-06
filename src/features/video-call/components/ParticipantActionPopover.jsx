import React, { useState, useEffect } from "react"
import { MoreVertical, Volume2, VolumeX, MicOff, VideoOff, UserX, MonitorUp, Shield } from "lucide-react"
import { toast } from "react-hot-toast"
import Popover from "@/shared/components/ui/Popover"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import Slider from "@/shared/components/ui/Slider"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import {
  useKickParticipantMutation,
  useMuteParticipantMutation,
  useGetRoomCoHostQuery,
  useAssignRoomCoHostMutation,
  useUpdateRoomCoHostMutation,
  useRevokeRoomCoHostMutation,
} from "@/store/api/roomsApi"
import CoHostModal from "@/features/co-host/CoHostModal"
import {
  normalizeCoHost,
  hasCoHostPermission,
  CO_HOST_PERMISSIONS,
} from "@/features/co-host/constants"
import { resolveCoHostErrorMessage } from "@/features/co-host/errors"

export const ParticipantVolumeSlider = ({ participant, className = "", isInline = false }) => {
  const { t } = useLanguage()
  const pl = t.rooms.videoCall.participantList

  // Volume is 0 → 1
  const [volume, setVolume] = useState(1)
  const [prevVolume, setPrevVolume] = useState(1)

  // Initial load from participant
  useEffect(() => {
    if (!participant || participant.isLocal) return
    if (typeof participant.getVolume === "function") {
      let v = participant.getVolume()
      if (typeof v !== "number" || isNaN(v)) {
        v = 1
      }
      setVolume(v)
      if (v > 0) setPrevVolume(v)
    }
  }, [participant])

  const handleVolumeChange = (eOrVal) => {
    const val =
      typeof eOrVal === "object" && eOrVal !== null && "target" in eOrVal
        ? parseFloat(eOrVal.target.value)
        : Array.isArray(eOrVal)
        ? eOrVal[0]
        : Number(eOrVal)

    if (isNaN(val)) return
    setVolume(val)
    if (val > 0) setPrevVolume(val)

    if (participant && typeof participant.setVolume === "function") {
      participant.setVolume(val)
    }
  }

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume)
      handleVolumeChange(0)
    } else {
      handleVolumeChange(prevVolume || 1)
    }
  }

  const formatPercent = (val) => Math.round(val * 100)

  if (isInline) {
    return (
      <div className={`flex items-center gap-3 py-2 px-2 ${className}`}>
        <button
          type="button"
          onClick={toggleMute}
          className="text-gray-500 hover:text-gray-900 transition-colors shrink-0"
          title={volume === 0 ? pl.unmute : pl.mute}
        >
          {volume === 0 ? (
            <VolumeX size={20} className="text-red-500" />
          ) : (
            <Volume2 size={20} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <Slider
            value={volume}
            min={0}
            max={1}
            step={0.01}
            onChange={handleVolumeChange}
            onValueChange={handleVolumeChange}
            aria-label={pl.adjustVolume}
          />
        </div>
        <span className="text-sm font-semibold text-gray-700 w-11 text-right tabular-nums shrink-0">
          {formatPercent(volume)}%
        </span>
      </div>
    )
  }

  return (
    <div className={`p-3 w-60 flex flex-col gap-2 bg-white rounded-xl ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {pl.volume}
        </span>
        <span className="text-sm font-bold text-gray-900">
          {formatPercent(volume)}%
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMute}
          className="text-gray-500 hover:text-gray-900 transition-colors"
          title={volume === 0 ? pl.unmute : pl.mute}
        >
          {volume === 0 ? (
            <VolumeX size={20} className="text-red-500" />
          ) : (
            <Volume2 size={20} />
          )}
        </button>
        <div className="flex-1">
          <Slider
            value={volume}
            min={0}
            max={1}
            step={0.01}
            onChange={handleVolumeChange}
            onValueChange={handleVolumeChange}
            aria-label={pl.adjustVolume}
          />
        </div>
      </div>
    </div>
  )
}

export const ParticipantActionPopover = ({ participant, children }) => {
  const { t } = useLanguage()
  const pl = t.rooms?.videoCall?.participantList || {}
  const { room, user, id: roomId, lkRoom, isHost: isCurrentHostFromContext } = useVideoCallContext()
  const isCurrentHost = isCurrentHostFromContext || isRoomHost(room, user?.accountId)

  const [kickParticipant, { isLoading: isKicking }] = useKickParticipantMutation()
  const [muteParticipant, { isLoading: isMuting }] = useMuteParticipantMutation()

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }

  const meta = parseMetadata(participant?.metadata)
  const targetAccountId = meta.accountId || participant?.identity

  // ── Co-host in-live (ticket 01): host phân công / thay thế ngay trong live ──
  // Ticket 02: fetch cho mọi thành viên để co-host biết quyền media của mình.
  const [coHostModalOpen, setCoHostModalOpen] = useState(false)
  const { data: liveCoHostData } = useGetRoomCoHostQuery(roomId, {
    skip: !roomId,
  })
  const [assignRoomCoHost, { isLoading: isAssigningCoHost }] =
    useAssignRoomCoHostMutation()
  const [updateRoomCoHost, { isLoading: isUpdatingCoHost }] =
    useUpdateRoomCoHostMutation()
  const [revokeRoomCoHost, { isLoading: isRevokingCoHost }] =
    useRevokeRoomCoHostMutation()
  const [revokeCoHostConfirm, setRevokeCoHostConfirm] = useState(false)
  const liveCoHost = normalizeCoHost(liveCoHostData)
  const isTargetCoHost =
    liveCoHost?.coHostAccountId != null &&
    targetAccountId != null &&
    String(liveCoHost.coHostAccountId) === String(targetAccountId)

  // Ticket 02: quyền media của chính mình (host bypass, co-host theo từng quyền con).
  const canToggleMic =
    isCurrentHost ||
    hasCoHostPermission(liveCoHost, user?.accountId, CO_HOST_PERMISSIONS.MIC_TOGGLE)
  const canToggleCam =
    isCurrentHost ||
    hasCoHostPermission(liveCoHost, user?.accountId, CO_HOST_PERMISSIONS.CAMERA_TOGGLE)
  const canModerateMedia = canToggleMic || canToggleCam

  // Ticket 03: co-host with remove_student kicks from live (kick-only, no ban).
  const canKick =
    isCurrentHost ||
    hasCoHostPermission(liveCoHost, user?.accountId, CO_HOST_PERMISSIONS.REMOVE_STUDENT)

  const [kickConfirm, setKickConfirm] = React.useState({ open: false, banRejoin: false })

  if (participant?.isLocal) return <>{children}</>

  const handleMuteTrack = async (trackKind, muted = true) => {
    if (!roomId) return
    try {
      await muteParticipant({
        id: roomId,
        targetAccountId: Number(targetAccountId),
        trackKind,
        muted,
      }).unwrap()
    } catch (err) {
      console.warn("Backend mute API response:", err)
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenMedia || "Bạn không có quyền điều khiển mic/camera."
        )
      )
      return
    }

    if (lkRoom?.localParticipant) {
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({
            action: "MUTE_PARTICIPANT",
            targetId: String(targetAccountId),
            targetIdentity: String(participant.identity),
            trackKind,
            muted,
            senderId: String(user?.accountId ?? ""),
            senderIdentity: String(lkRoom.localParticipant.identity ?? ""),
          })
        )
        lkRoom.localParticipant.publishData(payload, {
          topic: "moderation",
          reliable: true,
        })
      } catch (e) {
        console.error("Failed to broadcast mute packet:", e)
      }
    }

    if (muted) {
      toast.success(
        trackKind === "audio"
          ? (pl.successMuteMic || "Đã tắt mic người dùng")
          : trackKind === "screen"
          ? (pl.successStopScreen || "Đã dừng chia sẻ màn hình người dùng")
          : (pl.successMuteCam || "Đã tắt camera người dùng")
      )
    } else {
      toast.success(
        trackKind === "audio"
          ? (pl.successUnmuteMic || "Đã bật mic người dùng")
          : (pl.successUnmuteCam || "Đã bật camera người dùng")
      )
    }
  }

  const isTargetMicOn = participant?.isMicrophoneEnabled ?? true
  const isTargetCamOn = participant?.isCameraEnabled ?? true

  const handleKick = (banRejoin = false) => {
    setKickConfirm({ open: true, banRejoin })
  }

  const confirmKick = async () => {
    const banRejoin = kickConfirm.banRejoin
    setKickConfirm({ open: false, banRejoin: false })
    if (!roomId) return
    try {
      await kickParticipant({
        id: roomId,
        targetAccountId: Number(targetAccountId),
        participantId: Number(targetAccountId),
        banRejoin,
      }).unwrap()
    } catch (err) {
      console.warn("Backend kick API response:", err)
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenKick || "Bạn không có quyền mời thành viên ra khỏi phòng."
        )
      )
      return
    }

    if (lkRoom?.localParticipant) {
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({
            action: "KICK_PARTICIPANT",
            targetId: String(targetAccountId),
            targetIdentity: String(participant.identity),
            banRejoin,
          })
        )
        lkRoom.localParticipant.publishData(payload, {
          topic: "moderation",
          reliable: true,
        })
      } catch (e) {
        console.error("Failed to broadcast kick packet:", e)
      }
    }

    toast.success(banRejoin ? (pl.successBan || "Đã mời người dùng ra khỏi phòng và cấm vào lại") : (pl.successKick || "Đã mời người dùng ra khỏi phòng"))
  }


  const popoverContent = (
    <div className="bg-white rounded-xl shadow-lg border border-neutral-200/80 p-3 w-72 flex flex-col gap-2">
      <ParticipantVolumeSlider participant={participant} isInline />

      {canModerateMedia && (
        <div className="border-t border-neutral-100 pt-2 flex flex-col gap-1">
          {canToggleMic && (
            <button
              onClick={() => handleMuteTrack("audio", isTargetMicOn)}
              disabled={isMuting}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-left w-full disabled:opacity-50"
            >
              <MicOff size={18} className="text-neutral-500 shrink-0" />
              <span>
                {isTargetMicOn
                  ? (pl.mute || "Tắt tiếng")
                  : (pl.unmute || "Bật mic giùm")}
              </span>
            </button>
          )}

          {canToggleCam && (
            <button
              onClick={() => handleMuteTrack("video", isTargetCamOn)}
              disabled={isMuting}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-left w-full disabled:opacity-50"
            >
              <VideoOff size={18} className="text-neutral-500 shrink-0" />
              <span>
                {isTargetCamOn
                  ? (pl.muteCam || "Tắt camera")
                  : (pl.unmuteCam || "Bật camera giùm")}
              </span>
            </button>
          )}
        </div>
      )}

      {isCurrentHost && (
        <div className="border-t border-neutral-100 pt-2 flex flex-col gap-1">
          <button
            onClick={() => handleMuteTrack("screen", true)}
            disabled={isMuting}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors text-left w-full disabled:opacity-50"
          >
            <MonitorUp size={18} className="text-neutral-500 shrink-0" />
            <span>{pl.stopScreenShare || "Dừng chia sẻ màn hình"}</span>
          </button>

          <button
            onClick={() => handleKick(false)}
            disabled={isKicking}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left w-full disabled:opacity-50"
          >
            <UserX size={18} className="text-red-500 shrink-0" />
            <span>{pl.kick || "Mời ra khỏi phòng"}</span>
          </button>

          <button
            onClick={() => handleKick(true)}
            disabled={isKicking}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left w-full disabled:opacity-50"
          >
            <UserX size={18} className="text-red-600 shrink-0" />
            <span>{pl.ban || "Xóa & Cấm vào lại"}</span>
          </button>

          <button
            onClick={() => setCoHostModalOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-lg transition-colors text-left w-full"
          >
            <Shield size={18} className="text-amber-600 shrink-0" />
            <span>
              {isTargetCoHost ? "Quản lý co-host" : "Phân công làm Co-host"}
            </span>
          </button>

          {isTargetCoHost && (
            <button
              onClick={() => setRevokeCoHostConfirm(true)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left w-full"
            >
              <UserX size={18} className="text-red-500 shrink-0" />
              <span>Gỡ co-host</span>
            </button>
          )}
        </div>
      )}

      {/* Ticket 03: co-host with remove_student sees kick-only (no ban, no screen-stop). */}
      {!isCurrentHost && canKick && (
        <div className="border-t border-neutral-100 pt-2 flex flex-col gap-1">
          <button
            onClick={() => handleKick(false)}
            disabled={isKicking}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left w-full disabled:opacity-50"
          >
            <UserX size={18} className="text-red-500 shrink-0" />
            <span>{pl.kick || "Mời ra khỏi phòng"}</span>
          </button>
        </div>
      )}
    </div>
  )

  return (<>
    <Popover
      className="w-full"
      triggerClassName="w-full text-left"
      trigger={
        <div className="w-full text-left cursor-pointer focus:outline-none">
          {children}
        </div>
      }
      content={popoverContent}
      placement="bottom-right"
    />

    <ConfirmationModal
      open={kickConfirm.open}
      onClose={() => setKickConfirm({ open: false, banRejoin: false })}
      onConfirm={confirmKick}
      title={kickConfirm.banRejoin ? (pl.confirmBanTitle || "Xóa & Cấm vào lại") : (pl.confirmKickTitle || "Mời ra khỏi phòng")}
      message={kickConfirm.banRejoin ? (pl.confirmBan || "Bạn có chắc chắn muốn mời người dùng ra khỏi phòng và CẤM VÀO LẠI?") : (pl.confirmKick || "Bạn có chắc chắn muốn mời người dùng ra khỏi phòng?")}
      confirmText={kickConfirm.banRejoin ? (pl.ban || "Xóa & Cấm vào lại") : (pl.kick || "Mời ra khỏi phòng")}
      confirmVariant="destructive"
      isPending={isKicking}
    />

    {/* Revoke trong live cũng cần confirm riêng */}
    <ConfirmationModal
      open={revokeCoHostConfirm}
      onClose={() => setRevokeCoHostConfirm(false)}
      onConfirm={async () => {
        try {
          await revokeRoomCoHost(roomId).unwrap()
          toast.success("Đã gỡ phân công co-host.")
          setRevokeCoHostConfirm(false)
        } catch (err) {
          toast.error(
            resolveCoHostErrorMessage(
              err,
              t,
              err?.data?.message || "Không thể gỡ co-host. Vui lòng thử lại.",
            ),
          )
        }
      }}
      title="Xác nhận gỡ co-host"
      message="Bạn có chắc muốn gỡ phân công co-host này? Hành động này không thể hoàn tác."
      cancelText="Hủy"
      confirmText="Xóa"
      confirmVariant="destructive"
      isPending={isRevokingCoHost}
    />

    {coHostModalOpen && (
      <CoHostModal
        open={coHostModalOpen}
        onClose={() => setCoHostModalOpen(false)}
        title="Phân công Co-host"
        candidates={[
          {
            accountId: Number(targetAccountId),
            name: participant?.name || meta?.name || String(targetAccountId),
            email: "",
            badge:
              liveCoHost?.coHostAccountId != null &&
              String(liveCoHost.coHostAccountId) === String(targetAccountId)
                ? "Co-host"
                : undefined,
          },
        ]}
        initialAccountId={Number(targetAccountId)}
        initialPermissions={
          liveCoHost?.coHostAccountId != null &&
          String(liveCoHost.coHostAccountId) === String(targetAccountId)
            ? (liveCoHost.permissions ?? [])
            : []
        }
        confirmLabel="Phân công Co-host"
        isSaving={isAssigningCoHost || isUpdatingCoHost}
        onSubmit={async ({ coHostAccountId, permissions }) => {
          try {
            const samePerson =
              liveCoHost?.coHostAccountId != null &&
              String(liveCoHost.coHostAccountId) === String(coHostAccountId)
            if (samePerson) {
              await updateRoomCoHost({ id: roomId, permissions }).unwrap()
              toast.success("Đã cập nhật quyền co-host.")
            } else {
              await assignRoomCoHost({
                id: roomId,
                coHostAccountId: Number(coHostAccountId),
                permissions,
              }).unwrap()
              toast.success("Đã phân công co-host.")
            }
            setCoHostModalOpen(false)
          } catch (err) {
            toast.error(
              resolveCoHostErrorMessage(
                err,
                t,
                err?.data?.message ||
                  "Không thể phân công co-host. Vui lòng thử lại.",
              ),
            )
          }
        }}
      />
    )}
  </>)
}

