import React, { useState, useEffect, useMemo, lazy, Suspense } from "react"
import { useSelector, useDispatch } from "react-redux"
import { LiveKitRoom } from "@livekit/components-react"
import { useSidePanelState } from "@/features/video-call/hooks/useSidePanelState"
import { leaveCall } from "@/store/slices/videoCallSlice"
import { resolveCallPolicy } from "@/features/video-call/utils/callPolicy"
import { buildRoomOptions } from "@/features/video-call/utils/roomOptions"
import {
  subscribeToCallBroadcast,
  broadcastCallEvent,
  BROADCAST_EVENT_TYPES,
} from "@/features/video-call/services/callBroadcastChannel"
import {
  getUserPref,
  setUserPref,
} from "@/features/video-call/utils/userPreferences"
import { useVideoCallAuthHeartbeat } from "@/features/video-call/hooks/useVideoCallAuthHeartbeat"
import { GlobalVideoCallContext, IDLE_VALUE } from "./videoCallContext"

// Preserve existing import path for legacy consumers outside video-call index
// eslint-disable-next-line react-refresh/only-export-components
export { GlobalVideoCallContext as VideoCallContext, useGlobalVideoCall } from "./videoCallContext"

const GlobalCallContent = lazy(() => import("./GlobalCallContent"))

const PREF_KEYS = {
  RECEIVE_SYSTEM_MSGS: "receiveSystemMsgs",
  JOIN_LEAVE_SOUND: "joinLeaveSound",
}

const readPrefs = (accountId) => ({
  receiveSystemMsgs: getUserPref(accountId, PREF_KEYS.RECEIVE_SYSTEM_MSGS, {
    defaultValue: true,
    legacyKey: PREF_KEYS.RECEIVE_SYSTEM_MSGS,
  }),
  // User-level join/leave chime: each participant chooses for themselves and
  // it is off by default (previously a host-controlled room policy).
  joinLeaveSound: getUserPref(accountId, PREF_KEYS.JOIN_LEAVE_SOUND, {
    defaultValue: false,
  }),
})

// --- Idle Call Content -----------------------------------------------------

const IdleCallContent = ({
  children,
  receiveSystemMsgs,
  setReceiveSystemMsgs,
  speakingAssistantEnabled,
  setSpeakingAssistantEnabled,
  joinLeaveSound,
  setJoinLeaveSound,
}) => {
  const value = useMemo(
    () => ({
      ...IDLE_VALUE,
      receiveSystemMsgs,
      setReceiveSystemMsgs,
      speakingAssistantEnabled,
      setSpeakingAssistantEnabled,
      joinLeaveSound,
      setJoinLeaveSound,
    }),
    [
      receiveSystemMsgs,
      setReceiveSystemMsgs,
      speakingAssistantEnabled,
      setSpeakingAssistantEnabled,
      joinLeaveSound,
      setJoinLeaveSound,
    ],
  )

  return (
    <GlobalVideoCallContext.Provider value={value}>
      {children}
    </GlobalVideoCallContext.Provider>
  )
}

// --- Main Provider ----------------------------------------------------------

