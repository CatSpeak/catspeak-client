import React, { useMemo } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  UserPlus,
  Ellipsis,
  DoorOpen,
  Loader2,
  Lock,
  LockOpen,
  PhoneOff,
  MessageSquareOff,
  ShieldAlert,
  Settings2,
  ChevronDown,
  MonitorUp,
  CircleDot,
  Gamepad2,
  Gauge,
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
import { IconButton } from "@/shared/components/ui/buttons"
import PolicyRow from "./settings/PolicyRow"
import BannedListTab from "./settings/BannedListTab"
import { canViewBannedList } from "@/features/video-call/utils/roomAccess"
import {
  getRoomSetting,
  setRoomSetting,
  ROOM_SETTING_KEYS,
} from "@/features/video-call/utils/roomSettingHelpers"
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
  useGetGamePolicyQuery,
  useUpdateGamePolicyMutation,
  useUpdateHighQualityPolicyMutation,
  useLowerAllHandsMutation,
  useRestrictVoiceAllMutation,
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
    restrictionByAccountId,
  } = useVideoCallContext()
  const isSpeaking = useIsSpeaking(participant)
  const prefersReducedMotion = useReducedMotion()
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

  // Ticket 02: live chat/voice restriction badges.
  const restriction = accountId != null
    ? restrictionByAccountId?.[String(accountId)] || {}
    : {}
  const isChatRestricted = restriction.isChatRestricted === true
  const isVoiceRestricted = restriction.isVoiceRestricted === true

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
      {isChatRestricted && (
        <span
          title={pl.chatRestrictedBadge || "Chat restricted"}
          className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100"
        >
          <MessageSquareOff size={13} className="text-amber-600" />
        </span>
      )}
      {isVoiceRestricted && (
        <span
          title={pl.voiceRestrictedBadge || "Voice restricted"}
          className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100"
        >
          <ShieldAlert size={13} className="text-amber-600" />
        </span>
      )}
      {isHandRaised && (
        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : { rotate: [0, 20, -10, 20, -10, 0] }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                  repeatDelay: 1,
                }
          }
          style={{ originX: 0.7, originY: 0.7 }}
          className="flex flex-shrink-0 items-center justify-center"
        >
          <Hand size={18} className="text-amber-500" aria-hidden="true" />
        </motion.div>
      )}
      <span title={isMicOn ? pl.micOn : pl.micOff}>
        {isMicOn ? (
          <Mic size={18} className="text-cath-red-700" aria-hidden="true" />
        ) : (
          <MicOff size={18} className="text-[#8E8E93]" aria-hidden="true" />
        )}
        <span className="sr-only">{isMicOn ? pl.micOn : pl.micOff}</span>
      </span>
      <span title={isCameraOn ? pl.camOn : pl.camOff}>
        {isCameraOn ? (
          <Video size={18} className="text-cath-red-700" aria-hidden="true" />
        ) : (
          <VideoOff size={18} className="text-[#8E8E93]" aria-hidden="true" />
        )}
        <span className="sr-only">{isCameraOn ? pl.camOn : pl.camOff}</span>
      </span>
      {!isLocal && isCurrentUserHost && (
        <div
          aria-hidden="true"
          className="p-1 hover:bg-gray-200/60 rounded-lg text-gray-400 hover:text-gray-700 transition-colors ml-0.5"
        >
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
        {accountId ? (
          <a
            href={`/profile/${accountId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="truncate cursor-pointer hover:underline hover:text-cath-red-700 transition-colors"
          >
            {name} {isLocal && pl.youSuffix}
          </a>
        ) : (
          <span className="truncate">
            {name} {isLocal && pl.youSuffix}
          </span>
        )}
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
    restrictionByAccountId,
    roomHighQuality,
    setRoomHighQuality,
  } = useVideoCallContext()
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false)
  const pl = t.rooms.videoCall.participantList
  const gt = t.rooms.videoCall.general || {}

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

  // Ticket 05: số participant sẽ bị tác động bởi Restrict Voice – All
  // (loại trừ host/người thao tác, chủ phòng và người đã bị hạn chế).
  const voiceRestrictAllCount = participants.filter((p) => {
    const meta = parseMetadata(p.metadata)
    const accountId = meta.accountId
    if (accountId == null || accountId === "") return false
    if (String(accountId) === String(user?.accountId)) return false
    if (String(accountId) === String(room?.creatorId)) return false
    return restrictionByAccountId?.[String(accountId)]?.isVoiceRestricted !== true
  }).length

  const isHost = isHostFromContext || isRoomHost(room, user?.accountId)
  const [muteAllConfirmOpen, setMuteAllConfirmOpen] = React.useState(false)
  const [managementOpen, setManagementOpen] = React.useState(false)
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
  // Bị cấm tab: mirrors the server (host, or co-host with remove_student/mute_all).
  const canViewBanned = canViewBannedList({
    isHost,
    coHost,
    accountId: user?.accountId,
  })
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
          pl.forbiddenMuteAll
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
    toast.success(pl.successMuteAll)
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
          ? pl.selfUnmuteOn
          : pl.selfUnmuteOff
      )
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenSelfUnmute
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
          ? pl.lockOn
          : pl.lockOff
      )
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenLock
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
          pl.forbiddenEnd
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
    toast.success(pl.endLiveSuccess)
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
          ? pl.studentShareOn
          : pl.studentShareOff
      )
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenStudentShare
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
          ? pl.memberRecordingOn
          : pl.memberRecordingOff
      )
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenRecord
        )
      )
    }
  }

  // ── Room policies moved out of the Settings modal ("Chung" tab) ──
  const canManagePrivateAi = isHost
  const canManageGame =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.MUTE_ALL) ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.REMOVE_STUDENT)
  // High quality is host-only server-side (co-hosts never get the override).
  const canManageHighQuality = isHost

  const [memberPrivateAiAllowed, setMemberPrivateAiAllowed] = React.useState(
    () => getRoomSetting(roomId, ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI)
  )
  React.useEffect(() => {
    const handlePrivateAiChange = () => {
      setMemberPrivateAiAllowed(
        getRoomSetting(roomId, ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI)
      )
    }
    window.addEventListener(
      "catspeak_member_private_ai_allowed_changed",
      handlePrivateAiChange
    )
    return () =>
      window.removeEventListener(
        "catspeak_member_private_ai_allowed_changed",
        handlePrivateAiChange
      )
  }, [roomId])

  const { data: gamePolicyData } = useGetGamePolicyQuery(roomId, {
    skip: !roomId,
  })
  const [updateGamePolicy, { isLoading: isTogglingGame }] =
    useUpdateGamePolicyMutation()
  const serverAllowGame =
    gamePolicyData?.data?.allowGame ?? gamePolicyData?.allowGame ?? true
  const [allowGame, setAllowGame] = React.useState(true)
  React.useEffect(() => {
    if (serverAllowGame !== undefined) setAllowGame(serverAllowGame)
  }, [serverAllowGame])

  const [updateHighQualityPolicy, { isLoading: isTogglingHighQuality }] =
    useUpdateHighQualityPolicyMutation()

  const handleToggleMemberPrivateAi = () => {
    const next = !memberPrivateAiAllowed
    setMemberPrivateAiAllowed(next)
    setRoomSetting(roomId, ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI, next)
    window.dispatchEvent(new Event("catspeak_member_private_ai_allowed_changed"))
    try {
      const payload = new TextEncoder().encode(
        JSON.stringify({
          action: "TOGGLE_MEMBER_PRIVATE_AI",
          allowed: next,
          roomId,
        })
      )
      lkRoom?.localParticipant?.publishData(payload, {
        topic: "moderation",
        reliable: true,
      })
    } catch {
      /* ignore broadcast errors */
    }
  }

  const handleToggleGame = async () => {
    const next = !allowGame
    setAllowGame(next)
    try {
      if (roomId) {
        await updateGamePolicy({ id: roomId, allow: next }).unwrap()
      }
    } catch (err) {
      setAllowGame(!next)
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenGame || "Bạn không có quyền thay đổi chính sách trò chơi."
        )
      )
      return
    }
    try {
      const payload = new TextEncoder().encode(
        JSON.stringify({ action: "GAME_POLICY", allow: next })
      )
      lkRoom?.localParticipant?.publishData(payload, {
        topic: "moderation",
        reliable: true,
      })
    } catch {
      /* ignore broadcast errors */
    }
  }

  const handleToggleHighQuality = async () => {
    const next = roomHighQuality !== true
    setRoomHighQuality?.(next)
    try {
      if (roomId) {
        await updateHighQualityPolicy({ id: roomId, enabled: next }).unwrap()
      }
    } catch (err) {
      setRoomHighQuality?.(!next)
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          t?.rooms?.videoCall?.participantList?.forbiddenHighQuality ||
            "Chỉ chủ phòng mới có quyền bật/tắt chế độ chất lượng cao."
        )
      )
      return
    }
    try {
      const payload = new TextEncoder().encode(
        JSON.stringify({
          action: "HIGH_QUALITY_POLICY",
          enabled: next,
          roomId,
        })
      )
      lkRoom?.localParticipant?.publishData(payload, {
        topic: "moderation",
        reliable: true,
      })
    } catch {
      /* ignore broadcast errors */
    }
  }

  const [lowerAllHandsApi, { isLoading: isLoweringHands }] = useLowerAllHandsMutation()
  const [restrictVoiceAllApi, { isLoading: isRestrictingVoiceAll }] = useRestrictVoiceAllMutation()
  const [lowerHandsConfirmOpen, setLowerHandsConfirmOpen] = React.useState(false)
  const [restrictVoiceAllConfirmOpen, setRestrictVoiceAllConfirmOpen] = React.useState(false)

  const handleLowerAllHands = () => {
    if (raisedHandParticipants.length === 0) {
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
      // Update local LiveKit metadata for all raised participants (best-effort)
      if (lkRoom?.localParticipant) {
        safeSetLiveKitMetadata(lkRoom.localParticipant, { handRaised: false, handRaisedAt: 0 })
        try {
          const payload = new TextEncoder().encode(JSON.stringify({ action: "LOWER_ALL_HANDS" }))
          lkRoom.localParticipant.publishData(payload, { topic: "moderation", reliable: true })
        } catch (e) {
          console.error("Failed to broadcast LOWER_ALL_HANDS:", e)
        }
      }
      // Also lower for each participant via metadata clear (client will sync via data channel)
      const loweredCount =
        res?.data?.loweredCount ?? res?.loweredCount ?? raisedHandParticipants.length
      toast.success(pl.successLowerAllHands.replace("{count}", String(loweredCount)))
    } catch (err) {
      toast.error(resolveCoHostErrorMessage(err, t, pl.forbiddenLowerHands))
    }
  }

  const handleRestrictVoiceAll = () => {
    setRestrictVoiceAllConfirmOpen(true)
  }

  const confirmRestrictVoiceAll = async () => {
    setRestrictVoiceAllConfirmOpen(false)
    if (!roomId) return
    try {
      const res = await restrictVoiceAllApi(roomId).unwrap()
      try {
        const restrictedAccountIds =
          res?.restrictedAccountIds ?? res?.data?.restrictedAccountIds ?? []
        const payload = new TextEncoder().encode(
          JSON.stringify({
            action: "RESTRICT_VOICE_ALL",
            senderId: String(user?.accountId ?? ""),
            senderIdentity: String(lkRoom?.localParticipant?.identity ?? ""),
            restrictedAccountIds,
          })
        )
        lkRoom?.localParticipant?.publishData(payload, { topic: "moderation", reliable: true })
      } catch {}
      const restrictedCount =
        res?.data?.restrictedCount ?? res?.restrictedCount ?? voiceRestrictAllCount
      toast.success(pl.successRestrictVoiceAll.replace("{count}", String(restrictedCount)))
    } catch (err) {
      const msg = err?.data?.message || err?.error || ""
      if (err?.status === 404) {
        toast.error(pl.noActiveSession)
      } else if (err?.status === 409) {
        toast.error(msg || pl.alreadyVoiceRestricted)
      } else {
        toast.error(resolveCoHostErrorMessage(err, t, pl.forbiddenRestrictVoice))
      }
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {!hideTitle && (
        <ListItem
          lines={1}
          className="border-b border-border shrink-0"
        >
          <div className="flex items-center justify-between">
            {canViewWaiting || canViewBanned ? (
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hidden" role="tablist" aria-label={pl.title}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "members"}
                  onClick={() => setActiveTab("members")}
                  className={`shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/40 ${activeTab === "members" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
                >
                  {pl.title} ({participants.length})
                </button>
                {canViewWaiting && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "waiting"}
                    onClick={() => setActiveTab("waiting")}
                    className={`shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/40 ${activeTab === "waiting" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
                  >
                    {t?.rooms?.videoCall?.waitingQueue?.tab}
                    {pendingCount > 0 ? ` (${pendingCount})` : ""}
                  </button>
                )}
                {canViewBanned && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "banned"}
                    onClick={() => setActiveTab("banned")}
                    className={`shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/40 ${activeTab === "banned" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
                  >
                    {pl.bannedTabShort || "Bị cấm"}
                  </button>
                )}
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
                title={t.rooms?.videoCall?.inviteParticipant || "Invite"}
                aria-label={t.rooms?.videoCall?.inviteParticipant || "Invite"}
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
            {t?.rooms?.videoCall?.waitingQueue?.knockHint}
          </span>
          <button
            type="button"
            onClick={handleKnock}
            disabled={isKnocking}
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isKnocking && <Loader2 size={12} className="animate-spin" />}
            <span>{t?.rooms?.videoCall?.waitingQueue?.knock}</span>
          </button>
        </div>
      )}

      {/* Host / Co-host moderation controls.
          Quick actions stay visible; policy switches + destructive actions
          collapse behind a disclosure so the participant list keeps its space. */}
      {(canMuteAll || canToggleSelfUnmute || canManageLock || canEndLive || canManageStudentShare || canManageMemberRecording || isHost) && (
        <div className="flex shrink-0 flex-col gap-2 border-b border-[#E5E5E5] bg-gray-50/90 p-2.5">
          <h3 className="sr-only">{pl.quickActions}</h3>
          <div className="flex items-center gap-2">
            {canMuteAll && (
              <button
                onClick={handleMuteAll}
                disabled={isMutingAll}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold text-red-700 bg-red-50/80 hover:bg-red-100 border border-red-200/80 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/40"
              >
                <MicOff size={15} className="text-red-500 shrink-0" aria-hidden="true" />
                <span>{pl.muteAll}</span>
              </button>
            )}

            <button
              onClick={handleLowerAllHands}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold text-amber-800 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
            >
              <Hand size={15} className="text-amber-500 shrink-0" aria-hidden="true" />
              <span>{pl.lowerAllHands}{raisedHandParticipants.length > 0 ? ` (${raisedHandParticipants.length})` : ""}</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white">
            <button
              type="button"
              onClick={() => setManagementOpen((prev) => !prev)}
              aria-expanded={managementOpen}
              aria-controls="participant-management-options"
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cath-red-700/40"
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-700">
                <Settings2 size={15} className="text-neutral-500" aria-hidden="true" />
                {pl.management}
              </span>
              <span className="inline-flex items-center gap-1.5">
                {isLocked && (
                  <span
                    title={pl.lockRoom}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600"
                  >
                    <Lock size={11} aria-hidden="true" />
                    <span className="sr-only">{pl.lockRoom}</span>
                  </span>
                )}
                <motion.span
                  animate={{ rotate: managementOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-neutral-400"
                >
                  <ChevronDown size={16} aria-hidden="true" />
                </motion.span>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {managementOpen && (
                <motion.div
                  id="participant-management-options"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-1.5 border-t border-neutral-100 p-2.5">
                    <span className="px-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                      {pl.groupStudentPermissions || "Quyền học viên"}
                    </span>

                    {canToggleSelfUnmute && (
                      <PolicyRow
                        icon={<Mic size={14} aria-hidden="true" />}
                        label={pl.allowSelfUnmute}
                        checked={allowSelfUnmute}
                        disabled={isTogglingSelfUnmute}
                        onChange={handleToggleSelfUnmute}
                      />
                    )}

                    {/* Ticket 05: student share gate (manage_student_share) — default mở. */}
                    {canManageStudentShare && (
                      <PolicyRow
                        icon={<MonitorUp size={14} aria-hidden="true" />}
                        label={pl.allowStudentShare}
                        checked={allowStudentShare}
                        disabled={isTogglingStudentShare}
                        onChange={handleToggleStudentShare}
                      />
                    )}

                    {/* Moved from the old "Chung" settings tab. */}
                    {canManagePrivateAi && (
                      <PolicyRow
                        icon={<MessageSquareOff size={14} aria-hidden="true" />}
                        label={gt.allowMemberPrivateAi || "Cho phép thành viên sử dụng AI Chat riêng tư"}
                        description={gt.allowMemberPrivateAiDesc}
                        checked={memberPrivateAiAllowed}
                        onChange={handleToggleMemberPrivateAi}
                      />
                    )}

                    {canManageGame && (
                      <PolicyRow
                        icon={<Gamepad2 size={14} aria-hidden="true" />}
                        label={gt.allowGame || "Cho phép trò chơi trong phòng"}
                        description={gt.allowGameDesc}
                        checked={allowGame}
                        disabled={isTogglingGame}
                        onChange={handleToggleGame}
                      />
                    )}

                    <span className="px-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                      {pl.groupRoomSecurity || "Phòng & ghi hình"}
                    </span>

                    {/* Ticket 04: lock toggle (lock_class) — khóa thì chặn người mới, người trong phòng ở lại. */}
                    {canManageLock && (
                      <PolicyRow
                        icon={
                          isLocked ? (
                            <Lock size={14} className="text-cath-red-700" aria-hidden="true" />
                          ) : (
                            <LockOpen size={14} aria-hidden="true" />
                          )
                        }
                        label={pl.lockRoom}
                        checked={isLocked}
                        disabled={isTogglingLock}
                        onChange={handleToggleLock}
                        colorClass="peer-checked:bg-cath-red-700"
                      />
                    )}

                    {/* Ticket 05: member recording gate, server-side (record). */}
                    {canManageMemberRecording && (
                      <PolicyRow
                        icon={<CircleDot size={14} aria-hidden="true" />}
                        label={pl.allowMemberRecording}
                        description={gt.allowMemberRecordingDesc}
                        checked={allowMemberRecording}
                        disabled={isTogglingMemberRecording}
                        onChange={handleToggleMemberRecording}
                      />
                    )}

                    {canManageHighQuality && (
                      <PolicyRow
                        icon={<Gauge size={14} aria-hidden="true" />}
                        label={gt.allowHighQuality || "Chế độ chất lượng cao (720p)"}
                        description={gt.allowHighQualityDesc}
                        checked={roomHighQuality === true}
                        disabled={isTogglingHighQuality}
                        onChange={handleToggleHighQuality}
                      />
                    )}

                    {(canMuteAll || isHost) && (
                      <button
                        type="button"
                        onClick={handleRestrictVoiceAll}
                        disabled={isRestrictingVoiceAll}
                        className="mt-0.5 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-orange-200/80 bg-orange-50/70 px-3 text-xs font-semibold text-orange-700 transition-all hover:bg-orange-100 active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
                      >
                        <MicOff size={15} className="shrink-0 text-orange-500" aria-hidden="true" />
                        <span>{pl.restrictVoiceAll}</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ticket 04: end live for all (end_class) — chỉ end session live, join lại tạo phiên mới. */}
          {canEndLive && (
            <button
              type="button"
              onClick={() => setEndLiveConfirmOpen(true)}
              disabled={isEndingLive}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 transition-all hover:bg-red-50 active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/40"
            >
              <PhoneOff size={15} className="shrink-0 rotate-[135deg]" aria-hidden="true" />
              <span>{pl.endLive}</span>
            </button>
          )}
        </div>
      )}
      {(!(canViewWaiting || canViewBanned) || activeTab === "members") && (
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

      {/* "Bị cấm" tab — host or co-host with remove_student/mute_all. */}
      {canViewBanned && activeTab === "banned" && (
        <div className="flex-1 overflow-y-auto p-3">
          <BannedListTab />
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
        title={pl.confirmMuteAllTitle || pl.muteAll}
        message={pl.confirmMuteAll}
        confirmText={pl.muteAll}
        confirmVariant="destructive"
      />

      {/* Ticket 04: end-live confirm — mọi người về màn hình kết thúc, join lại tạo phiên mới. */}
      <ConfirmationModal
        open={endLiveConfirmOpen}
        onClose={() => setEndLiveConfirmOpen(false)}
        onConfirm={confirmEndLive}
        title={pl.confirmEndLiveTitle || pl.endLive}
        message={pl.confirmEndLive}
        confirmText={pl.endLive}
        confirmVariant="destructive"
      />

      <ConfirmationModal
        open={lowerHandsConfirmOpen}
        onClose={() => setLowerHandsConfirmOpen(false)}
        onConfirm={confirmLowerAllHands}
        title={pl.confirmLowerHandsTitle || pl.lowerAllHands}
        message={pl.confirmLowerHands.replace("{count}", String(raisedHandParticipants.length))}
        confirmText={pl.lowerAllHands}
        confirmVariant="default"
        isPending={isLoweringHands}
      />

      <ConfirmationModal
        open={restrictVoiceAllConfirmOpen}
        onClose={() => setRestrictVoiceAllConfirmOpen(false)}
        onConfirm={confirmRestrictVoiceAll}
        title={pl.confirmRestrictVoiceAllTitle || pl.restrictVoiceAll}
        message={pl.confirmRestrictVoiceAll.replace("{count}", String(voiceRestrictAllCount))}
        confirmText={pl.restrictVoiceAll}
        confirmVariant="destructive"
        isPending={isRestrictingVoiceAll}
      />
    </div>
  );
}

export default ParticipantList
