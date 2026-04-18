import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import {
  useRoomContext,
  useParticipants,
  useLocalParticipant,
  useChat,
  useConnectionState,
  RoomAudioRenderer,
} from "@livekit/components-react"
import { ConnectionState, RoomEvent } from "livekit-client"

import { useVideoCall } from "@/features/video-call/hooks/useVideoCall"
import { useScreenShare } from "@/features/video-call/hooks/useScreenShare"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useCallCleanup } from "@/features/video-call/hooks/useCallCleanup"
import { useCallActions } from "@/features/video-call/hooks/useCallActions"
import {
  getNavigate,
  getLocation,
} from "@/features/video-call/hooks/useNavigateRef"

/**
 * Rendered inside <LiveKitRoom> when a call is active.
 *
 * Orchestrates LiveKit hooks, extracted action hooks, and composes
 * the context value that both the full call page and PiP widget consume.
 *
 * @param {{ children: React.ReactNode, ContextProvider: React.Provider }} props
 */
const GlobalCallContent = ({ children, ContextProvider }) => {
  const { t, language } = useLanguage()

  const { isInCall, isPiP, callInfo } = useSelector((s) => s.videoCall)
  const { sessionId, roomData, sessionData, user } = callInfo ?? {}

  // ── UI state ──
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)

  // ── Session cleanup (beforeunload / pagehide) ──
  const cleanupRefs = useCallCleanup(sessionId, isInCall)

  // ── LiveKit hooks ──
  let lkRoom = null
  try {
    lkRoom = useRoomContext()
  } catch {
    lkRoom = null
  }

  const allParticipants = useParticipants()
  const localPart = useLocalParticipant()
  const localParticipant = localPart?.localParticipant ?? null

  const connectionState = useConnectionState()
  const isConnected = connectionState === ConnectionState.Connected

  const videoCallState = useVideoCall(t)
  const screenShareState = useScreenShare()

  // Audio is handled by <RoomAudioRenderer /> in the JSX below.

  const chatState = useChat()
  const baseChatMessages = chatState.chatMessages ?? []
  const chatSend = chatState.send ?? (() => {})

  const [systemMessages, setSystemMessages] = useState([])

  useEffect(() => {
    if (!lkRoom) {
      console.warn("[LiveKit Debug] lkRoom is null, cannot attach DataReceived listener.");
      return
    }

    console.log(`[LiveKit Debug] DataReceived listener actively attached to room: ${lkRoom.name || "Unknown"}`);

    const handleData = (payload, participant, kind, topic) => {
      const decoded = new TextDecoder().decode(payload)
      console.log(`[LiveKit Debug] Packet Received! Topic:`, topic, `| Participant:`, participant?.identity, `| Content:`, decoded)

      if (!participant) {
        console.log("🚀 [BACKEND PAYLOAD RECEIVED] Topic:", topic);
        console.log("Raw decoded:", decoded);
        try {
          const parsed = JSON.parse(decoded);
          console.log("Parsed JSON:", parsed);
        } catch (e) {
          // Not a JSON payload, ignore
        }
      }

      // We accept any packet without a source participant (likely server-sent API),
      // OR specifically packets on 'lk-chat'/'system' topics.
      if (!participant || topic === "lk-chat" || topic === "system") {
        let messageText = decoded
        let messageId = `sys-${Date.now()}-${Math.random()}`
        let timestamp = Date.now()

        try {
          const json = JSON.parse(decoded)
          // If it's a standard user chat message that `useChat` will naturally handle, ignore it here
          if (participant && topic === "lk-chat") return 
          
          messageText = json.message || decoded
          if (json.id) messageId = json.id
          if (json.timestamp) timestamp = json.timestamp
        } catch {
          // string payload
        }

        const newSysMsg = {
          id: messageId,
          timestamp,
          message: messageText,
          from: { name: "System", isSystem: true }
        }

        setSystemMessages((prev) => [...prev, newSysMsg])
      }
    }

    lkRoom.on(RoomEvent.DataReceived, handleData)
    return () => {
      lkRoom.off(RoomEvent.DataReceived, handleData)
    }
  }, [lkRoom])

  const chatMessages = [...baseChatMessages, ...systemMessages].sort(
    (a, b) => a.timestamp - b.timestamp
  )

  // ── Action handlers ──
  const actions = useCallActions({
    t,
    language,
    sessionId,
    isPiP,
    callInfo,
    toggleAudioFn: videoCallState.toggleAudio,
    toggleVideoFn: videoCallState.toggleVideo,
    leaveMeetingFn: videoCallState.leaveMeeting,
    screenShareState,
    chatSend,
    cleanupRefs,
    setShowChat,
    setShowParticipants,
  })

  // ── Deduplicated participant list (local first) ──
  const seenIdentities = new Set()
  const participants = []

  if (localParticipant) {
    seenIdentities.add(localParticipant.identity)
    participants.push(localParticipant)
  }

  allParticipants.forEach((p) => {
    if (p.identity === localParticipant?.identity) return
    if (seenIdentities.has(p.identity)) return
    seenIdentities.add(p.identity)
    participants.push(p)
  })

  // ── Context value ──
  const value = {
    // Call lifecycle
    isInCall,
    isPiP,
    enterPiP: actions.enterPiP,
    exitPiP: actions.exitPiP,
    returnToCall: actions.returnToCall,

    // Session
    id: sessionId,
    navigate: getNavigate(),
    location: getLocation(),
    session: sessionData,
    room: roomData,
    sessionError: null,

    // User
    user,
    currentUserId: user?.accountId,

    // Participants
    localParticipant,
    participants,

    // Media state
    micOn: videoCallState.micOn,
    cameraOn: videoCallState.cameraOn,
    isConnected,

    // UI panels
    showChat,
    setShowChat,
    showParticipants,
    setShowParticipants,

    // Chat
    messages: chatMessages,

    // Actions
    handleToggleMic: actions.handleToggleMic,
    handleToggleCam: actions.handleToggleCam,
    handleSendMessage: actions.handleSendMessage,
    handleLeaveSession: actions.handleLeaveSession,
    handleCopyLink: actions.handleCopyLink,

    // Screen share
    screenShareOn: screenShareState.screenShareOn,
    screenShareTrackRef: screenShareState.screenShareTrackRef,
    screenShareTracks: screenShareState.screenShareTracks,
    screenSharePresenterId: screenShareState.presenterId,
    isLocalScreenShare: screenShareState.isLocalScreenShare,
    presenterDisplayName: screenShareState.presenterDisplayName,
    handleToggleScreenShare: actions.handleToggleScreenShare,
  }

  return (
    <ContextProvider value={value}>
      <RoomAudioRenderer />
      {children}
    </ContextProvider>
  )
}

export default GlobalCallContent
