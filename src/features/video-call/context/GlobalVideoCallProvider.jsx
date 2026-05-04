import React, { createContext, useContext, useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { LiveKitRoom } from "@livekit/components-react"

import GlobalCallContent from "./GlobalCallContent"

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

// ─── Idle context (no active call) ──────────────────────────────────────────

const IDLE_VALUE = {
  isInCall: false,
  isPiP: false,
  enterPiP: () => {},
  exitPiP: () => {},
  returnToCall: () => {},
  participants: [],
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
  showChat: false,
  setShowChat: () => {},
  showParticipants: false,
  setShowParticipants: () => {},
  lkRoomName: null,
}

const IdleCallContent = ({ children, receiveSystemMsgs, setReceiveSystemMsgs }) => (
  <GlobalVideoCallContext.Provider value={{ ...IDLE_VALUE, receiveSystemMsgs, setReceiveSystemMsgs }}>
    {children}
  </GlobalVideoCallContext.Provider>
)

// ─── Main Provider ──────────────────────────────────────────────────────────

export const GlobalVideoCallProvider = ({ children }) => {
  const { isInCall, livekitToken, livekitServerUrl, callInfo } = useSelector(
    (s) => s.videoCall,
  )

  const [receiveSystemMsgs, setReceiveSystemMsgs] = useState(() => {
    const saved = localStorage.getItem("receiveSystemMsgs")
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    localStorage.setItem("receiveSystemMsgs", JSON.stringify(receiveSystemMsgs))
  }, [receiveSystemMsgs])

  if (!isInCall || !livekitToken) {
    return (
      <IdleCallContent
        receiveSystemMsgs={receiveSystemMsgs}
        setReceiveSystemMsgs={setReceiveSystemMsgs}
      >
        {children}
      </IdleCallContent>
    )
  }

  return (
    <LiveKitRoom
      serverUrl={livekitServerUrl}
      token={livekitToken}
      connect={true}
      audio={callInfo.initMicOn}
      video={callInfo.initCamOn}
      className="contents"
      options={{ publishDefaults: { simulcast: true } }}
    >
      <GlobalCallContent 
        ContextProvider={GlobalVideoCallContext.Provider}
        receiveSystemMsgs={receiveSystemMsgs}
        setReceiveSystemMsgs={setReceiveSystemMsgs}
      >
        {children}
      </GlobalCallContent>
    </LiveKitRoom>
  )
}
