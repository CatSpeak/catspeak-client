import { useCallback } from "react"
import { useDispatch } from "react-redux"
import { toast } from "react-hot-toast"

import { handleMediaError } from "@/shared/utils/mediaErrorUtils"
import { getCommunityPath } from "@/shared/utils/navigation"
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
 * @param {boolean} params.isPiP          - Whether currently in PiP mode
 * @param {object} params.callInfo        - Call info from Redux (callPath etc.)
 * @param {Function} params.toggleAudioFn - LiveKit mic toggle
 * @param {Function} params.toggleVideoFn - LiveKit camera toggle
 * @param {Function} params.leaveMeetingFn - LiveKit room.disconnect()
 * @param {object} params.screenShareState - Screen share state from useScreenShare()
 * @param {Function} params.chatSend      - LiveKit chat send function
 * @param {Function} params.chatSend      - LiveKit chat send function
 * @param {Function} params.setActiveSidePanel - UI state setter
 */
export const useCallActions = ({
  t,
  language,
  isPiP,
  callInfo,
  toggleAudioFn,
  toggleVideoFn,
  leaveMeetingFn,
  screenShareState,
  chatSend,
  setActiveSidePanel,
}) => {
  const dispatch = useDispatch()

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
    (text, replyTarget) => {
      if (replyTarget) {
        chatSend(
          JSON.stringify({
            isReply: true,
            text,
            replyTo: {
              message: replyTarget.message,
              name: replyTarget.from?.name || "User",
            },
          }),
        )
      } else {
        chatSend(text)
      }
    },
    [chatSend],
  )

  // ── Leave session ──

  const handleLeaveSession = useCallback(async () => {
    await leaveMeetingFn()
    dispatch(leaveCallAction())

    // Navigate away if on the call page (not in PiP)
    const navigate = getNavigate()
    if (!isPiP && navigate) {
      navigate(getCommunityPath(language), { replace: true })
    }
  }, [isPiP, language, leaveMeetingFn, dispatch])

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
      // Create the PiP window immediately in the click handler to preserve user activation
      if (
        "documentPictureInPicture" in window &&
        !window.documentPictureInPicture.window
      ) {
        window.__pipWindowPromise = window.documentPictureInPicture
          .requestWindow({
            width: 400,
            height: 300,
          })
          .catch((err) => {
            console.error("Failed to request PiP window in click handler", err)
            return null
          })
      }

      dispatch(setPiPAction(true))
      setActiveSidePanel(null)
      const navigate = getNavigate()
      if (navigateTo && navigate) {
        navigate(navigateTo)
      }
    },
    [dispatch, setActiveSidePanel],
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
