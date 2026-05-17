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
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)
  const [isAiCollapsed, setIsAiCollapsed] = useState(false)
  const [unreadRoomChat, setUnreadRoomChat] = useState(0)
  const [unreadAiChat, setUnreadAiChat] = useState(0)
  const [showVirtualBackground, setShowVirtualBackground] = useState(false)

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
  let participants = []

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }

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

  // ── Hand Raise Sorting ──
  participants.sort((a, b) => {
    const metaA = parseMetadata(a.metadata)
    const metaB = parseMetadata(b.metadata)

    const aRaised = metaA.handRaised === true
    const bRaised = metaB.handRaised === true

    if (aRaised && !bRaised) return -1
    if (!aRaised && bRaised) return 1

    if (aRaised && bRaised) {
      const timeA = metaA.handRaisedAt || 0
      const timeB = metaB.handRaisedAt || 0
      return timeA - timeB // Ascending
    }

    // Both not raised, keep local user first
    if (a.isLocal && !b.isLocal) return -1
    if (!a.isLocal && b.isLocal) return 1

    return 0
  })

  const localMetadata = parseMetadata(localParticipant?.metadata)
  const isHandRaised = localMetadata.handRaised === true

  const currentUserId = user?.accountId

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

  const chatMessages = [...baseChatMessages].sort(
    (a, b) => a.timestamp - b.timestamp,
  )

  const combinedAiMessages = [...aiMessages, ...systemMessages].sort(
    (a, b) => a.timestamp - b.timestamp,
  )

  // ── Unread Counts Tracking ──
  const prevChatMessagesLength = React.useRef(chatMessages.length)
  useEffect(() => {
    if (chatMessages.length > prevChatMessagesLength.current) {
      if (!showChat || isChatCollapsed) {
        let newUnread = 0
        for (
          let i = prevChatMessagesLength.current;
          i < chatMessages.length;
          i++
        ) {
          if (!chatMessages[i].from?.isLocal) newUnread++
        }
        setUnreadRoomChat((prev) => prev + newUnread)
      }
    }
    prevChatMessagesLength.current = chatMessages.length
  }, [chatMessages, showChat, isChatCollapsed])

  // ── Hand Raise Audio Notification ──
  const prevRaisedHandsRef = React.useRef(new Set())
  useEffect(() => {
    const currentRaisedHands = new Set()
    let newHandRaised = false

    participants.forEach((p) => {
      const meta = parseMetadata(p.metadata)
      if (meta.handRaised === true) {
        currentRaisedHands.add(p.identity)
        // Check if this is a newly raised hand
        if (!prevRaisedHandsRef.current.has(p.identity)) {
          newHandRaised = true
        }
      }
    })

    if (newHandRaised) {
      const audio = new Audio('/sounds/hand-raise.mp3')
      audio.volume = 0.5
      audio.play().catch(err => {
        console.warn("Hand raise audio blocked by browser autoplay policy:", err)
      })
    }

    prevRaisedHandsRef.current = currentRaisedHands
  }, [participants])

  const prevAiMessagesRef = React.useRef(combinedAiMessages)
  useEffect(() => {
    if (combinedAiMessages === prevAiMessagesRef.current) return

    if (!showChat || isAiCollapsed) {
      let newUnread = 0
      const prevStatuses = new Map(
        prevAiMessagesRef.current.map((m) => [m.id, m.status]),
      )

      for (const msg of combinedAiMessages) {
        // Skip local user's own prompts. (Note: AI responses have isLocal=false)
        if (msg.from?.isLocal) continue

        const hasPrev = prevStatuses.has(msg.id)

        if (!hasPrev) {
          // It's a completely new message (e.g. system msg, or another user's prompt)
          // Exception: don't increment for "loading" placeholders immediately when the user prompts.
          if (msg.status !== "loading") {
            newUnread++
          }
        } else {
          const prevStatus = prevStatuses.get(msg.id)
          if (
            prevStatus === "loading" &&
            (msg.status === "done" || msg.status === "error")
          ) {
            // An AI message finished generating or errored
            newUnread++
          }
        }
      }

      if (newUnread > 0) {
        setUnreadAiChat((prev) => prev + newUnread)
      }
    }

    prevAiMessagesRef.current = combinedAiMessages
  }, [combinedAiMessages, showChat, isAiCollapsed])

  useEffect(() => {
    if (showChat) {
      if (!isChatCollapsed) setUnreadRoomChat(0)
      if (!isAiCollapsed) setUnreadAiChat(0)
    }
  }, [showChat, isChatCollapsed, isAiCollapsed])

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
    showChat,
    setShowChat,
    showParticipants,
    setShowParticipants,
    isChatCollapsed,
    setIsChatCollapsed,
    isAiCollapsed,
    setIsAiCollapsed,
    unreadRoomChat,
    setUnreadRoomChat,
    unreadAiChat,
    setUnreadAiChat,
    showVirtualBackground,
    setShowVirtualBackground,

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