export const GlobalVideoCallProvider = ({ children }) => {
  useVideoCallAuthHeartbeat()
  const dispatch = useDispatch()
  const { isInCall, livekitToken, livekitServerUrl, callInfo } = useSelector(
    (s) => s.videoCall,
  )

  const panelState = useSidePanelState()
  const accountId = useSelector((s) => s.auth?.user?.accountId)

  // Personal preferences are account-scoped and reused across rooms. Legacy
  // global keys are migrated on first read (see userPreferences util).
  const [initialPrefs] = useState(() => readPrefs(accountId))
  const [receiveSystemMsgs, setReceiveSystemMsgs] = useState(
    initialPrefs.receiveSystemMsgs,
  )
  const [joinLeaveSound, setJoinLeaveSound] = useState(
    initialPrefs.joinLeaveSound,
  )

  // Reload preferences when the signed-in account changes (shared browser).
  // Render-time adjustment, the React-recommended alternative to an effect.
  const [prefsAccountId, setPrefsAccountId] = useState(accountId)
  if (prefsAccountId !== accountId) {
    setPrefsAccountId(accountId)
    const next = readPrefs(accountId)
    setReceiveSystemMsgs(next.receiveSystemMsgs)
    setJoinLeaveSound(next.joinLeaveSound)
  }

  const [speakingAssistantEnabled, setSpeakingAssistantEnabled] = useState(() => {
    const saved = localStorage.getItem("speakingAssistantEnabled")
    return saved !== null ? JSON.parse(saved) : false
  })

  useEffect(() => {
    setUserPref(accountId, PREF_KEYS.RECEIVE_SYSTEM_MSGS, receiveSystemMsgs)
  }, [accountId, receiveSystemMsgs])

  useEffect(() => {
    localStorage.setItem(
      "speakingAssistantEnabled",
      JSON.stringify(speakingAssistantEnabled),
    )
  }, [speakingAssistantEnabled])

  useEffect(() => {
    setUserPref(accountId, PREF_KEYS.JOIN_LEAVE_SOUND, joinLeaveSound)
  }, [accountId, joinLeaveSound])

  // Cross-tab call state broadcast listener
  useEffect(() => {
    const unsubscribe = subscribeToCallBroadcast(({ type }) => {
      if (type === BROADCAST_EVENT_TYPES.PING_ACTIVE_CALL) {
        if (isInCall) {
          broadcastCallEvent(BROADCAST_EVENT_TYPES.PONG_ACTIVE_CALL, {
            isInCall: true,
            callInfo,
          })
        }
      } else if (type === BROADCAST_EVENT_TYPES.REQUEST_LEAVE_CALL) {
        if (isInCall) {
          dispatch(leaveCall())
        }
      }
    })
    return unsubscribe
  }, [isInCall, callInfo, dispatch])

  if (!isInCall || !livekitToken) {
    return (
      <IdleCallContent
        receiveSystemMsgs={receiveSystemMsgs}
        setReceiveSystemMsgs={setReceiveSystemMsgs}
        speakingAssistantEnabled={speakingAssistantEnabled}
        setSpeakingAssistantEnabled={setSpeakingAssistantEnabled}
        joinLeaveSound={joinLeaveSound}
        setJoinLeaveSound={setJoinLeaveSound}
      >
        {children}
      </IdleCallContent>
    )
  }

  const isMobileDevice =
    typeof window !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  const callPolicy = resolveCallPolicy(
    callInfo?.egressProfile,
    callInfo?.highQuality ?? false,
  )

  const roomOptions = buildRoomOptions(callPolicy, {
    simulcast: !isMobileDevice,
  })

  return (
    <LiveKitRoom
      key={callInfo?.sessionId}
      serverUrl={livekitServerUrl}
      token={livekitToken}
      connect={true}
      audio={callInfo?.initMicOn ?? false}
      video={callInfo?.initCamOn ?? false}
      className="contents"
      options={roomOptions}
      onDisconnected={(reason) => {
        console.error(
          "[GlobalVideoCallProvider] LiveKitRoom onDisconnected:",
          reason,
        )
      }}
      onError={(err) => {
        console.error("[GlobalVideoCallProvider] LiveKitRoom onError:", {
          name: err?.name,
          message: err?.message,
          stack: err?.stack,
          raw: err,
        })
      }}
    >
      <Suspense fallback={children}>
        <GlobalCallContent
          receiveSystemMsgs={receiveSystemMsgs}
          setReceiveSystemMsgs={setReceiveSystemMsgs}
          joinLeaveSound={joinLeaveSound}
          setJoinLeaveSound={setJoinLeaveSound}
          panelState={panelState}
          speakingAssistantEnabled={speakingAssistantEnabled}
          setSpeakingAssistantEnabled={setSpeakingAssistantEnabled}
        >
          {children}
        </GlobalCallContent>
      </Suspense>
    </LiveKitRoom>
  )
}
