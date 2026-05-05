import React, { useState, useRef, useEffect } from "react"
import { Navigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useConnectionState } from "@livekit/components-react"
import { ConnectionState } from "livekit-client"

import {
  VideoGrid,
  ParticipantList,
  ChatBox,
  ControlBar as VideoCallControlBar,
  RoomHeader,
} from "@/features/video-call"
import VirtualBackgroundPicker from "@/features/video-call/components/VirtualBackgroundPicker"

import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { VideoCallProvider } from "@/features/video-call/context/VideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import VideoCallLoading from "@/features/video-call/components/VideoCallLoading"

const VideoCallRoomContent = () => {
  const { t } = useLanguage()
  const {
    showChat,
    setShowChat,
    showParticipants,
    setShowParticipants,
    showVirtualBackground,
    setShowVirtualBackground,
    // Auth guard
    user,
    location,
    // Header info
    session,
    room,
    // ChatBox props (presentational component — keeps props-based API)
    messages,
    handleSendMessage,
    isConnected,
    // PiP controls
    enterPiP,
  } = useVideoCallContext()

  const isSidePanelOpen = showChat || showParticipants || showVirtualBackground
  const sidePanelTitle = showParticipants
    ? t.rooms.videoCall.participantList.title
    : showVirtualBackground
      ? t.rooms?.videoCall?.applyVisualEffects || "Backgrounds and effects"
      : t.rooms.chatBox.title

  // Unread message count
  const [unreadMessages, setUnreadMessages] = useState(0)
  const prevMessagesLength = useRef(messages.length)

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      if (!showChat) {
        let newUnread = 0
        for (let i = prevMessagesLength.current; i < messages.length; i++) {
          // LiveKit chat: msg.from?.isLocal identifies own messages
          if (!messages[i].from?.isLocal) newUnread++
        }
        setUnreadMessages((prev) => prev + newUnread)
      }
    }
    prevMessagesLength.current = messages.length
  }, [messages, showChat])

  useEffect(() => {
    if (showChat) setUnreadMessages(0)
  }, [showChat])

  // ── LiveKit connection gate ──
  // The "Connecting…" loading screen from VideoCallProvider is dismissed
  // as soon as phase flips to "in-call", but LiveKit may still be
  // negotiating the WebSocket at that point.  Keep showing a loader
  // until the connection is fully established so that participant
  // metadata (name, avatar, etc.) is available when VideoGrid renders.
  const connectionState = useConnectionState()
  const livekitReady = connectionState === ConnectionState.Connected

  if (!user) return <Navigate to="/" state={{ from: location }} replace />

  if (!livekitReady) {
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
          <VideoGrid />
        </div>

        {/* Desktop Side Panel */}
        <AnimatePresence initial={false}>
          {isSidePanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 336, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="hidden md:flex flex-col overflow-hidden relative py-5"
              style={{ width: 336 }}
            >
              <div className="w-80 h-full flex flex-col shrink-0 bg-white rounded-lg shadow-sm border border-[#E5E5E5] overflow-hidden">
                {showParticipants && <ParticipantList />}
                {showVirtualBackground && <VirtualBackgroundPicker />}
                {showChat && !showParticipants && !showVirtualBackground && (
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
                onClick={() => {
                  setShowChat(false)
                  setShowParticipants(false)
                  setShowVirtualBackground(false)
                }}
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
                    onClick={() => {
                      setShowChat(false)
                      setShowParticipants(false)
                      setShowVirtualBackground(false)
                    }}
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
                    {showChat && !showParticipants && !showVirtualBackground && (
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

      <VideoCallControlBar unreadMessages={unreadMessages} />
    </div>
  )
}

const VideoCallRoom = () => (
  <VideoCallProvider>
    <VideoCallRoomContent />
  </VideoCallProvider>
)

export default VideoCallRoom
