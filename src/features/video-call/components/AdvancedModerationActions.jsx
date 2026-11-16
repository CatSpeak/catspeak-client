import React, { useState, useMemo } from "react"
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  MicOff,
  VideoOff,
  Hand,
  ShieldAlert,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react"
import { toast } from "react-hot-toast"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost, isCustomRoom } from "@/features/video-call/utils/roomTypeHelpers"
import { safeSetLiveKitMetadata } from "@/features/video-call/utils/livekitMetadataUtils"
import {
  useMuteAllParticipantsMutation,
  useCameraOffAllMutation,
  useLowerAllHandsMutation,
  useRestrictVoiceAllMutation,
} from "@/store/api/roomsApi"
import {
  hasCoHostPermission,
  CO_HOST_PERMISSIONS,
} from "@/features/co-host/constants"
import { resolveCoHostErrorMessage } from "@/features/co-host/errors"

const parseMetadata = (metadata) => {
  if (!metadata) return {}
  try {
    return JSON.parse(metadata)
  } catch {
    return {}
  }
}

/**
 * Advanced moderation action tile.
 */
const ADVANCED_ACTION_TONES = {
  danger: {
    tile: "enabled:hover:border-red-200 dark:enabled:hover:border-red-900/50 enabled:hover:bg-red-50/40 dark:enabled:hover:bg-red-950/30",
    icon: "bg-red-50 dark:bg-red-950/50 text-cath-red-700 dark:text-red-400",
  },
  warning: {
    tile: "enabled:hover:border-amber-200 dark:enabled:hover:border-amber-900/50 enabled:hover:bg-amber-50/40 dark:enabled:hover:bg-amber-950/30",
    icon: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
  },
}

const AdvancedAction = ({
  icon,
  label,
  title,
  onClick,
  disabled,
  tone = "danger",
  badge,
}) => {
  const toneStyles = ADVANCED_ACTION_TONES[tone] || ADVANCED_ACTION_TONES.danger
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      aria-label={label}
      className={`inline-flex h-9 min-w-0 items-center gap-2 rounded-xl border border-neutral-200/90 dark:border-[#3F3F3F] bg-white dark:bg-[#272727] pl-1.5 pr-2 text-left transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 ${toneStyles.tile}`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors [&_svg]:!h-3.5 [&_svg]:!w-3.5 ${toneStyles.icon}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-neutral-700 dark:text-neutral-200">
        {label}
      </span>
      {badge}
    </button>
  )
}

/**
 * Collapsible accordion for room-wide moderation actions:
 * - Mute All
 * - Camera Off All
 * - Lower All Hands
 * - Restrict Voice All
 */
