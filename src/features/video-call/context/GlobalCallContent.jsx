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
import { useRecording } from "@/features/video-call/hooks/useRecording"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useCallCleanup } from "@/features/video-call/hooks/useCallCleanup"
import { useCallActions } from "@/features/video-call/hooks/useCallActions"
import { useSystemMessages } from "@/features/video-call/hooks/useSystemMessages"
import { useAiMessages } from "@/features/video-call/hooks/useAiMessages"
import {
  useChatPublicAiMutation,
  useChatPrivateAiMutation,
} from "@/store/api/conversationsApi"
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
const GlobalCallContent = ({ children, ContextProvider, receiveSystemMsgs, setReceiveSystemMsgs }) => {
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
  const recordingState = useRecording(lkRoom)

  // Audio is handled by <RoomAudioRenderer /> in the JSX below.

  const chatState = useChat()
  const baseChatMessages = chatState.chatMessages ?? []
  const chatSend = chatState.send ?? (() => {})



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

  const currentUserId = user?.accountId

  const systemMessages = useSystemMessages(lkRoom, receiveSystemMsgs)

  const { aiMessages, addOptimisticAiMessage, updateAiInteraction, isCurrentUserPrompting, startNewThread, continueThread, getConversationThread } = useAiMessages(lkRoom, currentUserId, participants)
  const [chatPublicAi] = useChatPublicAiMutation()
  const [chatPrivateAi] = useChatPrivateAiMutation()

  const chatMessages = [...baseChatMessages].sort(
    (a, b) => a.timestamp - b.timestamp,
  )

  const combinedAiMessages = [...aiMessages, ...systemMessages].sort(
    (a, b) => a.timestamp - b.timestamp,
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
    lkRoomName: lkRoom?.name,
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
    isTogglingMic: videoCallState.isTogglingMic,
    isTogglingCam: videoCallState.isTogglingCam,

    // UI panels
    showChat,
    setShowChat,
    showParticipants,
    setShowParticipants,

    // Chat
    messages: chatMessages,
    aiMessages: combinedAiMessages,
    addOptimisticAiMessage,
    chatPublicAi,
    chatPrivateAi,
    receiveSystemMsgs,
    setReceiveSystemMsgs,
    updateAiInteraction,
    isCurrentUserPrompting,
    startNewThread,
    continueThread,
    getConversationThread,

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
    isTogglingScreenShare: screenShareState.isTogglingScreenShare,
    // Recording
    isRecording: recordingState.isRecording,
    isTogglingRecording: recordingState.isTogglingRecording,
    handleToggleRecording: recordingState.handleToggleRecording,
    showStopModal: recordingState.showStopModal,
    confirmStopRecording: recordingState.confirmStopRecording,
    cancelStopRecording: recordingState.cancelStopRecording,
  }

  return (
    <ContextProvider value={value}>
      <RoomAudioRenderer />
      {children}
    </ContextProvider>
  )
}

export default GlobalCallContent
