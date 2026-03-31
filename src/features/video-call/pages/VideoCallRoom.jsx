import React from "react"
import { Navigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import HeaderLogo from "@/layouts/MainLayout/Header/HeaderLogo"

import {
  VideoGrid,
  ParticipantList,
  ChatBox,
  ControlBar as VideoCallControlBar,
  useSessionTimer,
} from "@/features/video-call"
import { formatDate } from "@/shared/utils/dateFormatter"

import { useVideoCallContext } from "@/features/video-call/context/VideoCallContext"
import { VideoCallProvider } from "@/features/video-call/context/VideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getTranslatedRoomName } from "@/features/rooms/utils/roomNameUtils"

const VideoCallRoomContent = () => {
  const { t } = useLanguage()
  const {
    location,
    micOn,
    cameraOn,
    showChat,
    setShowChat,
    showParticipants,
    setShowParticipants,
    user,
    currentUserId,
    localParticipantId,
    session,
    participantIds,
    messages,
    isConnected,
    handleToggleMic,
    handleToggleCam,
    handleSendMessage,
    handleLeaveSession,
    // Screen share
    screenShareOn,
    screenShareStream,
    screenSharePresenterId,
    isLocalScreenShare,
    presenterDisplayName,
    handleToggleScreenShare,
    // Room data
    room,
  } = useVideoCallContext()

  const { formattedElapsed, formattedMax } = useSessionTimer(session)

  const rawRoomName = session?.name || session?.roomName || "General"
  const translatedName = React.useMemo(() => {
    return getTranslatedRoomName(rawRoomName, t)
  }, [rawRoomName, t?.rooms?.specialNames])

  const isSidePanelOpen = showChat || showParticipants
  const sidePanelTitle = showParticipants
    ? t.rooms.videoCall.participantList.title
    : t.rooms.chatBox.title

  // Unread message count
  const [unreadMessages, setUnreadMessages] = React.useState(0)
  const prevMessagesLength = React.useRef(messages.length)

  React.useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      if (!showChat) {
        let newUnread = 0
        for (let i = prevMessagesLength.current; i < messages.length; i++) {
          if (String(messages[i].senderId) !== String(currentUserId))
            newUnread++
        }
        setUnreadMessages((prev) => prev + newUnread)
      }
    }
    prevMessagesLength.current = messages.length
  }, [messages, showChat, currentUserId])

  React.useEffect(() => {
    if (showChat) setUnreadMessages(0)
  }, [showChat])

  if (!user) return <Navigate to="/" state={{ from: location }} replace />

  return (
    <div className="flex h-full w-full flex-col bg-primary2 text-textColor font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#C6C6C6] bg-white px-3 py-2 shadow-sm md:px-6 md:py-4">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden w-40 shrink-0 items-center md:flex">
            <HeaderLogo />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-sm font-semibold text-gray-900 md:text-base">
                {translatedName}
              </div>
              {room?.requiredLevel && (
                <span className="rounded-full bg-[#990011] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {room.requiredLevel}
                </span>
              )}
              {room?.topic &&
                room.topic.split(",").map((t_topic) => {
                  const trimmed = t_topic.trim()
                  return (
                    <span
                      key={trimmed}
                      className="rounded-full bg-[#990011] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                    >
                      {t.rooms.createRoom?.topics?.[trimmed.toLowerCase()] ||
                        trimmed}
                    </span>
                  )
                })}
            </div>
            <div className="hidden text-sm text-[#7A7574] md:block">
              {formatDate(new Date())}
            </div>
          </div>
        </div>
        {formattedElapsed && formattedElapsed !== "00:00" && (
          <div className="text-xs font-medium text-[#7A7574] md:text-sm">
            {formattedElapsed}
            {formattedMax ? ` / ${formattedMax}` : ""}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Video Area */}
        <div className="relative flex flex-1 flex-col min-h-0 overflow-hidden bg-gradient-to-br from-primary2 via-white to-primary2">
          <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-[0.03] pointer-events-none" />
          <VideoGrid
            participantIds={participantIds}
            screenShareOn={screenShareOn}
            screenShareStream={screenShareStream}
            screenSharePresenterId={screenSharePresenterId}
            presenterDisplayName={presenterDisplayName}
            isLocalScreenShare={isLocalScreenShare}
          />
        </div>

        {/* Desktop Side Panel */}
        {isSidePanelOpen && (
          <div className="hidden w-80 flex-col border-l border-[#C6C6C6] bg-white md:flex">
            {showParticipants && (
              <ParticipantList
                participantIds={participantIds}
                currentUserId={currentUserId}
                localMicOn={micOn}
                localCameraOn={cameraOn}
              />
            )}
            {showChat && !showParticipants && (
              <ChatBox
                messages={messages}
                currentUser={user}
                localParticipantId={localParticipantId}
                onSendMessage={handleSendMessage}
                isConnected={isConnected}
                className="h-full w-full"
              />
            )}
          </div>
        )}

        {/* Mobile Overlay Side Panel */}
        {isSidePanelOpen && (
          <div className="md:hidden">
            <div
              className="fixed inset-0 z-30 flex bg-black/40"
              onClick={() => {
                setShowChat(false)
                setShowParticipants(false)
              }}
            >
              <div
                className="ml-auto flex h-full w-full max-w-sm flex-col bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="text-black flex w-full items-center gap-2 border-b border-[#C6C6C6] px-4 py-3 text-left hover:bg-gray-50"
                  onClick={() => {
                    setShowChat(false)
                    setShowParticipants(false)
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
                  {showParticipants && (
                    <ParticipantList
                      participantIds={participantIds}
                      currentUserId={currentUserId}
                      localMicOn={micOn}
                      localCameraOn={cameraOn}
                      hideTitle
                    />
                  )}
                  {showChat && !showParticipants && (
                    <ChatBox
                      messages={messages}
                      currentUser={user}
                      localParticipantId={localParticipantId}
                      onSendMessage={handleSendMessage}
                      isConnected={isConnected}
                      className="h-full w-full"
                      hideTitle
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <VideoCallControlBar
        micOn={micOn}
        cameraOn={cameraOn}
        screenShareOn={screenShareOn}
        showChat={showChat}
        setShowChat={setShowChat}
        showParticipants={showParticipants}
        setShowParticipants={setShowParticipants}
        unreadMessages={unreadMessages}
        handleToggleMic={handleToggleMic}
        handleToggleCam={handleToggleCam}
        handleToggleScreenShare={handleToggleScreenShare}
        handleLeaveSession={handleLeaveSession}
      />
    </div>
  )
}

const VideoCallRoom = () => (
  <VideoCallProvider>
    <VideoCallRoomContent />
  </VideoCallProvider>
)

export default VideoCallRoom
