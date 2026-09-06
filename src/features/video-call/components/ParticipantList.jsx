import React, { useMemo } from "react"
import { motion } from "framer-motion"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  UserPlus,
  Crown,
  Ellipsis,
  DoorOpen,
  Loader2,
  Lock,
  LockOpen,
  PhoneOff,
} from "lucide-react"
import { useIsSpeaking } from "@livekit/components-react"
import { useDispatch } from "react-redux"
import { leaveCall as leaveCallAction } from "@/store/slices/videoCallSlice"
import { useLanguage } from "@/shared/context/LanguageContext"
import Avatar from "@/shared/components/ui/Avatar"
import ListItem from "@/shared/components/ui/ListItem"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import { ParticipantActionPopover } from "./ParticipantActionPopover"
import { IconButton, PillButton } from "@/shared/components/ui/buttons"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { sanitizeAvatarUrl } from "@/features/video-call/utils/livekitMetadataUtils"
import { safeSetLiveKitMetadata } from "@/features/video-call/utils/livekitMetadataUtils"
import InviteParticipantModal from "./InviteParticipantModal"
import { toast } from "react-hot-toast"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { useNavigate } from "react-router-dom"
import { getNavigate } from "@/features/video-call/hooks/useNavigateRef"
import {
  useGetRoomCoHostQuery,
  useMuteAllParticipantsMutation,
  useGetSelfUnmutePolicyQuery,
  useUpdateSelfUnmutePolicyMutation,
  useGetWaitingQueueQuery,
  useGetMyWaitingStatusQuery,
  useKnockWaitingMutation,
  useGetRoomLockQuery,
  useUpdateRoomLockMutation,
  useEndLiveSessionMutation,
  useGetStudentSharePolicyQuery,
  useUpdateStudentSharePolicyMutation,
  useGetMemberRecordingPolicyQuery,
  useUpdateMemberRecordingPolicyMutation,
} from "@/store/api/roomsApi"
import {
  normalizeCoHost,
  hasCoHostPermission,
  CO_HOST_PERMISSIONS,
} from "@/features/co-host/constants"
import { resolveCoHostErrorMessage } from "@/features/co-host/errors"
import WaitingQueueTab from "./waiting/WaitingQueueTab"
import { normalizeWaitingEntry, normalizeWaitingQueue, knockWithToast } from "./waiting/waitingUtils"

/**
 * A single row in the participant list.
 * Uses LiveKit Participant object properties directly.
 */
