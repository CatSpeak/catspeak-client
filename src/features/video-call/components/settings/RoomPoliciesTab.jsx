import React, { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  Mic,
  Video,
  MonitorUp,
  MessageSquareOff,
  Gamepad2,
  Lock,
  LockOpen,
  UserCheck,
  CircleDot,
  Gauge,
  AlertTriangle,
  PhoneOff,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import PolicyRow from "./PolicyRow"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost, isCustomRoom } from "@/features/video-call/utils/roomTypeHelpers"
import {
  markLocalEndLive,
  resetLocalEndLive,
} from "@/features/video-call/utils/endLiveIntent"
import {
  getRoomSetting,
  setRoomSetting,
  ROOM_SETTING_KEYS,
} from "@/features/video-call/utils/roomSettingHelpers"
import { getNavigate } from "@/features/video-call/hooks/useNavigateRef"
import { leaveCall as leaveCallAction } from "@/store/slices/videoCallSlice"
import {
  useGetRoomStateQuery,
  useUpdateSelfUnmutePolicyMutation,
  useUpdateSelfCameraPolicyMutation,
  useUpdateRoomLockMutation,
  useEndLiveSessionMutation,
  useUpdateStudentSharePolicyMutation,
  useUpdateMemberRecordingPolicyMutation,
  useUpdateGamePolicyMutation,
  useUpdateHighQualityPolicyMutation,
  useUpdateRequireApprovalPolicyMutation,
} from "@/store/api/roomsApi"
import {
  hasCoHostPermission,
  CO_HOST_PERMISSIONS,
} from "@/features/co-host/constants"
import { resolveCoHostErrorMessage } from "@/features/co-host/errors"

/**
 * Tab 4: Room Policies & Host Settings.
 * Contains:
 * - Member/student permissions (mic, camera, share, AI, game)
 * - Room & recording settings (lock, require approval, member recording, 720p)
 * - Danger zone (end room for all)
 */
