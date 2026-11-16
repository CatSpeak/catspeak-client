import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import {
  MoreVertical,
  Volume2,
  VolumeX,
  MicOff,
  VideoOff,
  Video,
  UserX,
  MonitorUp,
  Shield,
  MessageSquareOff,
  Mic,
  User,
} from "lucide-react"
import MenuItem from "@/shared/components/ui/MenuItem"
import { toast } from "react-hot-toast"
import Popover from "@/shared/components/ui/Popover"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import Slider from "@/shared/components/ui/Slider"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost, isClassOrCustom } from "@/features/video-call/utils/roomTypeHelpers"
import { selectCurrentUser } from "@/store/slices/authSlice"
import {
  getSavedParticipantVolume,
  saveParticipantVolume,
} from "@/features/video-call/utils/participantVolumePreferences"
import {
  useKickParticipantMutation,
  useMuteParticipantMutation,
  useGetRoomCoHostQuery,
  useAssignRoomCoHostMutation,
  useUpdateRoomCoHostMutation,
  useRevokeRoomCoHostMutation,
  useRestrictChatMutation,
  useUnrestrictChatMutation,
  useRestrictVoiceMutation,
  useUnrestrictVoiceMutation,
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
  const currentUser = useSelector(selectCurrentUser)
  const myAccountId = currentUser?.accountId

  // Volume is 0 → 1
  const [volume, setVolume] = useState(() => {
    const saved = getSavedParticipantVolume(participant, myAccountId)
    if (typeof saved === "number" && !isNaN(saved)) return saved
    if (participant && typeof participant.getVolume === "function") {
      const v = participant.getVolume()
      if (typeof v === "number" && !isNaN(v)) return v
    }
    return 1
  })
  const [prevVolume, setPrevVolume] = useState(() => (volume > 0 ? volume : 1))

  // Initial load from participant / storage
  useEffect(() => {
    if (!participant || participant.isLocal) return
    const saved = getSavedParticipantVolume(participant, myAccountId)
    if (typeof saved === "number" && !isNaN(saved)) {
      setVolume(saved)
      if (saved > 0) setPrevVolume(saved)
      if (typeof participant.setVolume === "function") {
        participant.setVolume(saved)
      }
      return
    }

    if (typeof participant.getVolume === "function") {
      let v = participant.getVolume()
      if (typeof v !== "number" || isNaN(v)) {
        v = 1
      }
      setVolume(v)
      if (v > 0) setPrevVolume(v)
    }
  }, [participant, myAccountId])

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
    saveParticipantVolume(participant, val, myAccountId)
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
      <div className={`flex items-center gap-3 py-1.5 px-4 ${className}`}>
        <button
          type="button"
          onClick={toggleMute}
          className="text-gray-500 dark:text-[#AAAAAA] hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
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
        <span className="text-sm font-semibold text-gray-700 dark:text-neutral-200 w-11 text-right tabular-nums shrink-0">
          {formatPercent(volume)}%
        </span>
      </div>
    )
  }

  return (
    <div className={`p-3 w-60 flex flex-col gap-2 bg-white dark:bg-[#1A1A1A] rounded-xl text-foreground dark:text-white border border-border dark:border-[#3F3F3F] ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
          {pl.volume}
        </span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {formatPercent(volume)}%
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMute}
          className="text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
  const {
    room,
    user,
    id: roomId,
    lkRoom,
    isHost: isCurrentHostFromContext,
    restrictionByAccountId,
  } = useVideoCallContext()
  const isCurrentHost = isCurrentHostFromContext || isRoomHost(room, user?.accountId)
  const [popoverOpen, setPopoverOpen] = useState(false)

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
  const targetAccountId =
    meta.accountId || (participant?.isLocal ? user?.accountId : null) || participant?.identity
  const isTargetSelf = Boolean(
    participant?.isLocal ||
      (user?.accountId && targetAccountId && String(user.accountId) === String(targetAccountId)),
  )
  const participantName =
    participant?.name || participant?.identity || String(targetAccountId ?? "")

  // Ticket 02: only offer the action that matches the target's current state,
  // so "restrict" does not sit next to "unrestrict" for the same channel.
  const targetRestriction = targetAccountId != null
    ? restrictionByAccountId?.[String(targetAccountId)] || {}
    : {}
  const isTargetChatRestricted = targetRestriction.isChatRestricted === true
  const isTargetVoiceRestricted = targetRestriction.isVoiceRestricted === true

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

  // Stopping an ongoing member share has its own code; manage_student_share is
  // only the "allow members to share" policy.
  const canStopScreen =
    isCurrentHost ||
    hasCoHostPermission(
      liveCoHost,
      user?.accountId,
      CO_HOST_PERMISSIONS.STOP_MEMBER_SHARE
    )

  const [kickConfirm, setKickConfirm] = React.useState({ open: false, banRejoin: false })

  // Restrict chat and restrict voice are separate codes; mute_all/remove_student
  // no longer imply either.
  const canRestrictChat =
    isCurrentHost ||
    hasCoHostPermission(liveCoHost, user?.accountId, CO_HOST_PERMISSIONS.RESTRICT_CHAT)
  const canRestrictVoice =
    isCurrentHost ||
    hasCoHostPermission(liveCoHost, user?.accountId, CO_HOST_PERMISSIONS.RESTRICT_VOICE)
  const [restrictChatApi, { isLoading: isRestrictingChat }] = useRestrictChatMutation()
  const [unrestrictChatApi, { isLoading: isUnrestrictingChat }] = useUnrestrictChatMutation()
  const [restrictVoiceApi, { isLoading: isRestrictingVoice }] = useRestrictVoiceMutation()
  const [unrestrictVoiceApi, { isLoading: isUnrestrictingVoice }] = useUnrestrictVoiceMutation()
  const [restrictConfirm, setRestrictConfirm] = React.useState({ open: false, type: null })

  const handleRestrict = async (type) => {
    if (!roomId || !targetAccountId) return
    const idNum = Number(targetAccountId)
    try {
      if (type === "chat") await restrictChatApi({ id: roomId, targetAccountId: idNum }).unwrap()
      else if (type === "voice") await restrictVoiceApi({ id: roomId, targetAccountId: idNum }).unwrap()
      else if (type === "unrestrict_chat") await unrestrictChatApi({ id: roomId, targetAccountId: idNum }).unwrap()
      else if (type === "unrestrict_voice") await unrestrictVoiceApi({ id: roomId, targetAccountId: idNum }).unwrap()
      const msgMap = {
        chat: pl.successRestrictChat,
        voice: pl.successRestrictVoice,
        unrestrict_chat: pl.successUnrestrictChat,
        unrestrict_voice: pl.successUnrestrictVoice,
      }
      toast.success(msgMap[type])
    } catch (err) {
      if (err?.status === 404) {
        toast.error(pl.participantNotFound)
      } else if (err?.status === 409) {
        toast.error(err?.data?.message || pl.alreadyRestricted)
      } else {
        toast.error(resolveCoHostErrorMessage(err, t, pl.forbiddenModerate))
      }
    }
  }

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
          trackKind === "screen"
            ? pl.forbiddenStopScreen
            : pl.forbiddenMedia
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
          ? pl.successMuteMic
          : trackKind === "screen"
          ? pl.successStopScreen
          : pl.successMuteCam
      )
    } else {
      toast.success(
        trackKind === "audio"
          ? pl.successUnmuteMic
          : pl.successUnmuteCam
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
          pl.forbiddenKick
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

    toast.success(banRejoin ? pl.successBan : pl.successKick)
  }

  const popoverContent = isTargetSelf ? (
    <div className="w-64 md:w-72 flex flex-col py-[2px] bg-white dark:bg-[#1A1A1A] rounded-xl border border-border dark:border-[#3F3F3F] shadow-lg text-foreground dark:text-white overflow-hidden">
      {targetAccountId && (
        <MenuItem
          onClick={() => {
            setPopoverOpen(false)
            window.open(`/workspace/profile/${targetAccountId}`, "_blank")
          }}
          icon={<User size={20} />}
          label={pl.viewProfile || "Xem hồ sơ"}
        />
      )}
    </div>
  ) : (
    <div className="w-64 md:w-72 flex flex-col py-[2px] bg-white dark:bg-[#1A1A1A] rounded-xl border border-border dark:border-[#3F3F3F] shadow-lg text-foreground dark:text-white overflow-hidden">
      {targetAccountId && (
        <MenuItem
          onClick={() => {
            setPopoverOpen(false)
            window.open(`/workspace/profile/${targetAccountId}`, "_blank")
          }}
          icon={<User size={20} />}
          label={pl.viewProfile || "Xem hồ sơ"}
        />
      )}

      {targetAccountId && (
        <div className="border-t border-border dark:border-[#3F3F3F] my-[2px]" />
      )}

      <ParticipantVolumeSlider participant={participant} isInline />

      {canModerateMedia && (
        <>
          <div className="border-t border-border dark:border-[#3F3F3F] my-[2px]" />
          {canToggleMic && (
            <MenuItem
              onClick={() => {
                setPopoverOpen(false)
                handleMuteTrack("audio", isTargetMicOn)
              }}
              disabled={isMuting}
              className={isMuting ? "opacity-50 cursor-not-allowed" : ""}
              icon={isTargetMicOn ? <MicOff size={20} /> : <Mic size={20} />}
              label={isTargetMicOn ? pl.mute : pl.unmute}
            />
          )}

          {canToggleCam && (
            <MenuItem
              onClick={() => {
                setPopoverOpen(false)
                handleMuteTrack("video", isTargetCamOn)
              }}
              disabled={isMuting}
              className={isMuting ? "opacity-50 cursor-not-allowed" : ""}
              icon={isTargetCamOn ? <VideoOff size={20} /> : <Video size={20} />}
              label={isTargetCamOn ? pl.muteCam : pl.unmuteCam}
            />
          )}
        </>
      )}

      {(canRestrictChat || canRestrictVoice) && (
        <>
          <div className="border-t border-border dark:border-[#3F3F3F] my-[2px]" />
          {canRestrictChat && (
            <MenuItem
              onClick={() => {
                setPopoverOpen(false)
                setRestrictConfirm({
                  open: true,
                  type: isTargetChatRestricted ? "unrestrict_chat" : "chat",
                })
              }}
              disabled={isRestrictingChat || isUnrestrictingChat}
              className={
                isRestrictingChat || isUnrestrictingChat
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
              icon={
                <MessageSquareOff
                  size={20}
                  className={isTargetChatRestricted ? "text-emerald-600" : ""}
                />
              }
              label={
                isTargetChatRestricted ? pl.unrestrictChat : pl.restrictChat
              }
            />
          )}

          {canRestrictVoice && (
            <MenuItem
              onClick={() => {
                setPopoverOpen(false)
                setRestrictConfirm({
                  open: true,
                  type: isTargetVoiceRestricted ? "unrestrict_voice" : "voice",
                })
              }}
              disabled={isRestrictingVoice || isUnrestrictingVoice}
              className={
                isRestrictingVoice || isUnrestrictingVoice
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
              icon={
                <Mic
                  size={20}
                  className={isTargetVoiceRestricted ? "text-emerald-600" : ""}
                />
              }
              label={
                isTargetVoiceRestricted ? pl.unrestrictVoice : pl.restrictVoice
              }
            />
          )}
        </>
      )}

      {isCurrentHost && (
        <>
          <div className="border-t border-border dark:border-[#3F3F3F] my-[2px]" />
          <MenuItem
            onClick={() => {
              setPopoverOpen(false)
              handleMuteTrack("screen", true)
            }}
            disabled={isMuting}
            className={isMuting ? "opacity-50 cursor-not-allowed" : ""}
            icon={<MonitorUp size={20} />}
            label={pl.stopScreenShare}
          />

          <MenuItem
            onClick={() => {
              setPopoverOpen(false)
              handleKick(false)
            }}
            disabled={isKicking}
            className={isKicking ? "opacity-50 cursor-not-allowed" : ""}
            hoverBg="hover:bg-red-50 group-hover:bg-red-50 dark:hover:bg-red-950/40 dark:group-hover:bg-red-950/40"
            icon={<UserX size={20} className="text-red-600 dark:text-red-400" />}
            label={
              <span className="text-red-600 dark:text-red-400 font-medium">
                {pl.kick}
              </span>
            }
          />

          <MenuItem
            onClick={() => {
              setPopoverOpen(false)
              handleKick(true)
            }}
            disabled={isKicking}
            className={isKicking ? "opacity-50 cursor-not-allowed" : ""}
            hoverBg="hover:bg-red-50 group-hover:bg-red-50 dark:hover:bg-red-950/40 dark:group-hover:bg-red-950/40"
            icon={<UserX size={20} className="text-red-600 dark:text-red-400" />}
            label={
              <span className="text-red-600 dark:text-red-400 font-medium">
                {pl.ban}
              </span>
            }
          />

          {isClassOrCustom(room?.roomType) && (
            <MenuItem
              onClick={() => {
                setPopoverOpen(false)
                setCoHostModalOpen(true)
              }}
              hoverBg="hover:bg-amber-50 group-hover:bg-amber-50 dark:hover:bg-amber-950/40 dark:group-hover:bg-amber-950/40"
              icon={
                <Shield
                  size={20}
                  className="text-amber-600 dark:text-amber-400"
                />
              }
              label={
                <span className="text-amber-700 dark:text-amber-400 font-medium">
                  {isTargetCoHost
                    ? pl.manageCoHost || "Quản lý co-host"
                    : pl.assignCoHost || "Phân công làm Co-host"}
                </span>
              }
            />
          )}

          {isClassOrCustom(room?.roomType) && isTargetCoHost && (
            <MenuItem
              onClick={() => {
                setPopoverOpen(false)
                setRevokeCoHostConfirm(true)
              }}
              hoverBg="hover:bg-red-50 group-hover:bg-red-50 dark:hover:bg-red-950/40 dark:group-hover:bg-red-950/40"
              icon={
                <UserX size={20} className="text-red-600 dark:text-red-400" />
              }
              label={
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {pl.revokeCoHost || "Gỡ co-host"}
                </span>
              }
            />
          )}
        </>
      )}

      {!isCurrentHost && (canKick || canStopScreen) && (
        <>
          <div className="border-t border-border dark:border-[#3F3F3F] my-[2px]" />
          {canStopScreen && (
            <MenuItem
              onClick={() => {
                setPopoverOpen(false)
                handleMuteTrack("screen", true)
              }}
              disabled={isMuting}
              className={isMuting ? "opacity-50 cursor-not-allowed" : ""}
              icon={<MonitorUp size={20} />}
              label={pl.stopScreenShare}
            />
          )}
          {canKick && (
            <MenuItem
              onClick={() => {
                setPopoverOpen(false)
                handleKick(false)
              }}
              disabled={isKicking}
              className={isKicking ? "opacity-50 cursor-not-allowed" : ""}
              hoverBg="hover:bg-red-50 group-hover:bg-red-50 dark:hover:bg-red-950/40 dark:group-hover:bg-red-950/40"
              icon={
                <UserX size={20} className="text-red-600 dark:text-red-400" />
              }
              label={
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {pl.kick}
                </span>
              }
            />
          )}
        </>
      )}
    </div>
  )

  return (
    <>
      <Popover
        className="shrink-0"
        triggerClassName="shrink-0 inline-flex items-center justify-center"
        onOpenChange={setPopoverOpen}
        trigger={
          <div
            role="button"
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={popoverOpen}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                e.currentTarget.click()
              }
            }}
            className="shrink-0 inline-flex items-center justify-center cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/40"
          >
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
        title={kickConfirm.banRejoin ? pl.confirmBanTitle : pl.confirmKickTitle}
        message={(kickConfirm.banRejoin ? pl.confirmBan : pl.confirmKick).replace("{name}", participantName)}
        confirmText={kickConfirm.banRejoin ? pl.ban : pl.kick}
        confirmVariant="destructive"
        isPending={isKicking}
      />

      <ConfirmationModal
        open={restrictConfirm.open}
        onClose={() => setRestrictConfirm({ open: false, type: null })}
        onConfirm={() => {
          const t2 = restrictConfirm.type
          setRestrictConfirm({ open: false, type: null })
          handleRestrict(t2)
        }}
        title={
          restrictConfirm.type === "chat"
            ? pl.confirmRestrictChatTitle
            : restrictConfirm.type === "unrestrict_chat"
            ? pl.confirmUnrestrictChatTitle
            : restrictConfirm.type === "voice"
            ? pl.confirmRestrictVoiceTitle
            : pl.confirmUnrestrictVoiceTitle
        }
        message={
          restrictConfirm.type === "chat"
            ? pl.confirmRestrictChat.replace("{name}", participantName)
            : restrictConfirm.type === "unrestrict_chat"
            ? pl.confirmUnrestrictChat.replace("{name}", participantName)
            : restrictConfirm.type === "voice"
            ? pl.confirmRestrictVoice.replace("{name}", participantName)
            : pl.confirmUnrestrictVoice.replace("{name}", participantName)
        }
        confirmText={t.confirm}
        confirmVariant={restrictConfirm.type?.startsWith("unrestrict") ? "default" : "destructive"}
        isPending={isRestrictingChat || isRestrictingVoice || isUnrestrictingChat || isUnrestrictingVoice}
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
    </>
  )
}
