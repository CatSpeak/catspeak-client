import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  lazy,
  Suspense,
} from "react"
import { useSelector, useDispatch } from "react-redux"
import { LiveKitRoom, RoomContext } from "@livekit/components-react"
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

  const idleValue = useMemo(
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
      speakingAssistantEnabled,
      joinLeaveSound,
    ],
  )

  // `(lkRoom, value)` published by GlobalCallContent once the lazy chunk has
  // loaded and the LiveKit hooks have produced the real context value.
  const [activeCall, setActiveCall] = useState({
    room: null,
    value: null,
    sessionId: null,
  })

  const handleCallSync = useCallback((room, value) => {
    setActiveCall({
      room: room ?? null,
      value: value ?? null,
      sessionId: value?.sessionId ?? null,
    })
  }, [])

  const handleCallClear = useCallback(() => {
    setActiveCall({ room: null, value: null, sessionId: null })
  }, [])

  const callActive = Boolean(isInCall && livekitToken)
  const isSyncedForCurrentCall =
    Boolean(activeCall.value) &&
    (activeCall.sessionId ?? null) === (callInfo?.sessionId ?? null)

  const effectiveValue = useMemo(() => {
    if (!callActive) return idleValue
    if (isSyncedForCurrentCall) {
      return { ...activeCall.value, isCallReady: true }
    }
    // Tokens are already in Redux but the lazy call chunk has not synced yet.
    // Keep the app tree mounted with a usable identity so no consumer redirects
    // to "/" while the chunk loads.
    return {
      ...idleValue,
      isInCall: true,
      isCallReady: false,
      user: callInfo?.user ?? null,
      room: callInfo?.roomData ?? null,
      sessionId: callInfo?.sessionId ?? null,
    }
  }, [callActive, isSyncedForCurrentCall, activeCall.value, idleValue, callInfo])

  const roomContextValue = callActive
    ? activeCall.room ?? undefined
    : undefined

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
    <>
      {/* One fixed position for the app tree: entering/leaving a call never
          unmounts AppRouter, presence, SignalR or Firestore listeners. */}
      <RoomContext.Provider value={roomContextValue}>
        <GlobalVideoCallContext.Provider value={effectiveValue}>
          {children}
        </GlobalVideoCallContext.Provider>
      </RoomContext.Provider>

      {callActive && (
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
          <Suspense fallback={null}>
            <GlobalCallContent
              receiveSystemMsgs={receiveSystemMsgs}
              setReceiveSystemMsgs={setReceiveSystemMsgs}
              joinLeaveSound={joinLeaveSound}
              setJoinLeaveSound={setJoinLeaveSound}
              panelState={panelState}
              speakingAssistantEnabled={speakingAssistantEnabled}
              setSpeakingAssistantEnabled={setSpeakingAssistantEnabled}
              onSync={handleCallSync}
              onClear={handleCallClear}
            />
          </Suspense>
        </LiveKitRoom>
      )}
    </>
  )
}