const RoomPoliciesTab = ({ coHost }) => {
  const { t } = useLanguage()
  const dispatch = useDispatch()
  const pl = t.rooms.videoCall.participantList
  const gt = t.rooms.videoCall.general || {}

  let navigate
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navigate = useNavigate()
  } catch {
    navigate = getNavigate()
  }

  const {
    id: roomId,
    room,
    user,
    lkRoom,
    isHost: isHostFromContext,
    roomHighQuality,
    setRoomHighQuality,
  } = useVideoCallContext()

  const isCustom = isCustomRoom(room?.roomType)
  const isHost = isHostFromContext || isRoomHost(room, user?.accountId)

  // Policy permissions
  const canToggleSelfUnmute =
    isHost ||
    hasCoHostPermission(
      coHost,
      user?.accountId,
      CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE
    )
  const canToggleSelfCamera =
    isHost ||
    hasCoHostPermission(
      coHost,
      user?.accountId,
      CO_HOST_PERMISSIONS.ALLOW_SELF_CAMERA
    )
  const canManageLock =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.LOCK_CLASS)
  const canEndLive =
    isHost ||
    hasCoHostPermission(coHost, user?.accountId, CO_HOST_PERMISSIONS.END_CLASS)
  const canManageStudentShare =
    isHost ||
    hasCoHostPermission(
      coHost,
      user?.accountId,
      CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE
    )
  const canManageMemberRecording =
    isHost ||
    hasCoHostPermission(
      coHost,
      user?.accountId,
      CO_HOST_PERMISSIONS.ALLOW_MEMBER_RECORDING
    )
  const canManageRequireApproval = isHost
  const canManagePrivateAi = isHost
  const canManageGame = isHost
  const canManageHighQuality = isHost

  // Room state cache
  const { data: roomState } = useGetRoomStateQuery(roomId, {
    skip: !roomId,
  })
  const roomStatePayload = roomState?.data ?? roomState
  const allowSelfUnmute = roomStatePayload?.settings?.allowSelfUnmute ?? true
  const allowSelfCamera = roomStatePayload?.settings?.allowSelfCamera ?? true
  const allowStudentShare = roomStatePayload?.settings?.allowStudentShare ?? true
  const allowMemberRecording =
    roomStatePayload?.settings?.allowMemberRecording ?? true
  const isLocked = roomStatePayload?.settings?.roomLocked ?? false
  const requireApproval = roomStatePayload?.settings?.requireApproval ?? false
  const serverAllowGame = roomStatePayload?.settings?.allowGame ?? true

  // Mutations
  const [updateSelfUnmute, { isLoading: isTogglingSelfUnmute }] =
    useUpdateSelfUnmutePolicyMutation()
  const [updateSelfCamera, { isLoading: isTogglingSelfCamera }] =
    useUpdateSelfCameraPolicyMutation()
  const [updateStudentShare, { isLoading: isTogglingStudentShare }] =
    useUpdateStudentSharePolicyMutation()
  const [updateMemberRecording, { isLoading: isTogglingMemberRecording }] =
    useUpdateMemberRecordingPolicyMutation()
  const [updateRoomLock, { isLoading: isTogglingLock }] =
    useUpdateRoomLockMutation()
  const [updateRequireApproval, { isLoading: isTogglingRequireApproval }] =
    useUpdateRequireApprovalPolicyMutation()
  const [updateGamePolicy, { isLoading: isTogglingGame }] =
    useUpdateGamePolicyMutation()
  const [updateHighQualityPolicy, { isLoading: isTogglingHighQuality }] =
    useUpdateHighQualityPolicyMutation()
  const [endLiveApi, { isLoading: isEndingLive }] = useEndLiveSessionMutation()

  // Local state for toggles
  const [endLiveConfirmOpen, setEndLiveConfirmOpen] = useState(false)
  const [allowGame, setAllowGame] = useState(true)
  useEffect(() => {
    setAllowGame(serverAllowGame)
  }, [serverAllowGame])

  const [memberPrivateAiAllowed, setMemberPrivateAiAllowed] = useState(() =>
    getRoomSetting(roomId, ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI)
  )

  useEffect(() => {
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

  // Handlers
  const handleToggleSelfUnmute = async () => {
    if (!roomId) return
    try {
      const next = !allowSelfUnmute
      await updateSelfUnmute({ id: roomId, allow: next }).unwrap()
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
            : pl.selfUnmuteOff
      )
    } catch (err) {
      toast.error(resolveCoHostErrorMessage(err, t, pl.forbiddenSelfUnmute))
    }
  }

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
            : pl.selfCameraOff
      )
    } catch (err) {
      toast.error(resolveCoHostErrorMessage(err, t, pl.forbiddenSelfCamera))
    }
  }

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
            : pl.studentShareOff
      )
    } catch (err) {
      toast.error(resolveCoHostErrorMessage(err, t, pl.forbiddenStudentShare))
    }
  }

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

  const handleToggleLock = async () => {
    if (!roomId) return
    try {
      const next = !isLocked
      await updateRoomLock({ id: roomId, locked: next }).unwrap()
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
      toast.success(next ? pl.lockOn : pl.lockOff)
    } catch (err) {
      toast.error(resolveCoHostErrorMessage(err, t, pl.forbiddenLock))
    }
  }

  const handleToggleRequireApproval = async () => {
    if (!roomId) return
    try {
      const next = !requireApproval
      await updateRequireApproval({ id: roomId, requireApproval: next }).unwrap()
      toast.success(
        next
          ? pl.requireApprovalOn || "Đã bật duyệt thủ công khi vào phòng."
          : pl.requireApprovalOff || "Đã tắt duyệt thủ công khi vào phòng."
      )
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          pl.forbiddenRequireApproval || pl.forbiddenLock
        )
      )
    }
  }

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
            : pl.memberRecordingOff
      )
    } catch (err) {
      toast.error(resolveCoHostErrorMessage(err, t, pl.forbiddenRecord))
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

  const confirmEndLive = async () => {
    setEndLiveConfirmOpen(false)
    if (!roomId) return
    markLocalEndLive()
    try {
      await endLiveApi(roomId).unwrap()
    } catch (err) {
      resetLocalEndLive()
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          isCustom ? pl.forbiddenEndRoom || pl.forbiddenEnd : pl.forbiddenEnd
        )
      )
      return
    }
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
    toast.success(
      isCustom ? pl.endLiveSuccessRoom || pl.endLiveSuccess : pl.endLiveSuccess
    )
    const nav = navigate ?? getNavigate()
    if (nav && window.location.pathname.includes("/meet/")) {
      nav(window.location.pathname, {
        replace: true,
        state: { callEnded: true, reason: "ended" },
      })
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 text-foreground dark:text-white">
      {isLocked && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-cath-red-700/20 dark:border-red-900/50 px-3 py-2 text-xs font-semibold text-cath-red-700 dark:text-red-400">
          <Lock size={14} className="shrink-0 text-cath-red-700 dark:text-red-400" />
          <span>
            Phòng đang được khóa. Người dùng mới sẽ vào hàng đợi chờ duyệt.
          </span>
        </div>
      )}

      {/* Group 1: Quyền học viên (Class) / Quyền thành viên (Custom) */}
      <div className="flex flex-col gap-2">
        <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-[#AAAAAA]">
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
              label={
                gt.allowMemberPrivateAi ||
                "Cho phép thành viên sử dụng AI Chat riêng tư"
              }
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
        <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-[#AAAAAA]">
          {pl.groupRoomSecurity || "Phòng & ghi hình"}
        </span>
        <div className="flex flex-col gap-1.5">
          {canManageLock && (
            <PolicyRow
              icon={
                isLocked ? (
                  <Lock
                    size={15}
                    className="text-cath-red-700 dark:text-red-400"
                    aria-hidden="true"
                  />
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
              label={pl.requireApproval || "Yêu cầu duyệt khi vào phòng"}
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
          <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-cath-red-700 dark:text-red-400">
            {pl.dangerZone || "Khu vực nguy hiểm"}
          </span>
          <div className="rounded-2xl border border-cath-red-700/20 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-3 flex flex-col gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cath-red-700/10 dark:bg-red-500/20 text-cath-red-700 dark:text-red-400 shrink-0 mt-0.5">
                <AlertTriangle size={16} />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  {isCustom
                    ? pl.endLiveRoom || pl.endLive || "Kết thúc phòng"
                    : pl.endLive}
                </span>
                <span className="text-[11px] text-neutral-600 dark:text-[#AAAAAA] leading-relaxed">
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

      {/* Confirmation Modal for End Live */}
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
    </div>
  )
}

export default RoomPoliciesTab
