import React, { useMemo } from "react"
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  UserPlus,
  Ellipsis,
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
  Search,
  X,
  AlertTriangle,
  UserCheck,
} from "lucide-react"
import { useIsSpeaking } from "@livekit/components-react"
import { useDispatch } from "react-redux"
import { leaveCall as leaveCallAction } from "@/store/slices/videoCallSlice"
import { useLanguage } from "@/shared/context/LanguageContext"
import Avatar from "@/shared/components/ui/Avatar"
import ListItem from "@/shared/components/ui/ListItem"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost, isCustomRoom } from "@/features/video-call/utils/roomTypeHelpers"
import {
  markLocalEndLive,
  resetLocalEndLive,
} from "@/features/video-call/utils/endLiveIntent"
import { ParticipantActionPopover } from "./ParticipantActionPopover"
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
  useCameraOffAllMutation,
  useGetRoomStateQuery,
  useUpdateSelfUnmutePolicyMutation,
  useUpdateSelfCameraPolicyMutation,
  useGetWaitingQueueQuery,
  useUpdateRoomLockMutation,
  useEndLiveSessionMutation,
  useUpdateStudentSharePolicyMutation,
  useUpdateMemberRecordingPolicyMutation,
  useUpdateGamePolicyMutation,
  useUpdateHighQualityPolicyMutation,
  useUpdateRequireApprovalPolicyMutation,
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
import { normalizeWaitingQueue } from "./waiting/waitingUtils"

/**
 * A single row in the participant list.
 * Uses LiveKit Participant object properties directly.
 */
