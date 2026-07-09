import React, { useState } from "react"
import { useSelector } from "react-redux"
import {
  useRoomContext,
  useParticipants,
  useLocalParticipant,
  useConnectionState,
  RoomAudioRenderer,
} from "@livekit/components-react"
import { ConnectionState } from "livekit-client"

import { useVideoCall } from "@/features/video-call/hooks/useVideoCall"
import { useScreenShare } from "@/features/video-call/hooks/useScreenShare"
import { useRecording } from "@/features/video-call/hooks/useRecording"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useCallActions } from "@/features/video-call/hooks/useCallActions"
import { useParticipantList } from "@/features/video-call/hooks/useParticipantList"
import { useParticipantAudioEffect } from "@/features/video-call/hooks/useParticipantAudioEffect"
import {
  getNavigate,
  getLocation,
} from "@/features/video-call/hooks/useNavigateRef"

import RoomClosingWarningModal from "@/features/video-call/components/RoomClosingWarningModal"
import { useRoomLifecycle } from "@/features/video-call/hooks/useRoomLifecycle"
import { useChatManager } from "@/features/video-call/hooks/useChatManager"

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
  panelState,
}) => {
  const { t, language } = useLanguage()
  const { isInCall, isPiP, callInfo } = useSelector((s) => s.videoCall)
  const { roomData, user } = callInfo ?? {}
  const isAISession = callInfo?.isAISession ?? false

  // ── UI state ──
  const [showCC, setShowCC] = useState(false)
  const [showRoomSubtitles, setShowRoomSubtitles] = useState(false)
  const [subtitleSelectedLanguage, setSubtitleSelectedLanguage] = useState(null)

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

  // ── Participants ──
  const { participants, isHandRaised } = useParticipantList(
    allParticipants,
    localParticipant,
  )

  // ── Join/Leave Audio ──
  useParticipantAudioEffect(participants)

  const localMetadata = (() => {
    if (!localParticipant?.metadata) return {}
    try {
      return JSON.parse(localParticipant.metadata)
    } catch {
      return {}
    }
  })()

  const currentUserId = user?.accountId

  // ── Chat Manager ──
  const {
    chatSend,
    chatMessages,
    combinedAiMessages,
    addOptimisticAiMessage,
    updateAiInteraction,
    isCurrentUserPrompting,
    startNewThread,
    continueThread,
    getConversationThread,
    chatPublicAi,
    chatPrivateAi,
    unreadRoomChat,
    setUnreadRoomChat,
    unreadAiChat,
    setUnreadAiChat,
  } = useChatManager({
    lkRoom,
    receiveSystemMsgs,
    currentUserId,
    participants,
    panelState,
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

  const [showLeaveModal, setShowLeaveModal] = useState(false)

  const promptLeaveCall = () => {
    if (isPiP) {
      actions.returnToCall()
    }
    setShowLeaveModal(true)
  }

  const cancelLeaveCall = () => {
    setShowLeaveModal(false)
  }

  // ── Room Lifecycle ──
  const activeSessionId = callInfo?.sessionId || localMetadata?.sessionId
  const { closingRemainingSeconds } = useRoomLifecycle({
    lkRoom,
    activeSessionId,
    language,
    t,
  })

  // ── Context value ──
  const value = {
    // Call lifecycle
    isInCall,
    isPiP,
    enterPiP: actions.enterPiP,
    exitPiP: actions.exitPiP,
    returnToCall: actions.returnToCall,
    showLeaveModal,
    promptLeaveCall,
    cancelLeaveCall,

    // Session
    id: callInfo?.roomId,
    sessionId: callInfo?.sessionId || localMetadata?.sessionId,
    closingRemainingSeconds,
    navigate: getNavigate(),
    location: getLocation(),
    room: roomData,
    lkRoom,
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
    showCC,
    setShowCC,
    isAISession,

    // Room subtitles
    showRoomSubtitles,
    setShowRoomSubtitles,
    subtitleSelectedLanguage,
    setSubtitleSelectedLanguage,

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
      <RoomClosingWarningModal
        remainingSeconds={closingRemainingSeconds}
        t={t}
      />
    </ContextProvider>
  )
}

export default GlobalCallContent