const ParticipantItem = ({ participant }) => {
  const { t } = useLanguage()
  let navigate
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navigate = useNavigate()
  } catch {
    navigate = getNavigate()
  }
  const {
    micOn: localMicOn,
    cameraOn: localCameraOn,
    room,
    user,
  } = useVideoCallContext()
  const isSpeaking = useIsSpeaking(participant)
  const pl = t.rooms.videoCall.participantList

  const isLocal = participant.isLocal
  const isMicOn = isLocal
    ? localMicOn
    : (participant.isMicrophoneEnabled ?? false)
  const isCameraOn = isLocal
    ? localCameraOn
    : (participant.isCameraEnabled ?? false)

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }
  const meta = parseMetadata(participant.metadata)
  const accountId = meta.accountId || (isLocal ? user?.accountId : null)
  const isHandRaised = meta.handRaised === true
  const avatarUrl = sanitizeAvatarUrl(meta.avatarImageUrl)

  const isParticipantHost = isRoomHost(room, accountId)
  const isCurrentUserHost = isRoomHost(room, user?.accountId)

  const name =
    participant.name || participant.identity || (isLocal ? pl.you : pl.guest)

  const theme = useMemo(
    () => getParticipantTheme(participant.identity || name),
    [participant.identity, name],
  )

  const leftContent = (
    <div className="relative shrink-0 p-1">
      <Avatar
        size={40}
        name={name}
        src={avatarUrl}
        speaking={isSpeaking}
        className={theme?.avatarClass || ""}
      />
    </div>
  )

  const rightContent = (
    <div className="flex items-center gap-2 shrink-0">
      {isHandRaised && (
        <motion.div
          animate={{ rotate: [0, 20, -10, 20, -10, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
            repeatDelay: 1,
          }}
          style={{ originX: 0.7, originY: 0.7 }}
          className="flex flex-shrink-0 items-center justify-center"
        >
          <Hand size={18} className="text-amber-500" />
        </motion.div>
      )}
      {isMicOn ? (
        <Mic size={18} className="text-cath-red-700" />
      ) : (
        <MicOff size={18} className="text-[#8E8E93]" />
      )}
      {isCameraOn ? (
        <Video size={18} className="text-cath-red-700" />
      ) : (
        <VideoOff size={18} className="text-[#8E8E93]" />
      )}
      {!isLocal && isCurrentUserHost && (
        <div className="p-1 hover:bg-gray-200/60 rounded-lg text-gray-400 hover:text-gray-700 transition-colors ml-0.5">
          <Ellipsis size={18} />
        </div>
      )}
    </div>
  )

  return (
    <ListItem
      lines={1}
      hoverEffect={true}
      hoverBgColor="bg-gray-100"
      className="rounded-xl cursor-pointer"
      contentClassName="rounded-xl"
      leftContent={leftContent}
      rightContent={rightContent}
    >
      <div className="flex items-center gap-1.5 truncate">
        <span
          onClick={(e) => {
            if (accountId) {
              e.stopPropagation()
              window.open(
                `/profile/${accountId}`,
                "_blank",
                "noopener,noreferrer",
              )
            }
          }}
          className={`truncate ${accountId ? "cursor-pointer hover:underline hover:text-cath-red-700 transition-colors" : ""}`}
        >
          {name} {isLocal && pl.youSuffix}
        </span>
      </div>
    </ListItem>
  )
}

/**
 * Participant list panel.
 * Reads participants and local media state from VideoCallContext.
 * Ticket 03: `externalPending` merges Class Pending enrollments into the
 * waiting tab client-side (cath-api cannot join instructor enrollments).
 */
