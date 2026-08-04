import { useState, useEffect, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RoomEvent } from "livekit-client"
import { toast } from "react-hot-toast"
import {
  leaveCall,
  enterBreakout,
  exitBreakout,
  updateLivekitToken,
} from "@/store/slices/videoCallSlice"
import {
  getNavigate,
  getLocation,
} from "@/features/video-call/hooks/useNavigateRef"
import { getCommunityPath } from "@/shared/utils/navigation"
import { useVideoCallSignaling } from "@/features/video-call/hooks/useVideoCallSignaling"
import { roomsApi } from "@/store/api/roomsApi"
import { livekitApi } from "@/store/api/livekitApi"
import { Megaphone, X } from "lucide-react"
import { IconButton, PillButton } from "@/shared/components/ui/buttons"

export const useRoomLifecycle = ({ lkRoom, activeSessionId, language, t }) => {
  const dispatch = useDispatch()
  const parentSessionId = useSelector((s) => s.videoCall.parentSessionId)
  const callInfo = useSelector((s) => s.videoCall.callInfo)
  const roomId = callInfo?.roomId
  const [closingTargetMs, setClosingTargetMs] = useState(null)
  const [closingRemainingSeconds, setClosingRemainingSeconds] = useState(null)

  const handleRoomClosingWarning = useCallback(
    (warnSessionId, remainingSeconds) => {
      let localRemainingSeconds = null
      let driftSeconds = null

      const createDate = callInfo?.roomData?.createDate
      const duration = callInfo?.roomData?.duration

      if (createDate && typeof duration === "number") {
        const maxSeconds = duration * 60
        const elapsed = (Date.now() - new Date(createDate).getTime()) / 1000
        localRemainingSeconds = Math.max(0, Math.round(maxSeconds - elapsed))
        driftSeconds = localRemainingSeconds - remainingSeconds
      }

      console.info("[SignalR] RoomClosingWarning received:", {
        warnSessionId,
        serverRemainingSeconds: remainingSeconds,
        localRemainingSeconds,
        driftSeconds:
          driftSeconds !== null
            ? `${driftSeconds > 0 ? "+" : ""}${driftSeconds}s`
            : "N/A",
        activeSessionId,
      })

      if (
        activeSessionId != null &&
        String(warnSessionId) === String(activeSessionId)
      ) {
        const targetMs = Date.now() + remainingSeconds * 1000
        setClosingTargetMs(targetMs)
      }
    },
    [activeSessionId, callInfo],
  )

  // Fallback: If SignalR event was missed (e.g. tab backgrounded / network drop),
  // trigger the closing warning modal locally when local remaining time is <= 60s.
  useEffect(() => {
    if (closingTargetMs !== null) return

    const createDate = callInfo?.roomData?.createDate
    const duration = callInfo?.roomData?.duration
    if (!createDate || typeof duration !== "number") return

    const checkLocalWarning = () => {
      const endMs = new Date(createDate).getTime() + duration * 60 * 1000
      const remainingSeconds = (endMs - Date.now()) / 1000

      if (remainingSeconds > 0 && remainingSeconds <= 60) {
        console.info(
          "[RoomLifecycle] Local warning fallback triggered:",
          Math.round(remainingSeconds),
          "s remaining",
        )
        setClosingTargetMs(endMs)
      }
    }

    checkLocalWarning()
    const intervalId = setInterval(checkLocalWarning, 1000)
    return () => clearInterval(intervalId)
  }, [callInfo, closingTargetMs])

  useEffect(() => {
    if (closingTargetMs === null) return

    const updateRemaining = () => {
      const remaining = Math.max(
        0,
        Math.ceil((closingTargetMs - Date.now()) / 1000),
      )
      setClosingRemainingSeconds(remaining)
    }

    updateRemaining()
    const intervalId = setInterval(updateRemaining, 1000)
    return () => clearInterval(intervalId)
  }, [closingTargetMs])

  const handleJoinBreakoutRoom = useCallback(
    (subSessionId, roomName, token) => {
      console.info("[SignalR] JoinBreakoutRoom received:", {
        subSessionId,
        roomName,
      })
      dispatch(roomsApi.util.invalidateTags([{ type: "Breakout" }]))
      if (parentSessionId && subSessionId === parentSessionId) {
        dispatch(exitBreakout())
        dispatch(updateLivekitToken(token))
      } else {
        dispatch(enterBreakout({ subSessionId, roomName, token }))
      }
    },
    [dispatch, parentSessionId, t],
  )

  const handleReturnToMainRoom = useCallback(
    (parentSessionIdValue, roomName, token) => {
      console.info("[SignalR] ReturnToMainRoom received:", {
        parentSessionIdValue,
        roomName,
      })
      dispatch(roomsApi.util.invalidateTags([{ type: "Breakout" }]))
      dispatch(exitBreakout())
      if (token) {
        dispatch(updateLivekitToken(token))
      } else if (roomId) {
        // Fetch a fresh token for the main room
        dispatch(
          livekitApi.endpoints.getLivekitToken.initiate({
            roomId: Number(roomId),
          }),
        )
          .unwrap()
          .then((res) => {
            dispatch(updateLivekitToken(res.participantToken))
          })
          .catch((err) => {
            console.error("[SignalR] Failed to fetch main room token:", err)
          })
      }
    },
    [dispatch, roomId, t],
  )

  const handleBreakoutStatusChanged = useCallback(
    (parentSessionIdValue) => {
      console.info(
        "[SignalR] BreakoutStatusChanged received:",
        parentSessionIdValue,
      )
      dispatch(
        roomsApi.util.invalidateTags([
          { type: "Breakout", id: parentSessionIdValue },
        ]),
      )
    },
    [dispatch],
  )

  const handleBroadcastNotification = useCallback(
    (parentSessionIdValue, message) => {
      console.info("[SignalR] BroadcastNotification received:", message)
      const title =
        t?.rooms?.breakoutRooms?.broadcastToastTitle ?? "Thông báo từ Host"
      toast.custom(
        (toastInstance) => (
          <div
            className={`${
              toastInstance.visible ? "animate-enter" : "animate-leave"
            } flex items-center gap-4 w-[90vw] max-w-[480px] rounded-xl bg-white p-3 shadow-faq-card`}
          >
            <div className="bg-[#FEF5C7] border rounded-full w-10 h-10 flex items-center justify-center">
              <Megaphone color="#F4AB1B" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium md:text-lg text-base text-[#F4AB1B] leading-tight">
                {title}
              </p>
              <p className="md:text-base text-sm text-[#7B7979] mt-0.5 break-words">
                &ldquo;{message}&rdquo;
              </p>
            </div>
            <IconButton
              onClick={() => toast.dismiss(toastInstance.id)}
              size="sm"
              variant="filled"
            >
              <X size={16} color="#6B7280" />
            </IconButton>
          </div>
        ),
        { duration: 10000 },
      )
    },
    [t],
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
  }, [
    signaling.isConnected,
    signaling.joinSession,
    activeSessionId,
    parentSessionId,
  ])

  useEffect(() => {
    if (!lkRoom) return

    const handleDisconnected = (reason) => {
      console.error('[useRoomLifecycle] LiveKit room disconnected with reason:', reason)
      dispatch(leaveCall())
      const navigateFn = getNavigate()
      const locationObj = getLocation()
      if (locationObj && locationObj.pathname.includes('/meet/')) {
        navigateFn(getCommunityPath(language), { replace: true })
        if (closingRemainingSeconds !== null) {
          toast.error(
            t?.rooms?.callEnded?.expiredToast ?? 'The session has ended',
          )
        } else if (reason !== undefined && reason !== null) {
          toast.error(`Disconnected from call (reason code: ${reason})`, { duration: 8000 })
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