const AdvancedModerationActions = ({ coHost }) => {
  const { t } = useLanguage()
  const pl = t.rooms.videoCall.participantList
  const prefersReducedMotion = useReducedMotion()

  const {
    participants,
    id: roomId,
    room,
    user,
    lkRoom,
    isHost: isHostFromContext,
    restrictionByAccountId,
  } = useVideoCallContext()

  const isCustom = isCustomRoom(room?.roomType)
  const isHost = isHostFromContext || isRoomHost(room, user?.accountId)

  const [advancedOpen, setAdvancedOpen] = useState(true)

  // Permissions
  const canMuteAll =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.MUTE_ALL)
  const canCameraOffAll =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.CAMERA_OFF_ALL)
  const canLowerAllHands =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.LOWER_ALL_HANDS)
  const canBlockAllMics =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.BLOCK_ALL_MICS)

  // Modals state
  const [muteAllConfirmOpen, setMuteAllConfirmOpen] = useState(false)
  const [cameraOffAllConfirmOpen, setCameraOffAllConfirmOpen] = useState(false)
  const [lowerHandsConfirmOpen, setLowerHandsConfirmOpen] = useState(false)
  const [blockAllMicsConfirmOpen, setBlockAllMicsConfirmOpen] = useState(false)

  // Mutations
  const [muteAllApi, { isLoading: isMutingAll }] = useMuteAllParticipantsMutation()
  const [cameraOffAllApi, { isLoading: isCameraOffAll }] = useCameraOffAllMutation()
  const [lowerAllHandsApi, { isLoading: isLoweringHands }] = useLowerAllHandsMutation()
  const [blockAllMicsApi, { isLoading: isBlockingAllMics }] = useRestrictVoiceAllMutation()

  // Computed counts
  const totalRaisedHands = useMemo(() => {
    return participants.filter((p) => {
      const meta = parseMetadata(p.metadata)
      return meta.handRaised === true
    }).length
  }, [participants])

  const voiceBlockAllMicsCount = useMemo(() => {
    return participants.filter((p) => {
      const meta = parseMetadata(p.metadata)
      const accountId = meta.accountId
      if (accountId == null || accountId === "") return false
      if (String(accountId) === String(user?.accountId)) return false
      if (String(accountId) === String(room?.creatorId)) return false
      return restrictionByAccountId?.[String(accountId)]?.isVoiceRestricted !== true
    }).length
  }, [participants, user?.accountId, room?.creatorId, restrictionByAccountId])

  // Handlers
  const handleMuteAll = () => {
    setMuteAllConfirmOpen(true)
  }

  const confirmMuteAll = async () => {
    setMuteAllConfirmOpen(false)
    if (!roomId) return
    try {
      await muteAllApi(roomId).unwrap()
    } catch (err) {
      console.warn("Backend mute-all API response:", err)
      toast.error(resolveCoHostErrorMessage(err, t, pl.forbiddenMuteAll))
      return
    }
    if (lkRoom?.localParticipant) {
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({
            action: "MUTE_ALL",
            senderId: String(user?.accountId ?? ""),
            senderIdentity: String(lkRoom.localParticipant.identity ?? ""),
          })
        )
        lkRoom.localParticipant.publishData(payload, {
          topic: "moderation",
          reliable: true,
        })
      } catch (e) {
        console.error("Failed to broadcast MUTE_ALL:", e)
      }
    }
    toast.success(pl.successMuteAll)
  }

  const confirmCameraOffAll = async () => {
    setCameraOffAllConfirmOpen(false)
    if (!roomId) return
    try {
      await cameraOffAllApi(roomId).unwrap()
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenCameraOffAll || pl.forbiddenMedia
        )
      )
      return
    }
    if (lkRoom?.localParticipant) {
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({
            action: "CAMERA_OFF_ALL",
            senderId: String(user?.accountId ?? ""),
            senderIdentity: String(lkRoom.localParticipant.identity ?? ""),
          })
        )
        lkRoom.localParticipant.publishData(payload, {
          topic: "moderation",
          reliable: true,
        })
      } catch (e) {
        console.error("Failed to broadcast CAMERA_OFF_ALL:", e)
      }
    }
    toast.success(
      pl.successCameraOffAll || "Đã tắt camera tất cả mọi người (trừ bạn)."
    )
  }

  const handleLowerAllHands = () => {
    if (totalRaisedHands === 0) {
      toast(pl.noHandsRaised)
      return
    }
    setLowerHandsConfirmOpen(true)
  }

  const confirmLowerAllHands = async () => {
    setLowerHandsConfirmOpen(false)
    if (!roomId) return
    try {
      const res = await lowerAllHandsApi(roomId).unwrap()
      if (lkRoom?.localParticipant) {
        safeSetLiveKitMetadata(lkRoom.localParticipant, {
          handRaised: false,
          handRaisedAt: 0,
        })
        try {
          const payload = new TextEncoder().encode(
            JSON.stringify({ action: "LOWER_ALL_HANDS" })
          )
          lkRoom.localParticipant.publishData(payload, {
            topic: "moderation",
            reliable: true,
          })
        } catch (e) {
          console.error("Failed to broadcast LOWER_ALL_HANDS:", e)
        }
      }
      const loweredCount =
        res?.data?.loweredCount ?? res?.loweredCount ?? totalRaisedHands
      toast.success(
        pl.successLowerAllHands.replace("{count}", String(loweredCount))
      )
    } catch (err) {
      toast.error(resolveCoHostErrorMessage(err, t, pl.forbiddenLowerHands))
    }
  }

  const handleBlockAllMics = () => {
    setBlockAllMicsConfirmOpen(true)
  }

  const confirmBlockAllMics = async () => {
    setBlockAllMicsConfirmOpen(false)
    if (!roomId) return
    try {
      const res = await blockAllMicsApi(roomId).unwrap()
      const restrictedCount =
        res?.data?.restrictedCount ??
        res?.restrictedCount ??
        voiceBlockAllMicsCount
      toast.success(
        (isCustom
          ? pl.successRestrictVoiceAllRoom || pl.successRestrictVoiceAll
          : pl.successRestrictVoiceAll
        ).replace("{count}", String(restrictedCount))
      )
    } catch (err) {
      const msg = err?.data?.message || err?.error || ""
      if (err?.status === 404) {
        toast.error(pl.noActiveSession)
      } else if (err?.status === 409) {
        toast.error(msg || pl.alreadyVoiceRestricted)
      } else {
        toast.error(
          resolveCoHostErrorMessage(err, t, pl.forbiddenRestrictVoice)
        )
      }
    }
  }

  const canShowActions =
    isHost || canMuteAll || canCameraOffAll || canBlockAllMics || canLowerAllHands

  if (!canShowActions) return null

  return (
    <>
      <div className="px-2.5 pt-2 shrink-0">
        <div className="overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-[#3F3F3F] bg-neutral-50/60 dark:bg-[#222222]">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            aria-expanded={advancedOpen}
            className="flex w-full items-center justify-between px-2.5 py-1.5 text-left transition-colors hover:bg-neutral-100/70 dark:hover:bg-[#2a2a2a]"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-[#AAAAAA]">
              <SlidersHorizontal
                size={12}
                className="text-neutral-400 dark:text-[#AAAAAA]"
                aria-hidden="true"
              />
              <span>{pl.advancedActions || "Thao tác nâng cao"}</span>
            </span>
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={`shrink-0 text-neutral-400 dark:text-[#AAAAAA] transition-transform duration-200 ${
                advancedOpen ? "" : "-rotate-90"
              }`}
            />
          </button>

          <AnimatePresence initial={false}>
            {advancedOpen && (
              <Motion.div
                key="advanced-actions"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.18, ease: "easeInOut" }
                }
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-1.5 px-2 pb-2">
                  {(isHost || canMuteAll) && (
                    <AdvancedAction
                      icon={<MicOff aria-hidden="true" />}
                      label={pl.muteAll}
                      onClick={handleMuteAll}
                      disabled={isMutingAll}
                      tone="danger"
                    />
                  )}

                  {canCameraOffAll && (
                    <AdvancedAction
                      icon={<VideoOff aria-hidden="true" />}
                      label={pl.cameraOffAll}
                      onClick={() => setCameraOffAllConfirmOpen(true)}
                      disabled={isCameraOffAll}
                      tone="danger"
                    />
                  )}

                  {(isHost || canLowerAllHands) && (
                    <AdvancedAction
                      icon={<Hand aria-hidden="true" />}
                      label={pl.lowerAllHands}
                      title={
                        totalRaisedHands === 0
                          ? pl.noHandsRaised
                          : pl.lowerAllHands
                      }
                      onClick={handleLowerAllHands}
                      disabled={totalRaisedHands === 0}
                      tone="warning"
                      badge={
                        totalRaisedHands > 0 ? (
                          <span className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/60 px-1 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                            {totalRaisedHands}
                          </span>
                        ) : null
                      }
                    />
                  )}

                  {(isHost || canBlockAllMics) && (
                    <AdvancedAction
                      icon={<ShieldAlert aria-hidden="true" />}
                      label={pl.restrictVoiceAll}
                      onClick={handleBlockAllMics}
                      disabled={isBlockingAllMics}
                      tone="danger"
                    />
                  )}
                </div>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Confirmation Modals for Bulk Moderation */}
      <ConfirmationModal
        open={muteAllConfirmOpen}
        onClose={() => setMuteAllConfirmOpen(false)}
        onConfirm={confirmMuteAll}
        title={pl.confirmMuteAllTitle || pl.muteAll}
        message={pl.confirmMuteAll}
        confirmText={pl.muteAll}
        confirmVariant="destructive"
      />

      <ConfirmationModal
        open={cameraOffAllConfirmOpen}
        onClose={() => setCameraOffAllConfirmOpen(false)}
        onConfirm={confirmCameraOffAll}
        title={pl.confirmCameraOffAllTitle || pl.cameraOffAll || "Tắt camera tất cả"}
        message={
          pl.confirmCameraOffAll ||
          "Bạn có chắc muốn tắt camera của tất cả mọi người trong phòng?"
        }
        confirmText={pl.cameraOffAll || "Tắt camera tất cả"}
        confirmVariant="destructive"
        isPending={isCameraOffAll}
      />

      <ConfirmationModal
        open={lowerHandsConfirmOpen}
        onClose={() => setLowerHandsConfirmOpen(false)}
        onConfirm={confirmLowerAllHands}
        title={pl.confirmLowerHandsTitle || pl.lowerAllHands}
        message={pl.confirmLowerHands.replace("{count}", String(totalRaisedHands))}
        confirmText={pl.lowerAllHands}
        confirmVariant="default"
        isPending={isLoweringHands}
      />

      <ConfirmationModal
        open={blockAllMicsConfirmOpen}
        onClose={() => setBlockAllMicsConfirmOpen(false)}
        onConfirm={confirmBlockAllMics}
        title={
          isCustom
            ? pl.confirmRestrictVoiceAllTitleRoom ||
              pl.restrictVoiceAllRoom ||
              pl.confirmRestrictVoiceAllTitle ||
              pl.restrictVoiceAll
            : pl.confirmRestrictVoiceAllTitle || pl.restrictVoiceAll
        }
        message={
          isCustom
            ? (pl.confirmRestrictVoiceAllRoom || pl.confirmRestrictVoiceAll).replace(
                "{count}",
                String(voiceBlockAllMicsCount),
              )
            : pl.confirmRestrictVoiceAll.replace(
                "{count}",
                String(voiceBlockAllMicsCount)
              )
        }
        confirmText={
          isCustom
            ? pl.restrictVoiceAllRoom || pl.restrictVoiceAll
            : pl.restrictVoiceAll
        }
        confirmVariant="destructive"
        isPending={isBlockingAllMics}
      />
    </>
  )
}

export default AdvancedModerationActions
