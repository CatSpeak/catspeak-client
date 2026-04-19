import { useCallback } from "react"
import { useDispatch } from "react-redux"
import { toast } from "react-hot-toast"

import { handleMediaError } from "@/shared/utils/mediaErrorUtils"
import { getCommunityPath } from "@/shared/utils/navigation"
import { useLeaveVideoSessionMutation } from "@/store/api/videoSessionsApi"
import {
  setPiP as setPiPAction,
  leaveCall as leaveCallAction,
} from "@/store/slices/videoCallSlice"
import { getNavigate, getLocation } from "./useNavigateRef"

/**
 * All user-facing action handlers for a video call.
 *
 * Groups: media toggles, chat, session leave, link copy, PiP transitions.
 * Each handler wraps the raw LiveKit action with error handling / toasts.
 *
 * @param {object} params
 * @param {object} params.t               - Translation object
 * @param {string} params.language        - Current language code
 * @param {string} params.sessionId       - Active session ID
 * @param {boolean} params.isPiP          - Whether currently in PiP mode
 * @param {object} params.callInfo        - Call info from Redux (callPath etc.)
 * @param {Function} params.toggleAudioFn - LiveKit mic toggle
 * @param {Function} params.toggleVideoFn - LiveKit camera toggle
 * @param {Function} params.leaveMeetingFn - LiveKit room.disconnect()
 * @param {object} params.screenShareState - Screen share state from useScreenShare()
 * @param {Function} params.chatSend      - LiveKit chat send function
 * @param {object} params.cleanupRefs     - { hasLeftRef, isLeavingRef }
 * @param {Function} params.setShowChat   - UI state setter
 * @param {Function} params.setShowParticipants - UI state setter
 */
export const useCallActions = ({
  t,
  language,
  sessionId,
  isPiP,
  callInfo,
  toggleAudioFn,
  toggleVideoFn,
  leaveMeetingFn,
  screenShareState,
  chatSend,
  cleanupRefs,
  setShowChat,
  setShowParticipants,
}) => {
  const dispatch = useDispatch()
  const [leaveSessionMut] = useLeaveVideoSessionMutation()

  // ── Media toggles ──

  const handleToggleMic = useCallback(async () => {
    try {
      await toggleAudioFn()
    } catch (err) {
      handleMediaError(err, "mic", t, { isToggle: true })
    }
  }, [toggleAudioFn, t])

  const handleToggleCam = useCallback(async () => {
    try {
      await toggleVideoFn()
    } catch (err) {
      handleMediaError(err, "camera", t, { isToggle: true })
    }
  }, [toggleVideoFn, t])

  const handleToggleScreenShare = useCallback(() => {
    try {
      screenShareState.toggleScreenShare()
    } catch (err) {
      console.error("[useCallActions] Screen share error:", err)
      toast.error(
        t?.rooms?.videoCall?.screenShare?.error ?? "Failed to share screen.",
      )
    }
  }, [screenShareState.toggleScreenShare, t])

  // ── Chat ──

  const handleSendMessage = useCallback(
    (text) => chatSend(text),
    [chatSend],
  )

  // ── Leave session ──

  const handleLeaveSession = useCallback(async () => {
    cleanupRefs.hasLeftRef.current = true
    cleanupRefs.isLeavingRef.current = true
    if (sessionId) {
      try {
        await leaveSessionMut(sessionId).unwrap()
      } catch (error) {
        console.error("Failed to leave session:", error)
      }
    }
    await leaveMeetingFn()
    dispatch(leaveCallAction())

    // Navigate away if on the call page (not in PiP)
    const navigate = getNavigate()
    if (!isPiP && navigate) {
      const pathname = getLocation()?.pathname || ""
      const lang = pathname.split("/")[1] || language
      navigate(getCommunityPath(lang))
    }
  }, [sessionId, isPiP, language, leaveMeetingFn, cleanupRefs, dispatch])

  // ── Copy link ──

  const handleCopyLink = useCallback(() => {
    const url = callInfo?.callPath
      ? `${window.location.origin}${callInfo.callPath}`
      : window.location.href
    navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard!")
  }, [callInfo?.callPath])

  // ── PiP transitions ──

  const enterPiP = useCallback(
    (navigateTo) => {
      dispatch(setPiPAction(true))
      setShowChat(false)
      setShowParticipants(false)
      const navigate = getNavigate()
      if (navigateTo && navigate) {
        navigate(navigateTo)
      }
    },
    [dispatch, setShowChat, setShowParticipants],
  )

  const exitPiP = useCallback(() => {
    dispatch(setPiPAction(false))
  }, [dispatch])

  const returnToCall = useCallback(() => {
    const navigate = getNavigate()
    if (callInfo?.callPath && navigate) {
      dispatch(setPiPAction(false))
      navigate(callInfo.callPath)
    }
  }, [dispatch, callInfo?.callPath])

  return {
    handleToggleMic,
    handleToggleCam,
    handleToggleScreenShare,
    handleSendMessage,
    handleLeaveSession,
    handleCopyLink,
    enterPiP,
    exitPiP,
    returnToCall,
  }
}
