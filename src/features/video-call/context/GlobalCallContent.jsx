import React, { useState, useEffect, useRef, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import { selectCurrentToken } from "@/store/slices/authSlice"
import {
  useRoomContext,
  useParticipants,
  useLocalParticipant,
  useConnectionState,
  RoomAudioRenderer,
} from "@livekit/components-react"
import { ConnectionState, RoomEvent } from "livekit-client"
import { toast } from "react-hot-toast"
import { Clock } from "lucide-react"

import Modal from "@/shared/components/ui/Modal"
import { leaveCall } from "@/store/slices/videoCallSlice"
import { useVideoCallSignaling } from "@/features/video-call/hooks/useVideoCallSignaling"

import { useVideoCall } from "@/features/video-call/hooks/useVideoCall"
import { useScreenShare } from "@/features/video-call/hooks/useScreenShare"
import { useRecording } from "@/features/video-call/hooks/useRecording"
import { useVideoChatSignalR } from "@/features/video-call/hooks/useVideoChatSignalR"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useCallActions } from "@/features/video-call/hooks/useCallActions"
import {
  useParticipantList,
  parseMetadata,
} from "@/features/video-call/hooks/useParticipantList"
import { useGetRecordingsBySessionQuery } from "@/store/api/recordingsApi"
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
  const [beautyOptions, setBeautyOptions] = useState({
    smoothing: 0,
    brightness: 0,
    warmth: 0,
    colorFilter: 0,
    faceSlim: 0,
    eyeEnlarge: 0,
    eyeBrighten: 0,
    teethWhiten: 0,
  })

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

  // ── Synchronized Recording States ──
  const sessionId =
    callInfo?.sessionId || parseMetadata(localParticipant?.metadata)?.sessionId
  const token = useSelector(selectCurrentToken)

  const [isRecording, setIsRecording] = useState(false)
  const [egressId, setEgressId] = useState(null)
  const [startedByAccountId, setStartedByAccountId] = useState(null)

  const { data: sessionRecordings } = useGetRecordingsBySessionQuery(
    sessionId,
    {
      skip: !sessionId,
    },
  )

  // Initialize recording state from active recordings on mount/refresh
  useEffect(() => {
    if (sessionRecordings && sessionRecordings.length > 0) {
      const activeRec = sessionRecordings.find(
        (r) => r.status === "started" || r.status === "active",
      )
      if (activeRec) {
        console.log(
          "[GlobalCallContent] Found active recording on load:",
          activeRec,
        )
        setIsRecording(true)
        setEgressId(activeRec.egressId)
        setStartedByAccountId(activeRec.startedByAccountId)
      } else {
        // No active recording, check if there are completed or partially completed recordings in this session
        // that we haven't notified the user about yet.
        const finishedRec = sessionRecordings.find(
          (r) => r.status === "completed" || r.status === "Partial Completed",
        )
        if (finishedRec) {
          const toastKey = `toast-notified-finished-${finishedRec.recordingId}`
          if (!sessionStorage.getItem(toastKey)) {
            sessionStorage.setItem(toastKey, "true")
            if (finishedRec.status === "completed") {
              toast.success(
                t.recordings?.actions?.stopSuccess ||
                  "Recording trước đó đã được lưu thành công trong My Workspace.",
                { duration: 6000 },
              )
            } else if (finishedRec.status === "Partial Completed") {
              toast.error(
                t.recordings?.storage?.warningLimitReached ||
                  "Recording trước đó đã dừng và được lưu một phần.",
                { duration: 6000 },
              )
            }
          }
        }
      }
    }
  }, [sessionRecordings, t])

  useVideoChatSignalR(sessionId, token, (event, data) => {
    if (event === "RecordingStatusChanged") {
      const isActive = data.status === "started" || data.status === "active"
      setIsRecording(isActive)
      setEgressId(isActive ? data.egressId : null)
      setStartedByAccountId(isActive ? data.startedByAccountId : null)

      if (data.status === "Partial Completed") {
        if (data.reason === "storage_exceeded") {
          toast.error(
            t.recordings?.storage?.warningLimitReached ||
              "Recording đã tự động dừng do vượt quá dung lượng lưu trữ. File recording đã được lưu một phần.",
            { duration: 6000 },
          )
        } else if (data.reason === "reconnect_timeout") {
          toast.error(
            t.recordings?.errors?.interrupted ||
              "Recording trước đó đã bị gián đoạn. File recording đã được lưu một phần.",
            { duration: 6000 },
          )
        }
      }
    } else if (event === "RecordingWarning") {
      toast.error(
        t.recordings?.storage?.warningAlmostFull ||
          "Dung lượng lưu trữ sắp đầy. Recording có thể tự động dừng nếu vượt quá giới hạn.",
        { icon: "⚠️", duration: 6000 },
      )
    }
  })

  const prevConnectionState = useRef(connectionState)
  useEffect(() => {
    if (isRecording) {
      if (connectionState === ConnectionState.Reconnecting) {
        toast.error(
          t.recordings?.errors?.disconnected ||
            "Kết nối bị gián đoạn. Recording tạm dừng...",
          { id: "rec-disconnect", duration: 99999 },
        )
      } else if (
        connectionState === ConnectionState.Connected &&
        prevConnectionState.current === ConnectionState.Reconnecting
      ) {
        toast.dismiss("rec-disconnect")
        toast.success(
          t.recordings?.actions?.reconnected ||
            "Kết nối đã được khôi phục. Recording tiếp tục.",
          { duration: 3000 },
        )
      }
    }
    prevConnectionState.current = connectionState
  }, [connectionState, isRecording, t])

  const videoCallState = useVideoCall(t)
  const screenShareState = useScreenShare()
  const recordingState = useRecording(lkRoom, {
    isRecording,
    setIsRecording,
    egressId,
    setEgressId,
    startedByAccountId,
    setStartedByAccountId,
    sessionId,
  })

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

    // Beauty
    beautyOptions,
    setBeautyOptions,
    switchBeauty: videoCallState.switchBeauty,
    processorStatus: videoCallState.processorStatus,

    // UI panels
    ...panelState,
    showTroubleshoot: panelState.showTroubleshoot,
    setShowTroubleshoot: panelState.setShowTroubleshoot,
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
    isRecording: isRecording,
    isTogglingRecording: recordingState.isTogglingRecording,
    handleToggleRecording: recordingState.handleToggleRecording,
    showStopModal: recordingState.showStopModal,
    confirmStopRecording: recordingState.confirmStopRecording,
    cancelStopRecording: recordingState.cancelStopRecording,
    egressId: egressId,
    startedByAccountId: startedByAccountId,
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
