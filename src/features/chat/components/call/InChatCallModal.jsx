import { useState, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useLocalParticipant,
} from "@livekit/components-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

import ParticipantVideoTile from "./ParticipantVideoTile"
import RingingPlaceholderTile from "./RingingPlaceholderTile"
import CallTopBar from "./CallTopBar"
import CallBottomDock from "./CallBottomDock"

/**
 * CallControlsInner — Renders in-call media controllers, top window bar,
 * floating bottom dock, and the responsive participant video grid.
 */
const CallControlsInner = ({
  onEndCall,
  isMinimized,
  onToggleMinimize,
  callType,
  conversation,
  currentUser,
  isFullscreen,
  onToggleFullscreen,
  callSession,
}) => {
  const { t } = useLanguage()
  const participants = useParticipants()
  const {
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
    localParticipant,
  } = useLocalParticipant()

  const [callDuration, setCallDuration] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((d) => d + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleMic = async () => {
    try {
      if (localParticipant) {
        await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
      }
    } catch (err) {
      console.error("Failed to toggle mic:", err)
      toast.error(t?.chat?.call?.micError || "Failed to toggle microphone")
    }
  }

  const toggleCam = async () => {
    try {
      if (localParticipant) {
        await localParticipant.setCameraEnabled(!isCameraEnabled)
      }
    } catch (err) {
      console.error("Failed to toggle camera:", err)
      toast.error(t?.chat?.call?.camError || "Failed to toggle camera")
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (localParticipant) {
        await localParticipant.setScreenShareEnabled(!isScreenShareEnabled)
      }
    } catch (err) {
      console.error("Failed to toggle screen share:", err)
      toast.error("Failed to toggle screen share")
    }
  }

  // Header display details
  const activeConversation = callSession?.conversation || conversation
  const chatTitle =
    activeConversation?.name ||
    activeConversation?.friend?.username ||
    (callType === "video"
      ? t?.chat?.call?.videoCall || "Video Call"
      : t?.chat?.call?.voiceCall || "Voice Call")

  const isDirect1on1 = !activeConversation?.isGroup
  const friendUser =
    activeConversation?.friend ||
    activeConversation?.participants?.find(
      (p) =>
        Number(p.accountId || p.id) !==
        Number(currentUser?.id || currentUser?.accountId),
    )
  const isWaitingForFriend =
    isDirect1on1 && participants.length === 1 && friendUser

  // Filter remote participants for spotlight selection in minimized/PiP mode
  const remoteParticipants = useMemo(
    () => participants.filter((p) => p !== localParticipant),
    [participants, localParticipant],
  )

  // Track the most recent active remote speaker to avoid rapid switching during pauses
  const [lastSpeakerId, setLastSpeakerId] = useState(null)
  const activeRemoteSpeaker = remoteParticipants.find((p) => p.isSpeaking)
  if (activeRemoteSpeaker && lastSpeakerId !== activeRemoteSpeaker.identity) {
    setLastSpeakerId(activeRemoteSpeaker.identity)
  }

  // Determine single spotlight participant when minimized
  const spotlightParticipant = useMemo(() => {
    if (isDirect1on1) {
      return remoteParticipants[0] || localParticipant
    }
    // Group call priority:
    // 1. Any remote participant currently sharing screen
    const screenSharer = remoteParticipants.find((p) => p.isScreenShareEnabled)
    if (screenSharer) return screenSharer

    // 2. Currently active remote speaker
    const activeSpeaker = remoteParticipants.find((p) => p.isSpeaking)
    if (activeSpeaker) return activeSpeaker

    // 3. Most recent speaker
    if (lastSpeakerId) {
      const last = remoteParticipants.find((p) => p.identity === lastSpeakerId)
      if (last) return last
    }

    // 4. Fallback to first remote participant or self
    return remoteParticipants[0] || localParticipant
  }, [isDirect1on1, remoteParticipants, localParticipant, lastSpeakerId])

  return (
    <div className="flex flex-col h-full w-full justify-between bg-neutral-950 text-white select-none">
      {/* ── Top Bar ── */}
      <CallTopBar
        chatTitle={chatTitle}
        callDuration={callDuration}
        isFullscreen={isFullscreen}
        isMinimized={isMinimized}
        onToggleFullscreen={onToggleFullscreen}
        onToggleMinimize={onToggleMinimize}
      />

      {/* ── Main View (Single Spotlight Tile when Minimized, Grid when Expanded) ── */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0 bg-radial from-neutral-900/60 via-neutral-950 to-neutral-950">
        {isMinimized ? (
          <div className="w-full h-full">
            {isWaitingForFriend ? (
              <RingingPlaceholderTile friend={friendUser} />
            ) : spotlightParticipant ? (
              <ParticipantVideoTile
                key={spotlightParticipant.identity}
                participant={spotlightParticipant}
                isLocal={spotlightParticipant === localParticipant}
                isSolo={false}
                isInitiator={Boolean(callSession?.isInitiator)}
                conversation={activeConversation}
                currentUser={currentUser}
              />
            ) : null}
          </div>
        ) : (
          <div
            className={`w-full h-full grid gap-2 ${
              isDirect1on1
                ? "grid-cols-1 sm:grid-cols-2 grid-rows-2 sm:grid-rows-1"
                : participants.length <= 1
                  ? "grid-cols-1"
                  : participants.length === 2
                    ? "grid-cols-1 sm:grid-cols-2 grid-rows-2 sm:grid-rows-1"
                    : participants.length <= 4
                      ? "grid-cols-2 auto-rows-fr"
                      : "grid-cols-2 sm:grid-cols-3 auto-rows-fr"
            }`}
          >
            {participants.map((p) => (
              <ParticipantVideoTile
                key={p.identity}
                participant={p}
                isLocal={p === localParticipant}
                isSolo={!isDirect1on1 && participants.length <= 1}
                isInitiator={Boolean(callSession?.isInitiator)}
                conversation={activeConversation}
                currentUser={currentUser}
              />
            ))}

            {/* Discord-style dimmed placeholder for recipient in 1-on-1 calls while waiting */}
            {isWaitingForFriend && (
              <RingingPlaceholderTile friend={friendUser} />
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Controls Bar / Dock ── */}
      <CallBottomDock
        isMicrophoneEnabled={isMicrophoneEnabled}
        toggleMic={toggleMic}
        isCameraEnabled={isCameraEnabled}
        toggleCam={toggleCam}
        isScreenShareEnabled={isScreenShareEnabled}
        toggleScreenShare={toggleScreenShare}
        isMinimized={isMinimized}
        onEndCall={onEndCall}
      />
    </div>
  )
}

/**
 * InChatCallModal — Main wrapper orchestrating LiveKit connection and
 * rendering full, centered, or floating PiP call window via createPortal.
 */
const InChatCallModal = ({
  open,
  onClose,
  callSession,
  onEndCall,
  conversation,
  currentUser,
}) => {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!open || !callSession?.token) return null

  const livekitServerUrl =
    callSession.serverUrl ||
    callSession.liveKitServerUrl ||
    import.meta.env.VITE_LIVEKIT_URL ||
    "wss://livekit.catspeak.com.vn"

  const callType = callSession.callType || "video"

  const containerClasses = isMinimized
    ? "fixed bottom-5 right-5 z-[1301] w-72 sm:w-80 h-96 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden border border-neutral-700/80 bg-neutral-950 flex flex-col animate-in zoom-in-95 duration-200"
    : isFullscreen
      ? "fixed inset-0 z-[1301] bg-neutral-950 flex flex-col overflow-hidden animate-in fade-in duration-200"
      : "fixed inset-3 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[94vw] sm:max-w-4xl sm:h-[82vh] sm:max-h-[720px] z-[1301] rounded-xl shadow-2xl overflow-hidden border border-neutral-800 bg-neutral-950 flex flex-col animate-in fade-in zoom-in-95 duration-200"

  return createPortal(
    <>
      {/* Backdrop for full view */}
      {!isMinimized && (
        <div
          className="fixed inset-0 z-[1300] bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsMinimized(true)}
        />
      )}

      <div className={containerClasses}>
        <LiveKitRoom
          serverUrl={livekitServerUrl}
          token={callSession.token}
          connect={true}
          audio={true}
          video={false}
          onDisconnected={onClose}
          className="w-full h-full flex flex-col"
        >
          <RoomAudioRenderer />
          <CallControlsInner
            onEndCall={onEndCall}
            isMinimized={isMinimized}
            onToggleMinimize={() => setIsMinimized((prev) => !prev)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
            callType={callType}
            conversation={callSession?.conversation || conversation}
            currentUser={currentUser}
            callSession={callSession}
          />
        </LiveKitRoom>
      </div>
    </>,
    document.body,
  )
}

export default InChatCallModal
