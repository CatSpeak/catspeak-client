import { useState, useEffect, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RoomEvent } from "livekit-client"
import { toast } from "react-hot-toast"
import { leaveCall, enterBreakout, exitBreakout, updateLivekitToken } from "@/store/slices/videoCallSlice"
import { getNavigate, getLocation } from "@/features/video-call/hooks/useNavigateRef"
import { getCommunityPath } from "@/shared/utils/navigation"
import { useVideoCallSignaling } from "@/features/video-call/hooks/useVideoCallSignaling"
import { roomsApi } from "@/store/api/roomsApi"
import { livekitApi } from "@/store/api/livekitApi"

export const useRoomLifecycle = ({
  lkRoom,
  activeSessionId,
  language,
  t,
}) => {
  const dispatch = useDispatch()
  const parentSessionId = useSelector((s) => s.videoCall.parentSessionId)
  const roomId = useSelector((s) => s.videoCall.callInfo?.roomId)
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

  const handleJoinBreakoutRoom = useCallback(
    (subSessionId, roomName, token) => {
      console.info("[SignalR] JoinBreakoutRoom received:", { subSessionId, roomName })
      if (parentSessionId && subSessionId === parentSessionId) {
        dispatch(exitBreakout())
        dispatch(updateLivekitToken(token))
        toast.success(t?.rooms?.videoCall?.breakout?.returnedToMain ?? "Quay trở lại phòng học chính.")
      } else {
        dispatch(enterBreakout({ subSessionId, roomName, token }))
        toast.success(`${t?.rooms?.videoCall?.breakout?.assignedToRoom ?? "Giáo viên chia bạn vào phòng nhỏ:"} ${roomName}`)
      }
    },
    [dispatch, parentSessionId, t]
  )

  const handleReturnToMainRoom = useCallback(
    (parentSessionIdValue, roomName, token) => {
      console.info("[SignalR] ReturnToMainRoom received:", { parentSessionIdValue, roomName })
      dispatch(exitBreakout())
      if (token) {
        dispatch(updateLivekitToken(token))
      } else if (roomId) {
        // Fetch a fresh token for the main room
        dispatch(livekitApi.endpoints.getLivekitToken.initiate({ roomId: Number(roomId) }))
          .unwrap()
          .then((res) => {
            dispatch(updateLivekitToken(res.participantToken))
          })
          .catch((err) => {
            console.error("[SignalR] Failed to fetch main room token:", err)
          })
      }
      toast.success(t?.rooms?.videoCall?.breakout?.returnedToMain ?? "Quay trở lại phòng học chính.")
    },
    [dispatch, roomId, t]
  )

  const handleBreakoutStatusChanged = useCallback(
    (parentSessionIdValue) => {
      console.info("[SignalR] BreakoutStatusChanged received:", parentSessionIdValue)
      dispatch(roomsApi.util.invalidateTags([{ type: "Breakout", id: parentSessionIdValue }]))
    },
    [dispatch]
  )

  const handleBroadcastNotification = useCallback(
    (parentSessionIdValue, message) => {
      console.info("[SignalR] BroadcastNotification received:", message)
      toast(message, {
        icon: "📢",
        duration: 8000,
        style: {
          border: "1px solid #10B981",
          padding: "16px",
          color: "#064E3B",
          background: "#ECFDF5",
          fontWeight: "600",
          fontSize: "15px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        },
      })
    },
    []
  )

  const signaling = useVideoCallSignaling({
    RoomClosingWarning: handleRoomClosingWarning,
    JoinBreakoutRoom: handleJoinBreakoutRoom,
    ReturnToMainRoom: handleReturnToMainRoom,
    BreakoutStatusChanged: handleBreakoutStatusChanged,
    BroadcastNotification: handleBroadcastNotification,
  })

  useEffect(() => {
    if (signaling.isConnected) {
      if (parentSessionId) {
        signaling.joinSession(parentSessionId).catch(console.error)
      }
      if (activeSessionId && activeSessionId !== parentSessionId) {
        signaling.joinSession(activeSessionId).catch(console.error)
      }
    }
  }, [signaling.isConnected, signaling.joinSession, activeSessionId, parentSessionId])



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
