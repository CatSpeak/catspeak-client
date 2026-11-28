import { useState, useCallback, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import {
  useStartRecordingMutation,
  useStopRecordingMutation,
} from "@/store/api/recordingsApi"
import { setPiP } from "@/store/slices/videoCallSlice"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getNavigate } from "@/features/video-call/hooks/useNavigateRef"
import { useGlobalTask } from "@/shared/hooks/useGlobalTask.jsx"
import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures"
import { PLAN_FEATURES } from "@/shared/constants/planFeatures"
import { isSpeakingTimeBalanceSupported } from "@/features/video-call/utils/roomTypeHelpers"
import {
  hasCoHostPermission,
  CO_HOST_PERMISSIONS,
} from "@/features/co-host/constants"
import PillButton from "@/shared/components/ui/buttons/PillButton"

/**
 * useRecording — manages recording state for a video call session.
 *
 * @param {object|null} lkRoom - LiveKit Room object from useRoomContext().
 *                                The room name is sent to the backend so it
 *                                can target the correct LiveKit Egress.
 * @returns recording state and toggle handler
 */
export function useRecording(lkRoom = null, syncState = {}) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { t } = useLanguage()
  const { startTask } = useGlobalTask()
  const {
    isRecording,
    setIsRecording,
    egressId,
    setEgressId,
    startedByAccountId,
    setStartedByAccountId,
    sessionId,
  } = syncState

  const [isTogglingRecording, setIsTogglingRecording] = useState(false)
  const [showStopModal, setShowStopModal] = useState(false)

  const [startRecording] = useStartRecordingMutation()
  const [stopRecording] = useStopRecordingMutation()
  const { hasFeature, isPro: isPlanPro, isLoading: isPlanLoading } =
    usePlanFeatures()

  const room = syncState?.room ?? null
  const isClassRoom =
    isSpeakingTimeBalanceSupported(room) ||
    String(room?.roomType || "").toLowerCase() === "class"
  const isTeacher = user?.accountType === "Teacher"
  const isPro =
    Boolean(user?.isPro || user?.tier?.toLowerCase() === "pro") ||
    Boolean(isPlanPro)
  // Personal recording privilege (Pro / ALLOW_RECORDING / Teacher in class).
  // A Group/Temporary room host does NOT gain recording rights from `isHost`.
  // While the plan query is still loading we fail open to the server check
  // instead of flashing a false "upgrade" prompt.
  const hasPersonalRecordPrivilege = isPlanLoading
    ? true
    : Boolean(
        isPro ||
          hasFeature(PLAN_FEATURES.ALLOW_RECORDING) ||
          (isTeacher && isClassRoom),
      )

  const showProUpgradeToast = useCallback(() => {
    const message =
      t.recordings?.errors?.proRequired ||
      t.recordings?.planRequired ||
      "Recording is a Pro feature. Upgrade to Pro to record this call."
    const upgradeLabel =
      t.recordings?.upgradeToPro ||
      t.billing?.pricing?.upgradeToPro ||
      "Upgrade to Pro"
    toast(
      (tToast) => (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {message}
          </span>
          <PillButton
            variant="snackbar"
            className="self-start"
            onClick={() => {
              window.open("/pricing", "_blank", "noopener,noreferrer")
              toast.dismiss(tToast.id)
            }}
          >
            {upgradeLabel}
          </PillButton>
        </div>
      ),
      { duration: 8000 },
    )
  }, [t])

  const handleToggleRecording = useCallback(async () => {
    const roomName = lkRoom?.name ?? null

    if (!roomName) {
      toast.error(
        t.recordings?.errors?.noRoom || "No active room — cannot record.",
      )
      return
    }

    const isHost = syncState?.isHost
    const coHost = syncState?.coHost ?? null
    const localAccountId = syncState?.accountId

    // ISS-81: Free users (including Group/Temporary room hosts) must never hit
    // POST /start-recording; short-circuit with a Pro upgrade prompt instead.
    if (!isRecording && !hasPersonalRecordPrivilege) {
      showProUpgradeToast()
      return
    }

    // Ticket 02: the member recording gate is read from the room-state cache
    // (passed in via syncState). Host or co-host with record always bypass
    // (shared recording); anyone else may record only while the gate is open.
    const allowMemberRecording = syncState?.allowMemberRecording ?? true
    const canSharedRecord =
      isHost ||
      isTeacher ||
      isPro ||
      hasCoHostPermission(coHost, localAccountId, CO_HOST_PERMISSIONS.RECORD)

    if (!isRecording && !canSharedRecord && !allowMemberRecording) {
      toast.error(
        t.rooms?.videoCall?.participantList?.memberRecordingBlocked ||
          t.rooms?.videoCall?.recordingDisabledByHost ||
          "Chỉ Pro hoặc Giảng viên mới được phép ghi hình."
      )
      return
    }

    // Ticket 05: stop gate (UX nicety — the server re-checks creator /
    // starter / record on confirm). Block only when we positively know
    // this is someone else's recording; otherwise let the server decide.
    if (isRecording && !canSharedRecord && startedByAccountId != null && localAccountId != null) {
      if (String(startedByAccountId) !== String(localAccountId)) {
        toast.error(
          t.rooms?.videoCall?.participantList?.forbiddenRecord ||
            "Bạn không có quyền dừng ghi hình."
        )
        return
      }
    }

    setIsTogglingRecording(true)

    try {
      if (!isRecording) {
        // ── START recording ────────────────────────────────────────────
        let hasMedia = false
        if (lkRoom) {
          if (lkRoom.localParticipant?.trackPublications?.size > 0) {
            hasMedia = true
          } else if (lkRoom.remoteParticipants) {
            lkRoom.remoteParticipants.forEach((p) => {
              if (p.trackPublications?.size > 0) {
                hasMedia = true
              }
            })
          }
        }

        if (!hasMedia) {
          toast.error(
            t.recordings?.errors?.noMedia ||
              "Please turn on your camera, microphone, or share your screen before recording.",
          )
          setIsTogglingRecording(false)
          return
        }

        console.log(
          "[Recording Debug] Starting recording for room:",
          roomName,
          "sessionId:",
          sessionId,
        )
        const result = await startRecording({ roomName, sessionId }).unwrap()
        console.log(
          "[Recording Debug] Start response:",
          JSON.stringify(result),
        )
        console.log("[Recording Debug] egressId received:", result.egressId)

        if (!result.egressId) {
          console.error(
            "[Recording Debug] ⚠️ Backend returned no egressId! Full response:",
            result,
          )
          toast.error(
            t.recordings?.errors?.noEgress ||
              "Recording started but no egress ID received — stop may not work.",
          )
        }

        if (setEgressId) setEgressId(result.egressId)
        if (setIsRecording) setIsRecording(true)
        if (setStartedByAccountId)
          setStartedByAccountId(lkRoom?.localParticipant?.identity)

        toast.success(
          t.recordings?.actions?.startSuccess || "Recording started",
          {
            icon: "🔴",
            duration: 3000,
          },
        )
      } else {
        // ── STOP recording ─────────────────────────────────────────────
        console.log(
          "[Recording Debug] Intent to stop recording. egressId:",
          egressId,
        )

        if (!egressId) {
          console.error(
            "[Recording Debug] ⚠️ egressId is null — stop call will NOT be sent to backend!",
          )
          if (setIsRecording) setIsRecording(false)
          return
        }

        setShowStopModal(true)
      }
    } catch (err) {
      const status = err?.status
      const errorCode = err?.data?.errorCode

      // ── 403 Forbidden — Pro/Teacher recording gate (ISS-81) ────────
      if (status === 403 || errorCode === "RECORDING_PRO_REQUIRED") {
        showProUpgradeToast()
        return
      }

      // ── 409 Conflict — storage quota exceeded ──────────────────────
      if (status === 409 || errorCode === "RECORDING_STORAGE_QUOTA_EXCEEDED") {
        const quotaMsg =
          err?.data?.message ||
          t.recordings?.storage?.quotaExceeded ||
          "Storage quota exceeded. Please delete some recordings to free up space."
        toast.error(quotaMsg, {
          icon: "⚠️",
          duration: 6000,
        })
        console.warn("[Recording] Quota exceeded:", quotaMsg)
        return
      }

      const msg =
        err?.data?.message ||
        err?.data ||
        t.recordings?.list?.error ||
        "Failed to process recording."
      toast.error(msg)
      console.error("[Recording] toggle error:", err)
    } finally {
      setIsTogglingRecording(false)
    }
  }, [
    lkRoom,
    isRecording,
    isTogglingRecording,
    startRecording,
    stopRecording,
    egressId,
    setIsRecording,
    setEgressId,
    setStartedByAccountId,
    sessionId,
    startedByAccountId,
    syncState,
    t,
    hasPersonalRecordPrivilege,
    isPro,
    isTeacher,
    showProUpgradeToast,
  ])

  const confirmStopRecording = async () => {
    setShowStopModal(false)
    setIsTogglingRecording(true)
    try {
      if (egressId) {
        const targetEgressId = egressId;
        startTask({
          id: targetEgressId,
          title: t?.uploadWidget?.recordingTitle || "Bản ghi hình cuộc họp",
          taskType: "VideoRecording",
          taskFn: async () => {
            return await stopRecording(targetEgressId).unwrap();
          },
        });
      }
      if (setEgressId) setEgressId(null)
      if (setIsRecording) setIsRecording(false)
      if (setStartedByAccountId) setStartedByAccountId(null)

      toast(
        (tToast) => {
          const navigate = getNavigate()
          return (
            <div className="flex items-start gap-3">
              <span className="mt-0.5">⏹️</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t.recordings?.actions?.stopSuccess ||
                    "Recording saved in My Workspace"}
                </span>
                <PillButton
                  variant="snackbar"
                  onClick={() => {
                    dispatch(setPiP(true))
                    if (navigate) {
                      navigate("/workspace/recordings")
                    }
                    toast.dismiss(tToast.id)
                  }}
                  className="mt-1"
                >
                  {t.recordings?.actions?.viewRecordings || "View Recordings"}
                </PillButton>
              </div>
            </div>
          )
        },
        { duration: 6000 },
      )
    } catch (err) {
      toast.error(t.recordings?.list?.error || "Failed to process recording.")
      console.error("[Recording] confirm stop error:", err)
    } finally {
      setIsTogglingRecording(false)
    }
  }

  const cancelStopRecording = () => {
    setShowStopModal(false)
  }

  return {
    isRecording,
    isTogglingRecording,
    hasPersonalRecordPrivilege,
    handleToggleRecording,
    showStopModal,
    confirmStopRecording,
    cancelStopRecording,
  }
}