const ParticipantList = ({ hideTitle, externalPending }) => {
  const { t } = useLanguage()
  const {
    participants,
    id: roomId,
    room,
    user,
    lkRoom,
    isHost: isHostFromContext,
  } = useVideoCallContext()
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false)
  const pl = t.rooms.videoCall.participantList

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }

  const raisedHandParticipants = participants.filter((p) => {
    const meta = parseMetadata(p.metadata)
    return meta.handRaised === true
  })

  const otherParticipants = participants.filter((p) => {
    const meta = parseMetadata(p.metadata)
    return meta.handRaised !== true
  })

  const isHost = isHostFromContext || isRoomHost(room, user?.accountId)
  const [muteAllConfirmOpen, setMuteAllConfirmOpen] = React.useState(false)
  const dispatch = useDispatch()
  let navigate
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navigate = useNavigate()
  } catch {
    navigate = getNavigate()
  }

  // Ticket 02: co-host perms cho mute-all + self-unmute gate.
  const { data: coHostData } = useGetRoomCoHostQuery(roomId, {
    skip: !roomId,
  })
  const coHost = normalizeCoHost(coHostData)
  const canMuteAll =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.MUTE_ALL)
  const canToggleSelfUnmute =
    isHost ||
    hasCoHostPermission(
      coHost,
      user?.accountId,
      CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE
    )

  // Ticket 03: waiting queue — host "Chờ" tab + waiter knock banner.
  const [activeTab, setActiveTab] = React.useState("members")
  const canViewWaiting =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.ADMIT_WAITING)
  const { data: waitingQueueData } = useGetWaitingQueueQuery(roomId, {
    skip: !roomId || !canViewWaiting,
    pollingInterval: 10000,
  })
  const pendingCount =
    normalizeWaitingQueue(waitingQueueData)?.pendingCount ??
    normalizeWaitingQueue(waitingQueueData)?.pending?.length ??
    0
  const { data: myWaitingData } = useGetMyWaitingStatusQuery(roomId, {
    skip: !roomId || isHost,
  })
  const myWaitingEntry = normalizeWaitingEntry(myWaitingData)
  const [knockWaiting, { isLoading: isKnocking }] = useKnockWaitingMutation()

  const handleKnock = () => knockWithToast({ roomId, knockWaiting, t })

  const [muteAllApi, { isLoading: isMutingAll }] =
    useMuteAllParticipantsMutation()
  const { data: selfUnmutePolicy } = useGetSelfUnmutePolicyQuery(roomId, {
    skip: !roomId,
  })
  const [updateSelfUnmute, { isLoading: isTogglingSelfUnmute }] =
    useUpdateSelfUnmutePolicyMutation()
  const allowSelfUnmute =
    selfUnmutePolicy?.data?.allowSelfUnmute ??
    selfUnmutePolicy?.allowSelfUnmute ??
    true

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
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenMuteAll || "Bạn không có quyền tắt toàn bộ mic."
        )
      )
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
    toast.success(pl.successMuteAll || "Đã tắt mic tất cả mọi người")
  }

  const handleToggleSelfUnmute = async () => {
    if (!roomId) return
    try {
      const next = !allowSelfUnmute
      await updateSelfUnmute({ id: roomId, allow: next }).unwrap()
      // Broadcast để các client khác thấy ngay mà không cần refetch.
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({ action: "SELF_UNMUTE_POLICY", allow: next })
        )
        lkRoom?.localParticipant?.publishData(payload, {
          topic: "moderation",
          reliable: true,
        })
      } catch {
        /* ignore broadcast errors */
      }
      toast.success(
        next
          ? (pl.selfUnmuteOn || "Đã cho phép học viên tự bật mic.")
          : (pl.selfUnmuteOff || "Đã tắt quyền học viên tự bật mic.")
      )
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenSelfUnmute || "Bạn không có quyền đổi chính sách này."
        )
      )
    }
  }

  // Ticket 04: room lock (lock_class) + end live for all (end_class).
  const canManageLock =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.LOCK_CLASS)
  const canEndLive =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.END_CLASS)

  // Ticket 05: student share gate (manage_student_share) + member
  // recording gate, server-side (record). Both default open.
  const canManageStudentShare =
    isHost ||
    hasCoHostPermission(
      coHost,
      user?.accountId,
      CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE
    )
  const canManageMemberRecording =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.RECORD)
  const { data: studentSharePolicy } = useGetStudentSharePolicyQuery(roomId, {
    skip: !roomId,
  })
  const [updateStudentShare, { isLoading: isTogglingStudentShare }] =
    useUpdateStudentSharePolicyMutation()
  const allowStudentShare =
    studentSharePolicy?.data?.allowStudentShare ??
    studentSharePolicy?.allowStudentShare ??
    true
  const { data: memberRecordingPolicy } = useGetMemberRecordingPolicyQuery(
    roomId,
    { skip: !roomId }
  )
  const [updateMemberRecording, { isLoading: isTogglingMemberRecording }] =
    useUpdateMemberRecordingPolicyMutation()
  const allowMemberRecording =
    memberRecordingPolicy?.data?.allowMemberRecording ??
    memberRecordingPolicy?.allowMemberRecording ??
    true
  const { data: roomLockData } = useGetRoomLockQuery(roomId, {
    skip: !roomId,
  })
  const isLocked =
    roomLockData?.data?.isLocked ?? roomLockData?.isLocked ?? false
  const [updateRoomLock, { isLoading: isTogglingLock }] =
    useUpdateRoomLockMutation()
  const [endLiveApi, { isLoading: isEndingLive }] = useEndLiveSessionMutation()
  const [endLiveConfirmOpen, setEndLiveConfirmOpen] = React.useState(false)

  const handleToggleLock = async () => {
    if (!roomId) return
    try {
      const next = !isLocked
      await updateRoomLock({ id: roomId, locked: next }).unwrap()
      // Broadcast để các client khác thấy ngay mà không cần refetch.
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({ action: "ROOM_LOCK_CHANGED", locked: next })
        )
        lkRoom?.localParticipant?.publishData(payload, {
          topic: "moderation",
          reliable: true,
        })
      } catch {
        /* ignore broadcast errors */
      }
      toast.success(
        next
          ? (pl.lockOn || "Đã khóa phòng. Người mới không thể tham gia.")
          : (pl.lockOff || "Đã mở khóa phòng.")
      )
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenLock || "Bạn không có quyền khóa/mở phòng."
        )
      )
    }
  }

  const confirmEndLive = async () => {
    setEndLiveConfirmOpen(false)
    if (!roomId) return
    try {
      await endLiveApi(roomId).unwrap()
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenEnd || "Bạn không có quyền kết thúc buổi live."
        )
      )
      return
    }
    // Mọi client (kể cả người bấm) đều về màn hình kết thúc;
    // tham gia lại sẽ tạo phiên mới.
    try {
      const payload = new TextEncoder().encode(
        JSON.stringify({
          action: "ROOM_ENDED",
          senderId: String(user?.accountId ?? ""),
        })
      )
      lkRoom?.localParticipant?.publishData(payload, {
        topic: "moderation",
        reliable: true,
      })
    } catch {
      /* ignore broadcast errors */
    }
    try {
      lkRoom?.disconnect()
    } catch {
      /* ignore disconnect errors */
    }
    dispatch(leaveCallAction())
    toast.success(pl.endLiveSuccess || "Đã kết thúc buổi live.")
    const nav = navigate ?? getNavigate()
    if (nav && window.location.pathname.includes("/meet/")) {
      nav(window.location.pathname, {
        replace: true,
        state: { callEnded: true, reason: "ended" },
      })
    }
  }

  // Ticket 05: student share gate (manage_student_share) — default open.
  const handleToggleStudentShare = async () => {
    if (!roomId) return
    try {
      const next = !allowStudentShare
      await updateStudentShare({ id: roomId, allow: next }).unwrap()
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({ action: "STUDENT_SHARE_POLICY", allow: next })
        )
        lkRoom?.localParticipant?.publishData(payload, {
          topic: "moderation",
          reliable: true,
        })
      } catch {
        /* ignore broadcast errors */
      }
      toast.success(
        next
          ? (pl.studentShareOn || "Đã cho phép học viên chia sẻ màn hình.")
          : (pl.studentShareOff || "Đã tắt quyền học viên chia sẻ màn hình.")
      )
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenStudentShare || "Bạn không có quyền đổi chính sách này."
        )
      )
    }
  }

  // Ticket 05: member recording gate, server-side (record).
  const handleToggleMemberRecording = async () => {
    if (!roomId) return
    try {
      const next = !allowMemberRecording
      await updateMemberRecording({ id: roomId, allow: next }).unwrap()
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({ action: "MEMBER_RECORDING_POLICY", allow: next })
        )
        lkRoom?.localParticipant?.publishData(payload, {
          topic: "moderation",
          reliable: true,
        })
      } catch {
        /* ignore broadcast errors */
      }
      toast.success(
        next
          ? (pl.memberRecordingOn || "Đã cho phép học viên ghi hình.")
          : (pl.memberRecordingOff || "Đã tắt quyền học viên ghi hình.")
      )
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenRecord || "Bạn không có quyền đổi chính sách này."
        )
      )
    }
  }

  const handleLowerAllHands = async () => {
    if (lkRoom?.localParticipant) {      safeSetLiveKitMetadata(lkRoom.localParticipant, { handRaised: false, handRaisedAt: 0 })
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
    toast.success(pl.successLowerAllHands || "Đã hạ tất cả các tay xuống")
  }

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {!hideTitle && (
        <ListItem
          lines={1}
          className="border-b border-border shrink-0"
        >
          <div className="flex items-center justify-between">
            {canViewWaiting ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("members")}
                  className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors ${activeTab === "members" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
                >
                  {pl.title} ({participants.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("waiting")}
                  className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors ${activeTab === "waiting" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
                >
                  {t?.rooms?.videoCall?.waitingQueue?.tab || "Chờ"}
                  {pendingCount > 0 ? ` (${pendingCount})` : ""}
                </button>
              </div>
            ) : (
              <span className="font-semibold">
                {pl.title} ({participants.length})
              </span>
            )}
            <div className="flex items-center gap-1">
              <IconButton
                variant="ghost"
                size="xs"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <UserPlus size={22} />
              </IconButton>
            </div>
          </div>
        </ListItem>
      )}

      {/* Ticket 03: knock banner for non-hosts with no request yet. */}
      {!isHost && activeTab === "members" && !myWaitingEntry && (
        <div className="mx-2 mt-2 flex items-center gap-2 rounded-xl border border-blue-200/80 bg-blue-50/70 px-3 py-2 shrink-0">
          <DoorOpen size={16} className="shrink-0 text-blue-600" />
          <span className="min-w-0 flex-1 text-xs font-medium text-blue-900">
            {t?.rooms?.videoCall?.waitingQueue?.knockHint || "Phòng bật chế độ duyệt? Gõ cửa để xin vào."}
          </span>
          <button
            type="button"
            onClick={handleKnock}
            disabled={isKnocking}
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isKnocking && <Loader2 size={12} className="animate-spin" />}
            <span>{t?.rooms?.videoCall?.waitingQueue?.knock || "Gõ cửa"}</span>
          </button>
        </div>
      )}

      {/* Host / Co-host Quick Moderation Actions (ticket 02 per-perm, ticket 04 lock/end, ticket 05 share/record) */}
      {(canMuteAll || canToggleSelfUnmute || canManageLock || canEndLive || canManageStudentShare || canManageMemberRecording || isHost) && (
        <div className="p-2.5 border-b border-[#E5E5E5] flex flex-col gap-2 bg-gray-50/90 shrink-0">
          <div className="flex items-center gap-2">
            {canMuteAll && (
              <button
                onClick={handleMuteAll}
                disabled={isMutingAll}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold text-red-700 bg-red-50/80 hover:bg-red-100 border border-red-200/80 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
              >
                <MicOff size={15} className="text-red-500 shrink-0" />
                <span>{pl.muteAll || "Tắt tất cả mic"}</span>
              </button>
            )}

            <button
              onClick={handleLowerAllHands}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold text-amber-800 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              <Hand size={15} className="text-amber-500 shrink-0" />
              <span>{pl.lowerAllHands || "Hạ tất cả tay"}</span>
            </button>
          </div>

          {canToggleSelfUnmute && (
            <label className="flex items-center justify-between gap-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200/80 rounded-xl px-3 py-2 cursor-pointer">
              <span>{pl.allowSelfUnmute || "Cho phép học viên tự bật mic"}</span>
              <input
                type="checkbox"
                checked={allowSelfUnmute}
                disabled={isTogglingSelfUnmute}
                onChange={handleToggleSelfUnmute}
                className="h-4 w-4 accent-blue-600"
              />
            </label>
          )}

          {/* Ticket 04: lock toggle (lock_class) — khóa thì chặn người mới, người trong phòng ở lại. */}
          {canManageLock && (
            <label className="flex items-center justify-between gap-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200/80 rounded-xl px-3 py-2 cursor-pointer">
              <span className="inline-flex items-center gap-1.5">
                {isLocked ? <Lock size={14} className="text-red-600" /> : <LockOpen size={14} className="text-neutral-500" />}
                {pl.lockRoom || "Khóa phòng (chặn người mới)"}
              </span>
              <input
                type="checkbox"
                checked={isLocked}
                disabled={isTogglingLock}
                onChange={handleToggleLock}
                className="h-4 w-4 accent-red-600"
              />
            </label>
          )}

          {/* Ticket 04: end live for all (end_class) — chỉ end session live, join lại tạo phiên mới. */}
          {canEndLive && (
            <button
              type="button"
              onClick={() => setEndLiveConfirmOpen(true)}
              disabled={isEndingLive}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 border border-red-600 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              <PhoneOff size={15} className="shrink-0 rotate-[135deg]" />
              <span>{pl.endLive || "Kết thúc buổi live"}</span>
            </button>
          )}

          {/* Ticket 05: student share gate (manage_student_share) — default mở. */}
          {canManageStudentShare && (
            <label className="flex items-center justify-between gap-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200/80 rounded-xl px-3 py-2 cursor-pointer">
              <span>{pl.allowStudentShare || "Cho phép học viên chia sẻ màn hình"}</span>
              <input
                type="checkbox"
                checked={allowStudentShare}
                disabled={isTogglingStudentShare}
                onChange={handleToggleStudentShare}
                className="h-4 w-4 accent-blue-600"
              />
            </label>
          )}

          {/* Ticket 05: member recording gate, server-side (record). */}
          {canManageMemberRecording && (
            <label className="flex items-center justify-between gap-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200/80 rounded-xl px-3 py-2 cursor-pointer">
              <span>{pl.allowMemberRecording || "Cho phép học viên ghi hình"}</span>
              <input
                type="checkbox"
                checked={allowMemberRecording}
                disabled={isTogglingMemberRecording}
                onChange={handleToggleMemberRecording}
                className="h-4 w-4 accent-blue-600"
              />
            </label>
          )}
        </div>
      )}
      {(!canViewWaiting || activeTab === "members") && (
      <div className="flex-1 overflow-y-auto p-1">
        {raisedHandParticipants.length > 0 && (
          <ul className="flex flex-col gap-1">
            {raisedHandParticipants.map((participant) => (
              <li key={participant.identity} className="w-full">
                <ParticipantActionPopover participant={participant}>
                  <ParticipantItem participant={participant} />
                </ParticipantActionPopover>
              </li>
            ))}
          </ul>
        )}

        {raisedHandParticipants.length > 0 && otherParticipants.length > 0 && (
          <div className="my-2 mx-1 border-t border-border" />
        )}

        {otherParticipants.length > 0 && (
          <ul className="flex flex-col gap-1">
            {otherParticipants.map((participant) => (
              <li key={participant.identity} className="w-full">
                <ParticipantActionPopover participant={participant}>
                  <ParticipantItem participant={participant} />
                </ParticipantActionPopover>
              </li>
            ))}
          </ul>
        )}
      </div>
      )}

      {/* Ticket 03: host/co-host "Chờ" tab — knock list + Duyệt/Từ chối. */}
      {canViewWaiting && activeTab === "waiting" && (
        <div className="flex-1 overflow-y-auto">
          <WaitingQueueTab roomId={roomId} externalPending={externalPending} />
        </div>
      )}

      <InviteParticipantModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        roomId={roomId}
      />

      <ConfirmationModal
        open={muteAllConfirmOpen}
        onClose={() => setMuteAllConfirmOpen(false)}
        onConfirm={confirmMuteAll}
        title={pl.confirmMuteAllTitle || pl.muteAll || "Tắt tất cả mic"}
        message={pl.confirmMuteAll || "Bạn có chắc chắn muốn tắt tiếng tất cả thành viên trong phòng?"}
        confirmText={pl.muteAll || "Tắt tất cả mic"}
        confirmVariant="destructive"
      />

      {/* Ticket 04: end-live confirm — mọi người về màn hình kết thúc, join lại tạo phiên mới. */}
      <ConfirmationModal
        open={endLiveConfirmOpen}
        onClose={() => setEndLiveConfirmOpen(false)}
        onConfirm={confirmEndLive}
        title={pl.confirmEndLiveTitle || pl.endLive || "Kết thúc buổi live"}
        message={pl.confirmEndLive || "Kết thúc buổi live cho tất cả mọi người? Mọi người sẽ về màn hình kết thúc, tham gia lại sẽ tạo phiên mới. Lớp/phòng và điểm danh không đổi."}
        confirmText={pl.endLive || "Kết thúc buổi live"}
        confirmVariant="destructive"
      />
    </div>
  );
}

export default ParticipantList
