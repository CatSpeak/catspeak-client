import React, { useState, useRef, useEffect, useCallback } from "react"
import { Navigate } from "react-router-dom"
import { ChevronRight, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useConnectionState } from "@livekit/components-react"
import { ConnectionState } from "livekit-client"
import { useSelector, useDispatch } from "react-redux"
import { useGetBreakoutStatusQuery, useStopBreakoutRoomsMutation } from "@/store/api/roomsApi"
import { exitBreakout } from "@/store/slices/videoCallSlice"
import { toast } from "react-hot-toast"
import BreakoutBanner from "@/features/video-call/components/breakout-rooms/active/BreakoutBanner"

import VideoGrid from "@/features/video-call/components/VideoGrid"
import ParticipantList from "@/features/video-call/components/ParticipantList"
import ChatBox from "@/features/video-call/components/chat/ChatBox"
import VideoCallControlBar from "@/features/video-call/components/ControlBar"
import RoomHeader from "@/features/video-call/components/RoomHeader"
import VirtualBackgroundPicker from "@/features/video-call/components/VirtualBackgroundPicker"
import AvatarUrlPicker from "@/features/video-call/components/AvatarUrlPicker"
import SubtitleOverlay from "@/features/video-call/components/SubtitleOverlay"
import SubtitleOverlayNonAI from "@/features/video-call/components/SubtitleOverlayNonAI"

import BreakoutSidebarPanel from "@/features/video-call/components/breakout-rooms/BreakoutSidebarPanel"

import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { VideoCallProvider } from "@/features/video-call/context/VideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import VideoCallLoading from "@/features/video-call/components/VideoCallLoading"
import { useBreakoutTimer } from "@/features/video-call/hooks/useBreakoutTimer"