const ParticipantItem = ({ participant }) => {
  const { t } = useLanguage()
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
        <Motion.div
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
        </Motion.div>
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
  // Custom=4 (backend enum) dùng copy phòng/thành viên. Class=3 giữ học viên/
  // buổi live. Group/1-1 giữ nguyên copy cũ (Q1-B, Q5-A).
  const isCustom = isCustomRoom(room?.roomType)

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }

  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants
    const q = searchQuery.toLowerCase().trim()
    return participants.filter((p) => {
      const name = (p.name || p.identity || "").toLowerCase()
      const meta = parseMetadata(p.metadata)
      const accountId = String(meta.accountId || "")
      return name.includes(q) || accountId.includes(q)
    })
  }, [participants, searchQuery])

  const raisedHandParticipants = useMemo(() => {
    return filteredParticipants.filter((p) => {
      const meta = parseMetadata(p.metadata)
      return meta.handRaised === true
    })
  }, [filteredParticipants])

  const otherParticipants = useMemo(() => {
    return filteredParticipants.filter((p) => {
      const meta = parseMetadata(p.metadata)
      return meta.handRaised !== true
    })
  }, [filteredParticipants])

  const totalRaisedHands = useMemo(() => {
    return participants.filter((p) => {
      const meta = parseMetadata(p.metadata)
      return meta.handRaised === true
    }).length
  }, [participants])

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
  // Ticket 02: camera self-toggle is a separate code (allow_self_camera).
  const canToggleSelfCamera =
    isHost ||
    hasCoHostPermission(
      coHost,
      user?.accountId,
      CO_HOST_PERMISSIONS.ALLOW_SELF_CAMERA
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
  })
  const pendingCount =
    normalizeWaitingQueue(waitingQueueData)?.pendingCount ??
    normalizeWaitingQueue(waitingQueueData)?.pending?.length ??
    0

  const [muteAllApi, { isLoading: isMutingAll }] =
    useMuteAllParticipantsMutation()
  const [cameraOffAllApi, { isLoading: isCameraOffAll }] =
    useCameraOffAllMutation()
  const [cameraOffAllConfirmOpen, setCameraOffAllConfirmOpen] =
    React.useState(false)
  // Ticket 01: policy comes from the room-state cache (single store).
  const { data: roomState } = useGetRoomStateQuery(roomId, {
    skip: !roomId,
  })
  const [updateSelfUnmute, { isLoading: isTogglingSelfUnmute }] =
    useUpdateSelfUnmutePolicyMutation()
  const [updateSelfCamera, { isLoading: isTogglingSelfCamera }] =
    useUpdateSelfCameraPolicyMutation()
  const roomStatePayload = roomState?.data ?? roomState
  const allowSelfUnmute = roomStatePayload?.settings?.allowSelfUnmute ?? true
  const allowSelfCamera = roomStatePayload?.settings?.allowSelfCamera ?? true

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

  // Ticket 03: room-scope "tắt camera toàn bộ" — server mutes every published
  // camera track (sender/host spared); broadcast is a UX hint only.
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
          ? isCustom
            ? pl.selfUnmuteOnRoom || pl.selfUnmuteOn
            : pl.selfUnmuteOn
          : isCustom
            ? pl.selfUnmuteOffRoom || pl.selfUnmuteOff
            : pl.selfUnmuteOff,
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

  // Ticket 02: student self-camera gate (mirrors self-unmute).
  const handleToggleSelfCamera = async () => {
    if (!roomId) return
    try {
      const next = !allowSelfCamera
      await updateSelfCamera({ id: roomId, allow: next }).unwrap()
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({ action: "SELF_CAMERA_POLICY", allow: next })
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
          ? isCustom
            ? pl.selfCameraOnRoom || pl.selfCameraOn
            : pl.selfCameraOn
          : isCustom
            ? pl.selfCameraOffRoom || pl.selfCameraOff
            : pl.selfCameraOff,
      )
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenSelfCamera
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
  // Ticket 03: room-scope "tắt camera toàn bộ" is gated by camera_toggle.
  const canCameraOffAll =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.CAMERA_TOGGLE)

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
  const [updateStudentShare, { isLoading: isTogglingStudentShare }] =
    useUpdateStudentSharePolicyMutation()
  const allowStudentShare = roomStatePayload?.settings?.allowStudentShare ?? true
  const [updateMemberRecording, { isLoading: isTogglingMemberRecording }] =
    useUpdateMemberRecordingPolicyMutation()
  const allowMemberRecording =
    roomStatePayload?.settings?.allowMemberRecording ?? true
  // Ticket 03: lock state is read from the room-state cache (single store).
  const isLocked = roomStatePayload?.settings?.roomLocked ?? false
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

  // Ticket 04: pre-join require-approval gate (host-only, default off).
  const requireApproval = roomStatePayload?.settings?.requireApproval ?? false
  const [updateRequireApproval, { isLoading: isTogglingRequireApproval }] =
    useUpdateRequireApprovalPolicyMutation()
  const canManageRequireApproval = isHost

  const handleToggleRequireApproval = async () => {
    if (!roomId) return
    try {
      const next = !requireApproval
      await updateRequireApproval({ id: roomId, requireApproval: next }).unwrap()
      toast.success(
        next
          ? pl.requireApprovalOn || "Đã bật duyệt thủ công khi vào phòng."
          : pl.requireApprovalOff || "Đã tắt duyệt thủ công khi vào phòng.",
      )
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenRequireApproval || pl.forbiddenLock,
        ),
      )
    }
  }

  const confirmEndLive = async () => {    setEndLiveConfirmOpen(false)
    if (!roomId) return
    // Suppress the participant-facing "host ended" toast for this client while
    // the backend tears the room down (see endLiveIntent).
    markLocalEndLive()
    try {
      await endLiveApi(roomId).unwrap()
    } catch (err) {
      resetLocalEndLive()
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          isCustom ? pl.forbiddenEndRoom || pl.forbiddenEnd : pl.forbiddenEnd,
        ),
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
    toast.success(isCustom ? pl.endLiveSuccessRoom || pl.endLiveSuccess : pl.endLiveSuccess)
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
          ? isCustom
            ? pl.studentShareOnRoom || pl.studentShareOn
            : pl.studentShareOn
          : isCustom
            ? pl.studentShareOffRoom || pl.studentShareOff
            : pl.studentShareOff,
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
          ? isCustom
            ? pl.memberRecordingOnRoom || pl.memberRecordingOn
            : pl.memberRecordingOn
          : isCustom
            ? pl.memberRecordingOffRoom || pl.memberRecordingOff
            : pl.memberRecordingOff,
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
  // Ticket 03: Game is host-only — co-hosts neither see nor operate it.
  const canManageGame = isHost
  // High quality is host-only server-side (co-hosts never get the override).
  const canManageHighQuality = isHost

  const canManagePolicies =
    isHost ||
    canMuteAll ||
    canToggleSelfUnmute ||
    canToggleSelfCamera ||
    canManageLock ||
    canEndLive ||
    canManageStudentShare ||
    canManageMemberRecording ||
    canManageGame

  React.useEffect(() => {
    if (activeTab === "settings" && !canManagePolicies) {
      setActiveTab("members")
    }
    if (activeTab === "waiting" && !canViewWaiting) {
      setActiveTab("members")
    }
    if (activeTab === "banned" && !canViewBanned) {
      setActiveTab("members")
    }
  }, [activeTab, canManagePolicies, canViewWaiting, canViewBanned])

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

  const [updateGamePolicy, { isLoading: isTogglingGame }] =
    useUpdateGamePolicyMutation()
  // Ticket 03: game policy is read from the room-state cache (no standalone GET).
  const serverAllowGame = roomStatePayload?.settings?.allowGame ?? true
  const [allowGame, setAllowGame] = React.useState(true)
  React.useEffect(() => {
    setAllowGame(serverAllowGame)
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
        res?.data?.loweredCount ?? res?.loweredCount ?? totalRaisedHands
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
      } catch {
        /* ignore broadcast errors */
      }
      const restrictedCount =
        res?.data?.restrictedCount ?? res?.restrictedCount ?? voiceRestrictAllCount
      toast.success(
        (isCustom
          ? pl.successRestrictVoiceAllRoom || pl.successRestrictVoiceAll
          : pl.successRestrictVoiceAll
        ).replace("{count}", String(restrictedCount)),
      )
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
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-neutral-200/80 px-2.5 py-1.5 bg-white shrink-0 gap-1.5">
        {canViewWaiting || canViewBanned || canManagePolicies ? (
          <div
            className="flex items-center gap-1 overflow-x-auto scrollbar-hidden flex-1 min-w-0"
            role="tablist"
            aria-label={pl.membersTab || pl.title}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "members"}
              onClick={() => setActiveTab("members")}
              className={`shrink-0 rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
                activeTab === "members"
                  ? "bg-cath-red-700 text-white shadow-xs"
                  : "text-neutral-600 hover:bg-cath-red-700/[0.08] hover:text-cath-red-700"
              }`}
            >
              {pl.membersTab || pl.title} ({participants.length})
            </button>

            {canViewWaiting && (
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "waiting"}
                onClick={() => setActiveTab("waiting")}
                className={`shrink-0 rounded-lg px-2 py-1 text-xs font-semibold transition-all flex items-center gap-1 ${
                  activeTab === "waiting"
                    ? "bg-cath-red-700 text-white shadow-xs"
                    : "text-neutral-600 hover:bg-cath-red-700/[0.08] hover:text-cath-red-700"
                }`}
              >
                <span>{t?.rooms?.videoCall?.waitingQueue?.tab || "Chờ"}</span>
                {pendingCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === "waiting"
                        ? "bg-white text-cath-red-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {canViewBanned && (
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "banned"}
                onClick={() => setActiveTab("banned")}
                className={`shrink-0 rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
                  activeTab === "banned"
                    ? "bg-cath-red-700 text-white shadow-xs"
                    : "text-neutral-600 hover:bg-cath-red-700/[0.08] hover:text-cath-red-700"
                }`}
              >
                {pl.bannedTabShort || "Bị cấm"}
              </button>
            )}

            {canManagePolicies && (
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "settings"}
                onClick={() => setActiveTab("settings")}
                className={`shrink-0 rounded-lg px-2 py-1 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "settings"
                    ? "bg-cath-red-700 text-white shadow-xs"
                    : "text-neutral-600 hover:bg-cath-red-700/[0.08] hover:text-cath-red-700"
                }`}
              >
                <Settings2 size={13} className="shrink-0" />
                <span>{pl.settingsTab || "Cài đặt"}</span>
                {isLocked && (
                  <span
                    className={`flex h-1.5 w-1.5 rounded-full shrink-0 ${
                      activeTab === "settings" ? "bg-white" : "bg-cath-red-700"
                    }`}
                  />
                )}
              </button>
            )}
          </div>
        ) : !hideTitle ? (
          <span className="text-xs font-bold text-neutral-800 px-1 truncate flex-1">
            {pl.membersTab || pl.title} ({participants.length})
          </span>
        ) : (
          <div className="flex-1" />
        )}

        {/* Invite action button separated from tabs */}
        <div className="flex items-center shrink-0 pl-1.5 border-l border-neutral-200/80">
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-cath-red-700 hover:text-white bg-cath-red-700/10 hover:bg-cath-red-700 active:scale-[0.95] transition-all shadow-xs shrink-0"
            title={t.rooms?.videoCall?.inviteParticipant || "Mời tham gia phòng"}
            aria-label={t.rooms?.videoCall?.inviteParticipant || "Mời tham gia phòng"}
          >
            <UserPlus size={14} />
          </button>
        </div>
      </div>

      {/* Tab 1: Members */}
      {activeTab === "members" && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Integrated Search Input (only when room has > 5 participants or active query) */}
          {(participants.length > 5 || searchQuery) && (
            <div className="px-2.5 pt-2 shrink-0">
              <div className="relative flex items-center">
                <Search size={13} className="absolute left-2.5 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={pl.searchPlaceholder || "Tìm theo tên..."}
                  className="w-full h-7.5 pl-8 pr-7 text-xs bg-neutral-100/90 hover:bg-neutral-100 focus:bg-white border border-transparent focus:border-cath-red-700 rounded-lg outline-none transition-all placeholder:text-neutral-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 text-neutral-400 hover:text-neutral-600 p-0.5"
                    aria-label="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Thao tác nâng cao — luôn hiển thị, lưới 2 cột */}
          {(isHost || canMuteAll || canCameraOffAll) && (
            <div className="px-2.5 pt-2 shrink-0">
              <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-2">
                <span className="px-0.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  {pl.advancedActions || "Thao tác nâng cao"}
                </span>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {(isHost || canMuteAll) && (
                    <button
                      type="button"
                      onClick={handleMuteAll}
                      disabled={isMutingAll}
                      title={pl.muteAll}
                      aria-label={pl.muteAll}
                      className="inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-2 text-[11px] font-semibold text-neutral-700 transition-all hover:border-red-200 hover:bg-red-50 hover:text-cath-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MicOff size={13} className="shrink-0" />
                      <span className="truncate">{pl.muteAll}</span>
                    </button>
                  )}

                  {canCameraOffAll && (
                    <button
                      type="button"
                      onClick={() => setCameraOffAllConfirmOpen(true)}
                      disabled={isCameraOffAll}
                      title={pl.cameraOffAll}
                      aria-label={pl.cameraOffAll}
                      className="inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-2 text-[11px] font-semibold text-neutral-700 transition-all hover:border-red-200 hover:bg-red-50 hover:text-cath-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <VideoOff size={13} className="shrink-0" />
                      <span className="truncate">{pl.cameraOffAll}</span>
                    </button>
                  )}

                  {(isHost || canMuteAll) && (
                    <button
                      type="button"
                      onClick={handleLowerAllHands}
                      disabled={totalRaisedHands === 0}
                      title={pl.lowerAllHands}
                      aria-label={pl.lowerAllHands}
                      className="inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-2 text-[11px] font-semibold text-neutral-700 transition-all hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Hand size={13} className="shrink-0" />
                      <span className="truncate">{pl.lowerAllHands}</span>
                      {totalRaisedHands > 0 && (
                        <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-bold text-amber-800">
                          {totalRaisedHands}
                        </span>
                      )}
                    </button>
                  )}

                  {(isHost || canMuteAll) && (
                    <button
                      type="button"
                      onClick={handleRestrictVoiceAll}
                      disabled={isRestrictingVoiceAll}
                      title={pl.restrictVoiceAll}
                      aria-label={pl.restrictVoiceAll}
                      className="inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-2 text-[11px] font-semibold text-neutral-700 transition-all hover:border-red-200 hover:bg-red-50 hover:text-cath-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ShieldAlert size={13} className="shrink-0" />
                      <span className="truncate">{pl.restrictVoiceAll}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Participant list items */}
          <div className="flex-1 overflow-y-auto p-1.5">
            {/* Empty search */}
            {filteredParticipants.length === 0 && searchQuery && (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
                <Search size={24} className="text-neutral-300" />
                <span className="text-xs text-neutral-500">
                  {pl.noSearchResults || "Không tìm thấy thành viên nào."}
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-cath-red-700 font-medium hover:underline"
                >
                  Xóa tìm kiếm
                </button>
              </div>
            )}

            {/* Section: Đang giơ tay */}
            {raisedHandParticipants.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-600 gap-1.5">
                  <Hand size={12} className="text-amber-500" />
                  <span>{pl.raisedHandsSection || "Đang giơ tay"} ({raisedHandParticipants.length})</span>
                </div>
                <ul className="flex flex-col gap-1">
                  {raisedHandParticipants.map((participant) => (
                    <li key={participant.identity} className="w-full rounded-xl bg-amber-50/30">
                      <ParticipantActionPopover participant={participant}>
                        <ParticipantItem participant={participant} />
                      </ParticipantActionPopover>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Divider between sections */}
            {raisedHandParticipants.length > 0 && otherParticipants.length > 0 && (
              <div className="my-2 mx-1 border-t border-neutral-100" />
            )}

            {/* Section: Các thành viên khác */}
            {otherParticipants.length > 0 && (
              <div>
                {raisedHandParticipants.length > 0 && (
                  <div className="flex items-center px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    <span>{pl.membersSection || "Thành viên trong phòng"} ({otherParticipants.length})</span>
                  </div>
                )}
                <ul className="flex flex-col gap-1">
                  {otherParticipants.map((participant) => (
                    <li key={participant.identity} className="w-full">
                      <ParticipantActionPopover participant={participant}>
                        <ParticipantItem participant={participant} />
                      </ParticipantActionPopover>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Waiting Queue */}
      {canViewWaiting && activeTab === "waiting" && (
        <div className="flex-1 overflow-y-auto">
          <WaitingQueueTab roomId={roomId} externalPending={externalPending} />
        </div>
      )}

      {/* Tab 3: Banned List */}
      {canViewBanned && activeTab === "banned" && (
        <div className="flex-1 overflow-y-auto p-3">
          <BannedListTab />
        </div>
      )}

      {/* Tab 4: Settings & Policies */}
      {canManagePolicies && activeTab === "settings" && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
          {isLocked && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50/60 border border-cath-red-700/20 px-3 py-2 text-xs font-semibold text-cath-red-700">
              <Lock size={14} className="shrink-0 text-cath-red-700" />
              <span>Phòng đang được khóa. Người dùng mới sẽ vào hàng đợi chờ duyệt.</span>
            </div>
          )}

          {/* Group 1: Quyền học viên (Class) / Quyền thành viên (Custom) */}
          <div className="flex flex-col gap-2">
            <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              {isCustom
                ? pl.groupStudentPermissionsRoom ||
                  pl.groupStudentPermissions ||
                  "Quyền thành viên"
                : pl.groupStudentPermissions || "Quyền học viên"}
            </span>
            <div className="flex flex-col gap-1.5">
              {canToggleSelfUnmute && (
                <PolicyRow
                  icon={<Mic size={15} aria-hidden="true" />}
                  label={
                    isCustom
                      ? pl.allowSelfUnmuteRoom ||
                        pl.allowSelfUnmute ||
                        "Cho phép thành viên tự bật mic"
                      : pl.allowSelfUnmute
                  }
                  checked={allowSelfUnmute}
                  disabled={isTogglingSelfUnmute}
                  onChange={handleToggleSelfUnmute}
                />
              )}
              {canToggleSelfCamera && (
                <PolicyRow
                  icon={<Video size={15} aria-hidden="true" />}
                  label={
                    isCustom
                      ? pl.allowSelfCameraRoom ||
                        pl.allowSelfCamera ||
                        "Cho phép thành viên tự bật camera"
                      : pl.allowSelfCamera
                  }
                  checked={allowSelfCamera}
                  disabled={isTogglingSelfCamera}
                  onChange={handleToggleSelfCamera}
                />
              )}
              {canManageStudentShare && (
                <PolicyRow
                  icon={<MonitorUp size={15} aria-hidden="true" />}
                  label={
                    isCustom
                      ? pl.allowStudentShareRoom ||
                        pl.allowStudentShare ||
                        "Cho phép thành viên chia sẻ màn hình"
                      : pl.allowStudentShare
                  }
                  checked={allowStudentShare}
                  disabled={isTogglingStudentShare}
                  onChange={handleToggleStudentShare}
                />
              )}
              {canManagePrivateAi && (
                <PolicyRow
                  icon={<MessageSquareOff size={15} aria-hidden="true" />}
                  label={gt.allowMemberPrivateAi || "Cho phép thành viên sử dụng AI Chat riêng tư"}
                  description={gt.allowMemberPrivateAiDesc}
                  checked={memberPrivateAiAllowed}
                  onChange={handleToggleMemberPrivateAi}
                />
              )}
              {canManageGame && (
                <PolicyRow
                  icon={<Gamepad2 size={15} aria-hidden="true" />}
                  label={gt.allowGame || "Cho phép trò chơi trong phòng"}
                  description={gt.allowGameDesc}
                  checked={allowGame}
                  disabled={isTogglingGame}
                  onChange={handleToggleGame}
                />
              )}
            </div>
          </div>

          {/* Group 2: Phòng & Ghi hình */}
          <div className="flex flex-col gap-2">
            <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              {pl.groupRoomSecurity || "Phòng & ghi hình"}
            </span>
            <div className="flex flex-col gap-1.5">
              {canManageLock && (
                <PolicyRow
                  icon={
                    isLocked ? (
                      <Lock size={15} className="text-cath-red-700" aria-hidden="true" />
                    ) : (
                      <LockOpen size={15} aria-hidden="true" />
                    )
                  }
                  label={pl.lockRoom}
                  checked={isLocked}
                  disabled={isTogglingLock}
                  onChange={handleToggleLock}
                  colorClass="peer-checked:bg-cath-red-700"
                />
              )}
              {canManageRequireApproval && (
                <PolicyRow
                  icon={<UserCheck size={15} aria-hidden="true" />}
                  label={
                    pl.requireApproval ||
                    "Yêu cầu duyệt khi vào phòng"
                  }
                  description={pl.requireApprovalDesc}
                  checked={requireApproval}
                  disabled={isTogglingRequireApproval}
                  onChange={handleToggleRequireApproval}
                />
              )}
              {canManageMemberRecording && (
                <PolicyRow
                  icon={<CircleDot size={15} aria-hidden="true" />}
                  label={
                    isCustom
                      ? pl.allowMemberRecordingRoom ||
                        pl.allowMemberRecording ||
                        "Cho phép thành viên ghi hình"
                      : pl.allowMemberRecording
                  }
                  description={gt.allowMemberRecordingDesc}
                  checked={allowMemberRecording}
                  disabled={isTogglingMemberRecording}
                  onChange={handleToggleMemberRecording}
                />
              )}
              {canManageHighQuality && (
                <PolicyRow
                  icon={<Gauge size={15} aria-hidden="true" />}
                  label={gt.allowHighQuality || "Chế độ chất lượng cao (720p)"}
                  description={gt.allowHighQualityDesc}
                  checked={roomHighQuality === true}
                  disabled={isTogglingHighQuality}
                  onChange={handleToggleHighQuality}
                />
              )}
            </div>
          </div>

          {/* Group 3: Khu vực nguy hiểm */}
          {canEndLive && (
            <div className="flex flex-col gap-2 pt-1 pb-4">
              <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-cath-red-700">
                {pl.dangerZone || "Khu vực nguy hiểm"}
              </span>
              <div className="rounded-2xl border border-cath-red-700/20 bg-red-50/50 p-3 flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cath-red-700/10 text-cath-red-700 shrink-0 mt-0.5">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-semibold text-neutral-900">
                      {isCustom
                        ? pl.endLiveRoom || pl.endLive || "Kết thúc phòng"
                        : pl.endLive}
                    </span>
                    <span className="text-[11px] text-neutral-600 leading-relaxed">
                      {isCustom
                        ? pl.endLiveDescRoom ||
                          "Đóng phòng và kết thúc phiên hoạt động cho toàn bộ thành viên."
                        : pl.endLiveDesc ||
                          "Đóng phiên họp trực tiếp cho toàn bộ học viên và người tham gia."}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEndLiveConfirmOpen(true)}
                  disabled={isEndingLive}
                  className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-xl bg-cath-red-700 hover:bg-cath-red-800 active:scale-[0.98] px-3 text-xs font-semibold text-white transition-all shadow-xs disabled:opacity-50"
                >
                  <PhoneOff size={13} className="rotate-[135deg]" />
                  <span>
                    {isCustom
                      ? pl.endLiveRoom || pl.endLive || "Kết thúc phòng"
                      : pl.endLive}
                  </span>
                </button>
              </div>
            </div>
          )}
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

      {/* Ticket 03: camera-off-all confirm. */}
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

      {/* Ticket 04: end-live confirm — mọi người về màn hình kết thúc, join lại tạo phiên mới. */}
      <ConfirmationModal
        open={endLiveConfirmOpen}
        onClose={() => setEndLiveConfirmOpen(false)}
        onConfirm={confirmEndLive}
        title={
          isCustom
            ? pl.confirmEndLiveTitleRoom ||
              pl.endLiveRoom ||
              pl.confirmEndLiveTitle ||
              pl.endLive
            : pl.confirmEndLiveTitle || pl.endLive
        }
        message={
          isCustom
            ? pl.confirmEndLiveRoom || pl.confirmEndLive
            : pl.confirmEndLive
        }
        confirmText={
          isCustom
            ? pl.endLiveRoom || pl.endLive
            : pl.endLive
        }
        confirmVariant="destructive"
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
        open={restrictVoiceAllConfirmOpen}
        onClose={() => setRestrictVoiceAllConfirmOpen(false)}
        onConfirm={confirmRestrictVoiceAll}
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
                String(voiceRestrictAllCount),
              )
            : pl.confirmRestrictVoiceAll.replace("{count}", String(voiceRestrictAllCount))
        }
        confirmText={
          isCustom
            ? pl.restrictVoiceAllRoom || pl.restrictVoiceAll
            : pl.restrictVoiceAll
        }
        confirmVariant="destructive"
        isPending={isRestrictingVoiceAll}
      />
    </div>
  );
}

export default ParticipantList
