import React from "react"
import { useSelector } from "react-redux"
import {
  useRoomContext,
  useParticipants,
  useLocalParticipant,
  useChat,
  useConnectionState,
  RoomAudioRenderer,
} from "@livekit/components-react"
import { ConnectionState } from "livekit-client"

import { useVideoCall } from "@/features/video-call/hooks/useVideoCall"
import { useScreenShare } from "@/features/video-call/hooks/useScreenShare"
import { useRecording } from "@/features/video-call/hooks/useRecording"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useCallActions } from "@/features/video-call/hooks/useCallActions"
import { useSystemMessages } from "@/features/video-call/hooks/useSystemMessages"
import { useAiMessages } from "@/features/video-call/hooks/useAiMessages"
import { useSidePanelState } from "@/features/video-call/hooks/useSidePanelState"
import { useParticipantList } from "@/features/video-call/hooks/useParticipantList"
import { useUnreadTracking } from "@/features/video-call/hooks/useUnreadTracking"
import {
  useChatPublicAiMutation,
  useChatPrivateAiMutation,
} from "@/store/api/conversationsApi"
import { useParticipantAudioEffect } from "@/features/video-call/hooks/useParticipantAudioEffect"
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
const GlobalCallContent = ({
  children,
  ContextProvider,
  receiveSystemMsgs,
  setReceiveSystemMsgs,
}) => {
  const { t, language } = useLanguage()

  const { isInCall, isPiP, callInfo } = useSelector((s) => s.videoCall)
  const { roomData, user } = callInfo ?? {}

  // ── UI state ──
  const panelState = useSidePanelState()

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

  // ── Participants ──
  const { participants, isHandRaised } = useParticipantList(
    allParticipants,
    localParticipant,
  )

  // ── Join/Leave Audio ──
  useParticipantAudioEffect(participants)

  const localMetadata = (() => {
    if (!localParticipant?.metadata) return {}
    try { return JSON.parse(localParticipant.metadata) } catch { return {} }
  })()

  const currentUserId = user?.accountId

  // ── Messages ──
  const systemMessages = useSystemMessages(lkRoom, receiveSystemMsgs)

  const {
    aiMessages,
    addOptimisticAiMessage,
    updateAiInteraction,
    isCurrentUserPrompting,
    startNewThread,
    continueThread,
    getConversationThread,
  } = useAiMessages(lkRoom, currentUserId, participants)
  const [chatPublicAi] = useChatPublicAiMutation()
  const [chatPrivateAi] = useChatPrivateAiMutation()

  // Parse reply metadata from chat messages
  const chatMessages = baseChatMessages.map((msg) => {
    try {
      const json = JSON.parse(msg.message)
      if (json && json.isReply) {
        return { ...msg, message: json.text, replyTo: json.replyTo }
      }
    } catch {
      // not JSON or not a reply
    }
    return msg
  })

  const combinedAiMessages = [...aiMessages, ...systemMessages].sort(
    (a, b) => a.timestamp - b.timestamp,
  )

  // ── Unread tracking & hand-raise audio ──
  const { unreadRoomChat, setUnreadRoomChat, unreadAiChat, setUnreadAiChat } =
    useUnreadTracking({
      chatMessages,
      combinedAiMessages,
      showChat: panelState.showChat,
      isChatCollapsed: panelState.isChatCollapsed,
      isAiCollapsed: panelState.isAiCollapsed,
      participants,
    })

  // ── Action handlers ──
  const actions = useCallActions({
    t,
    language,
    isPiP,
    callInfo,
    toggleAudioFn: videoCallState.toggleAudio,
    toggleVideoFn: videoCallState.toggleVideo,
    leaveMeetingFn: videoCallState.leaveMeeting,
    screenShareState,
    chatSend,
    setActiveSidePanel: panelState.setActiveSidePanel,
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
    id: callInfo?.roomId,
    sessionId: callInfo?.sessionId || localMetadata?.sessionId,
    navigate: getNavigate(),
    location: getLocation(),
    room: roomData,
    lkRoomName: lkRoom?.name,
    sessionError: null,

    // User
    user,
    currentUserId: user?.accountId,

    // Participants
    localParticipant,
    participants,
    isHandRaised,

    // Media state
    micOn: videoCallState.micOn,
    cameraOn: videoCallState.cameraOn,
    isConnected,
    isTogglingMic: videoCallState.isTogglingMic,
    isTogglingCam: videoCallState.isTogglingCam,

    // UI panels
    ...panelState,
    unreadRoomChat,
    setUnreadRoomChat,
    unreadAiChat,
    setUnreadAiChat,

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