const VideoCallRoomContent = () => {
  const { t } = useLanguage()
  const {
    showChat,
    setShowChat,
    showParticipants,
    setShowParticipants,
    showVirtualBackground,
    setShowVirtualBackground,
    showAvatarPicker,
    setShowAvatarPicker,
    showBreakout,
    setShowBreakout,
    activeSidePanel,
    setActiveSidePanel,
    isAISession,
    showCC,
    // Auth guard
    user,
    location,
    // Header info
    sessionId,
    room,
    // ChatBox props (presentational component — keeps props-based API)
    messages,
    handleSendMessage,
    isConnected,
    // PiP controls
    enterPiP,
    // Room subtitles
    showRoomSubtitles,
    // Recording
    isRecording,
    confirmStopRecording,
    participants,
  } = useVideoCallContext()

  const { isBreakoutActive, breakoutRoomName, parentSessionId } = useSelector(
    (s) => s.videoCall,
  )
  const isHost = room?.creatorId === user?.accountId

  const dispatch = useDispatch()
  const [stopBreakoutRooms] = useStopBreakoutRoomsMutation()

  const handleTimerEnd = useCallback(() => {
    if (isHost && parentSessionId) {
      stopBreakoutRooms(parentSessionId).unwrap().catch(console.error)
      dispatch(exitBreakout())
      toast.success("Hết thời gian! Đã tự động đóng phòng nhóm.")
    }
  }, [isHost, parentSessionId, stopBreakoutRooms, dispatch])

  const { countdownSeconds, formattedTime, breakoutStatus, isSessionBreakoutActive } = useBreakoutTimer(
    parentSessionId,
    isBreakoutActive,
    handleTimerEnd
  )

  // Prevent host from accidentally closing/refreshing tab during active breakout
  useEffect(() => {
    if (!isHost || !isBreakoutActive) return
    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue =
        "Đang có các phòng thảo luận nhỏ hoạt động. Bạn có chắc chắn muốn rời khỏi trang?"
      return e.returnValue
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isHost, isBreakoutActive])

  const isSidePanelOpen = activeSidePanel !== null
  const sidePanelTitle = showParticipants
    ? t.rooms.videoCall.participantList.title
    : showVirtualBackground
      ? t.rooms?.videoCall?.applyVisualEffects || "Backgrounds and effects"
      : showAvatarPicker
        ? t.rooms?.avatarPicker?.title || "Meeting Avatar"
        : showBreakout
          ? isBreakoutActive
            ? "Phòng thảo luận"
            : "Phòng họp nhóm"
          : t.rooms.chatBox.title

  // ── LiveKit connection gate ──
  // The "Connecting…" loading screen from VideoCallProvider is dismissed
  // as soon as phase flips to "in-call", but LiveKit may still be
  // negotiating the WebSocket at that point.  Keep showing a loader
  // until the connection is fully established so that participant
  // metadata (name, avatar, etc.) is available when VideoGrid renders.
  const connectionState = useConnectionState()
  const livekitReady = connectionState === ConnectionState.Connected

  const wasBreakoutActiveRef = useRef(false)
  useEffect(() => {
    if (isBreakoutActive) {
      wasBreakoutActiveRef.current = true
    }
    if (livekitReady) {
      wasBreakoutActiveRef.current = false
    }
  }, [isBreakoutActive, livekitReady])

  useEffect(() => {
    // Prevent iOS/macOS swipe-to-go-back gestures during the call
    document.body.style.overscrollBehaviorX = "none"
    return () => {
      document.body.style.overscrollBehaviorX = "auto"
    }
  }, [])

  if (!user) {
    return (
      <Navigate
        to="/"
        state={{
          requireLogin: true,
          redirectTo: location.pathname + location.search + location.hash,
        }}
        replace
      />
    )
  }

  if (!livekitReady) {
    if (isBreakoutActive || wasBreakoutActiveRef.current) {
      const isReturning = !isBreakoutActive && wasBreakoutActiveRef.current
      const message = isReturning
        ? (t?.rooms?.videoCall?.breakout?.returningTitle ??
          "Quay lại phòng chính...")
        : (t?.rooms?.videoCall?.breakout?.movingTitle ??
          "Di chuyển vào phòng nhóm...")
      return <VideoCallLoading message={message} />
    }
    return (
      <VideoCallLoading
        message={t.rooms.videoCall.provider.connecting ?? "Connecting..."}
      />
    )
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Top Bar */}
      <RoomHeader />

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col overflow-hidden md:flex-row bg-[#F3F3F3]">
        <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-[0.03] pointer-events-none" />
        {/* Video Area */}
        <div className="relative flex flex-1 flex-col min-h-0 overflow-hidden">
          {isSessionBreakoutActive && (
            <BreakoutBanner 
              breakoutRoomName={breakoutRoomName}
              breakoutStatus={breakoutStatus}
              countdownSeconds={countdownSeconds}
              formattedTime={formattedTime}
            />
          )}
          <div className="flex-1 relative min-h-0">
            <VideoGrid />

          </div>
          {/* AI Room subtitles — only show in AI rooms when enabled */}
          {isAISession && showCC && <SubtitleOverlay />}
          {/* Non-AI Room subtitles — only show in non-AI rooms when enabled */}
          {!isAISession && showRoomSubtitles && (
            <SubtitleOverlayNonAI showRoomSubtitles={showRoomSubtitles} />
          )}
        </div>

        {/* Desktop Side Panel */}
        <AnimatePresence initial={false}>
          {isSidePanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 376, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="hidden md:flex flex-col overflow-hidden relative py-5"
              style={{ width: 376 }}
            >
              <div className="w-[360px] h-full flex flex-col shrink-0 bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                {showParticipants && <ParticipantList />}
                {showVirtualBackground && <VirtualBackgroundPicker />}
                {showAvatarPicker && <AvatarUrlPicker />}
                {showBreakout && (
                  <BreakoutSidebarPanel
                    sessionId={parentSessionId}
                    onClose={() => setActiveSidePanel(null)}
                  />
                )}
                {showChat && (
                  <ChatBox
                    messages={messages}
                    currentUser={user}
                    onSendMessage={handleSendMessage}
                    isConnected={isConnected}
                    className="h-full w-full"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Overlay Side Panel */}
        <AnimatePresence initial={false}>
          {isSidePanelOpen && (
            <div className="md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-30 flex bg-black/40"
                onClick={() => setActiveSidePanel(null)}
              >
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "tween", duration: 0.2 }}
                  className="ml-auto flex h-full w-full max-w-sm flex-col bg-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="text-black flex w-full items-center gap-2 border-b border-[#E5E5E5] px-4 py-3 text-left hover:bg-gray-50"
                    onClick={() => setActiveSidePanel(null)}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary2/10">
                      <ChevronRight className="rotate-180" />
                    </span>
                    <div className="text-base font-semibold">
                      {sidePanelTitle}
                    </div>
                  </button>

                  <div className="flex-1 overflow-y-auto">
                    {showParticipants && <ParticipantList hideTitle />}
                    {showVirtualBackground && <VirtualBackgroundPicker />}
                    {showAvatarPicker && <AvatarUrlPicker />}
                    {showBreakout && (
                      <BreakoutSidebarPanel
                        sessionId={parentSessionId}
                        onClose={() => setActiveSidePanel(null)}
                      />
                    )}
                    {showChat && (
                      <ChatBox
                        messages={messages}
                        currentUser={user}
                        onSendMessage={handleSendMessage}
                        isConnected={isConnected}
                        className="h-full w-full"
                        hideTitle
                      />
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <VideoCallControlBar />
    </div>
  )
}

const VideoCallRoom = () => (
  <VideoCallProvider>
    <VideoCallRoomContent />
  </VideoCallProvider>
)

export default VideoCallRoom
