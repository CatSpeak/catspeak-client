import React, { createContext, useContext, useState, useEffect } from "react"
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
import GlobalCallContent from "./GlobalCallContent"

const PREF_KEYS = {
  RECEIVE_SYSTEM_MSGS: "receiveSystemMsgs",
  SHOW_AI_SUGGESTIONS: "showAiSuggestions",
  JOIN_LEAVE_SOUND: "joinLeaveSound",
}

const readPrefs = (accountId) => ({
  receiveSystemMsgs: getUserPref(accountId, PREF_KEYS.RECEIVE_SYSTEM_MSGS, {
    defaultValue: true,
    legacyKey: PREF_KEYS.RECEIVE_SYSTEM_MSGS,
  }),
  showAiSuggestions: getUserPref(accountId, PREF_KEYS.SHOW_AI_SUGGESTIONS, {
    defaultValue: true,
    legacyKey: PREF_KEYS.SHOW_AI_SUGGESTIONS,
  }),
  // User-level join/leave chime: each participant chooses for themselves and
  // it is off by default (previously a host-controlled room policy).
  joinLeaveSound: getUserPref(accountId, PREF_KEYS.JOIN_LEAVE_SOUND, {
    defaultValue: false,
  }),
})

const GlobalVideoCallContext = createContext(null)

export const useGlobalVideoCall = () => {
  const ctx = useContext(GlobalVideoCallContext)
  if (!ctx)
    throw new Error(
      "useGlobalVideoCall must be used within GlobalVideoCallProvider",
    )
  return ctx
}

// Backward-compat alias (existing components import VideoCallContext)
export { GlobalVideoCallContext as VideoCallContext }

// Re-export navigate bridge (used by routesConfig RootLayout)
export { useRegisterNavigate } from "@/features/video-call/hooks/useNavigateRef"

import { MOCK_PARTICIPANTS } from "@/features/video-call/hooks/useParticipantList"

// --- Idle context (no active call) ------------------------------------------

const IDLE_VALUE = {
  isInCall: false,
  isPiP: false,
  enterPiP: () => {},
  exitPiP: () => {},
  returnToCall: () => {},

  showLeaveModal: false,
  promptLeaveCall: () => {},
  cancelLeaveCall: () => {},

  participants: MOCK_PARTICIPANTS,
  messages: [],
  aiMessages: [],
  addOptimisticAiMessage: () => {},
  chatPublicAi: async () => {},
  chatPrivateAi: async () => {},
  startNewThread: () => {},
  continueThread: () => {},
  getConversationThread: () => [],

  isConnected: false,
  micOn: false,
  cameraOn: false,
  isTogglingMic: false,
  isTogglingCam: false,
  isTogglingScreenShare: false,

  activeSidePanel: null,
  setActiveSidePanel: () => {},

  showChat: false,
  setShowChat: () => {},
  showParticipants: false,
  setShowParticipants: () => {},
  showVirtualBackground: false,
  setShowVirtualBackground: () => {},
  showAvatarPicker: false,
  setShowAvatarPicker: () => {},

  beautyOptions: {
    smoothing: 0,
    brightness: 0,
    warmth: 0,
    colorFilter: 0,
    faceSlim: 0,
    eyeEnlarge: 0,
    eyeBrighten: 0,
    teethWhiten: 0,
  },
  setBeautyOptions: () => {},
  switchBeauty: () => {},
  processorStatus: "idle",

  isAISession: false,
  showCC: false,
  setShowCC: () => {},
  showRoomSubtitles: false,
  setShowRoomSubtitles: () => {},
  subtitleSelectedLanguage: null,
  setSubtitleSelectedLanguage: () => {},
  isSubtitleActive: false,
  isStartingSubtitles: false,
  isStoppingSubtitles: false,
  subtitleSupportedLangs: ["en", "vi"],
  startSubtitles: async () => {},
  stopSubtitles: async () => {},

  lkRoomName: null,
  unreadRoomChat: 0,
  unreadAiChat: 0,
  isChatCollapsed: false,
  isAiCollapsed: true,
  setUnreadRoomChat: () => {},
  setUnreadAiChat: () => {},
  setIsChatCollapsed: () => {},
  setIsAiCollapsed: () => {},
  activeChatTab: "room",
  setActiveChatTab: () => {},
  layoutMode: "auto",
  setLayoutMode: () => {},
  maxTiles: 16,
  setMaxTiles: () => {},
  hideEmptyTiles: false,
  setHideEmptyTiles: () => {},

  showRoomSettings: false,
  setShowRoomSettings: () => {},
  activeSettingsTab: "audio-video",
  setActiveSettingsTab: () => {},
  deviceSelection: null,
  joinLeaveSound: false,
  setJoinLeaveSound: () => {},
}

const IdleCallContent = ({
  children,
  receiveSystemMsgs,
  setReceiveSystemMsgs,
  showAiSuggestions,
  setShowAiSuggestions,
  joinLeaveSound,
  setJoinLeaveSound,
}) => (
  <GlobalVideoCallContext.Provider
    value={{
      ...IDLE_VALUE,
      receiveSystemMsgs,
      setReceiveSystemMsgs,
      showAiSuggestions,
      setShowAiSuggestions,
      joinLeaveSound,
      setJoinLeaveSound,
    }}
  >
    {children}
  </GlobalVideoCallContext.Provider>
)

// --- Main Provider ----------------------------------------------------------

export const GlobalVideoCallProvider = ({ children }) => {
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
  const [showAiSuggestions, setShowAiSuggestions] = useState(
    initialPrefs.showAiSuggestions,
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
    setShowAiSuggestions(next.showAiSuggestions)
    setJoinLeaveSound(next.joinLeaveSound)
  }

  useEffect(() => {
    setUserPref(accountId, PREF_KEYS.RECEIVE_SYSTEM_MSGS, receiveSystemMsgs)
  }, [accountId, receiveSystemMsgs])

  useEffect(() => {
    setUserPref(accountId, PREF_KEYS.SHOW_AI_SUGGESTIONS, showAiSuggestions)
  }, [accountId, showAiSuggestions])

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
        showAiSuggestions={showAiSuggestions}
        setShowAiSuggestions={setShowAiSuggestions}
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
      <GlobalCallContent
        ContextProvider={GlobalVideoCallContext.Provider}
        receiveSystemMsgs={receiveSystemMsgs}
        setReceiveSystemMsgs={setReceiveSystemMsgs}
        showAiSuggestions={showAiSuggestions}
        setShowAiSuggestions={setShowAiSuggestions}
        joinLeaveSound={joinLeaveSound}
        setJoinLeaveSound={setJoinLeaveSound}
        panelState={panelState}
      >
        {children}
      </GlobalCallContent>
    </LiveKitRoom>
  )
}
