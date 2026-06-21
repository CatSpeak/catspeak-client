import { useState, useEffect, useCallback } from "react"
import { useDispatch } from "react-redux"
import { RoomEvent } from "livekit-client"
import { toast } from "react-hot-toast"
import { leaveCall } from "@/store/slices/videoCallSlice"
import { getNavigate, getLocation } from "@/features/video-call/hooks/useNavigateRef"
import { getCommunityPath } from "@/shared/utils/navigation"
import { useVideoCallSignaling } from "@/features/video-call/hooks/useVideoCallSignaling"

export const useRoomLifecycle = ({
  lkRoom,
  activeSessionId,
  language,
  t,
}) => {
  const dispatch = useDispatch()
  const [closingRemainingSeconds, setClosingRemainingSeconds] = useState(null)

  const handleRoomClosingWarning = useCallback(
    (warnSessionId, remainingSeconds) => {
      if (activeSessionId && warnSessionId === activeSessionId) {
        // Just capture the warning time once; the header timer will handle the actual ticking
        setClosingRemainingSeconds((prev) => prev === null ? remainingSeconds : prev)
      }
    },
    [activeSessionId],
  )

  const signaling = useVideoCallSignaling({
    RoomClosingWarning: handleRoomClosingWarning,
  })

  useEffect(() => {
    if (signaling.isConnected && activeSessionId) {
      signaling.joinSession(activeSessionId).catch(console.error)
    }
  }, [signaling.isConnected, signaling.joinSession, activeSessionId])



  useEffect(() => {
    if (!lkRoom) return

    const handleDisconnected = () => {
      dispatch(leaveCall())
      const navigateFn = getNavigate()
      const locationObj = getLocation()
      if (locationObj && locationObj.pathname.includes("/meet/")) {
        navigateFn(getCommunityPath(language), { replace: true })
        if (closingRemainingSeconds !== null) {
          toast.error(t?.rooms?.callEnded?.expiredToast ?? "The session has ended")
        }
      }
    }

    lkRoom.on(RoomEvent.Disconnected, handleDisconnected)
    return () => {
      lkRoom.off(RoomEvent.Disconnected, handleDisconnected)
    }
  }, [lkRoom, dispatch, closingRemainingSeconds, language, t])

  return {
    closingRemainingSeconds,
  }
}
