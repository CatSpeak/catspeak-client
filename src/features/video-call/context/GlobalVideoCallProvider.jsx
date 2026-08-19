import React, { createContext, useContext, useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { LiveKitRoom } from "@livekit/components-react"
import { useSidePanelState } from "@/features/video-call/hooks/useSidePanelState"
import { leaveCall } from "@/store/slices/videoCallSlice"
import {
  subscribeToCallBroadcast,
  broadcastCallEvent,
  BROADCAST_EVENT_TYPES,
} from "@/features/video-call/services/callBroadcastChannel"
import GlobalCallContent from "./GlobalCallContent"

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
  changeSubtitleLanguage: async () => {},

  lkRoomName: null,
  speakingStatsMap: {},
  roomTotalDuration: 0,
  roomTotalStudentDuration: 0,
  unreadRoomChat: 0,
  unreadAiChat: 0,
  isChatCollapsed: false,
  isAiCollapsed: true,
  setUnreadRoomChat: () => {},
  setUnreadAiChat: () => {},
  setIsChatCollapsed: () => {},
  setIsAiCollapsed: () => {},
  speakingAssistantEnabled: false,
  setSpeakingAssistantEnabled: () => {},
  activeChatTab: "room",
  setActiveChatTab: () => {},
  aiMode: "room-context",
  setAiMode: () => {},
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
}

const GlobalVideoCallContext = createContext(IDLE_VALUE)

export const useGlobalVideoCall = () => {
  const ctx = useContext(GlobalVideoCallContext)
  return ctx || IDLE_VALUE
}

// Backward-compat alias (existing components import VideoCallContext)
export { GlobalVideoCallContext as VideoCallContext }

// Re-export navigate bridge (used by routesConfig RootLayout)
export { useRegisterNavigate } from "@/features/video-call/hooks/useNavigateRef"

const IdleCallContent = ({
  children,
  receiveSystemMsgs,
  setReceiveSystemMsgs,
  speakingAssistantEnabled,
  setSpeakingAssistantEnabled,
}) => (
  <GlobalVideoCallContext.Provider
    value={{
      ...IDLE_VALUE,
      receiveSystemMsgs,
      setReceiveSystemMsgs,
      speakingAssistantEnabled,
      setSpeakingAssistantEnabled,
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

  const [receiveSystemMsgs, setReceiveSystemMsgs] = useState(() => {
    const saved = localStorage.getItem("receiveSystemMsgs")
    return saved !== null ? JSON.parse(saved) : true
  })

  const [speakingAssistantEnabled, setSpeakingAssistantEnabled] = useState(() => {
    const saved = localStorage.getItem("speakingAssistantEnabled")
    return saved !== null ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem("receiveSystemMsgs", JSON.stringify(receiveSystemMsgs))
  }, [receiveSystemMsgs])

  useEffect(() => {
    localStorage.setItem(
      "speakingAssistantEnabled",
      JSON.stringify(speakingAssistantEnabled),
    )
  }, [speakingAssistantEnabled])

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
      >
        {children}
      </IdleCallContent>
    )
  }

  const isMobileDevice =
    typeof window !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  console.log("[GlobalVideoCallProvider] Rendering LiveKitRoom:", {
    livekitServerUrl,
    sessionId: callInfo?.sessionId,
    initMicOn: callInfo?.initMicOn,
    initCamOn: callInfo?.initCamOn,
    isMobileDevice,
  })

  return (
    <LiveKitRoom
      key={callInfo?.sessionId}
      serverUrl={livekitServerUrl}
      token={livekitToken}
      connect={true}
      audio={callInfo.initMicOn}
      video={callInfo.initCamOn}
      className="contents"
      options={{ publishDefaults: { simulcast: !isMobileDevice } }}
      onConnected={() => {
        console.log("[GlobalVideoCallProvider] LiveKitRoom connected successfully!")
      }}
      onDisconnected={(reason) => {
        console.error("[GlobalVideoCallProvider] LiveKitRoom onDisconnected:", reason)
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
        panelState={panelState}
        speakingAssistantEnabled={speakingAssistantEnabled}
        setSpeakingAssistantEnabled={setSpeakingAssistantEnabled}
      >
        {children}
      </GlobalCallContent>
    </LiveKitRoom>
  )
}
