import React, { useState } from "react"
import { useSelector } from "react-redux"
import {
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  MessageSquare,
  Users,
  Mic,
  MicOff,
  Phone,
  Circle,
  MoreVertical,
  Hand,
  Split,
} from "lucide-react"
import { useRaiseHandMutation } from "@/store/api/livekitApi"
import { useGetBreakoutStatusQuery } from "@/store/api/roomsApi"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import ControlBarMoreMenu from "./ControlBarMoreMenu"
import StopRecordingModal from "./StopRecordingModal"
import { useLanguage } from "@/shared/context/LanguageContext"
import ControlButton from "./ControlButton"
import ControlBarSubtitles from "./ControlBarSubtitles"
import LeaveCallModal from "./LeaveCallModal"
import RecordingButton from "./RecordingButton"

const VideoCallControlBar = () => {
  const { t } = useLanguage()

  const {
    micOn,
    cameraOn,
    isLocalScreenShare,
    isTogglingMic,
    isTogglingCam,
    isTogglingScreenShare,
    showChat,
    setShowChat,
    showParticipants,
    setShowParticipants,
    showBreakout,
    setShowBreakout,
    handleToggleMic,
    handleToggleCam,
    handleToggleScreenShare,
    handleLeaveSession,
    // Leave Call Modal
    showLeaveModal,
    promptLeaveCall,
    cancelLeaveCall,
    // Recording
    isRecording,
    isTogglingRecording,
    handleToggleRecording,
    showStopModal,
    confirmStopRecording,
    cancelStopRecording,
    unreadRoomChat,
    unreadAiChat,
    isHandRaised,
    sessionId,
    room,
    user,
    participants,
    isAISession,
  } = useVideoCallContext()

  const { isBreakoutActive, parentSessionId } = useSelector((s) => s.videoCall)
  const isHost = room?.creatorId === user?.accountId

  const { data: breakoutStatus } = useGetBreakoutStatusQuery(parentSessionId, {
    skip: !parentSessionId,
  })

  const [raiseHand, { isLoading: isTogglingHand }] = useRaiseHandMutation()

  const handleToggleHand = async () => {
    console.log(
      "Toggle hand clicked. SessionId:",
      sessionId,
      "isHandRaised:",
      isHandRaised,
    )
    if (!sessionId) {
      console.warn("Cannot raise hand: sessionId is missing in context!")
      return
    }
    try {
      await raiseHand({ sessionId, isRaised: !isHandRaised }).unwrap()
    } catch (error) {
      console.error("Failed to toggle hand raise:", error)
    }
  }

  const unreadMessages = unreadRoomChat + unreadAiChat
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const iconClass = "w-6 h-6"

  return (
    <div className="flex w-full items-center justify-center gap-2 border-t border-[#E5E5E5] bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <ControlButton
        isActive={micOn}
        isLoading={isTogglingMic}
        onClick={handleToggleMic}
        title={
          micOn
            ? t.rooms?.videoCall?.controls?.micOff || "Turn microphone off"
            : t.rooms?.videoCall?.controls?.micOn || "Turn microphone on"
        }
        iconActive={<Mic className={iconClass} />}
        iconInactive={<MicOff className={iconClass} />}
        className="z-10"
      />

      <ControlButton
        isActive={cameraOn}
        isLoading={isTogglingCam}
        onClick={handleToggleCam}
        title={
          cameraOn
            ? t.rooms?.videoCall?.controls?.camOff || "Turn camera off"
            : t.rooms?.videoCall?.controls?.camOn || "Turn camera on"
        }
        iconActive={<Video className={iconClass} />}
        iconInactive={<VideoOff className={iconClass} />}
      />

      <ControlButton
        isActive={isLocalScreenShare}
        isLoading={isTogglingScreenShare}
        onClick={handleToggleScreenShare}
        title={
          isLocalScreenShare
            ? t.rooms?.videoCall?.controls?.shareOff || "Stop sharing"
            : t.rooms?.videoCall?.controls?.shareOn || "Share screen"
        }
        iconActive={<MonitorOff className={iconClass} />}
        iconInactive={<MonitorUp className={iconClass} />}
        className="hidden min-[769px]:flex"
      />

      <div className="relative hidden min-[769px]:block z-[9999]">
        <RecordingButton
          isRecording={isRecording}
          isTogglingRecording={isTogglingRecording}
          onToggleRecording={handleToggleRecording}
          onStopRecording={confirmStopRecording}
        />
      </div>

      <ControlButton
        isActive={showParticipants}
        onClick={() => setShowParticipants(!showParticipants)}
        title={t.rooms?.videoCall?.controls?.participants || "Participants"}
        iconActive={<Users className={iconClass} />}
        iconInactive={<Users className={iconClass} />}
        className="hidden min-[426px]:flex"
      />

      {!isAISession && (isHost || isBreakoutActive || breakoutStatus?.isBreakoutActive) && (
        <ControlButton
          isActive={showBreakout}
          onClick={() => setShowBreakout(!showBreakout)}
          title="Breakout Rooms"
          iconActive={<Split className={iconClass} />}
          iconInactive={<Split className={iconClass} />}
          className="hidden min-[769px]:flex"
        />
      )}

      <ControlButton
        isActive={isHandRaised}
        isLoading={isTogglingHand}
        onClick={handleToggleHand}
        title={isHandRaised ? "Lower hand" : "Raise hand"}
        iconActive={<Hand className={iconClass} />}
        iconInactive={<Hand className={iconClass} />}
      />

      <ControlBarSubtitles className="hidden min-[426px]:flex" />

      <div className="relative">
        <ControlButton
          isActive={showChat}
          onClick={() => setShowChat(!showChat)}
          title={t.rooms?.videoCall?.controls?.chat || "Chat"}
          iconActive={<MessageSquare className={iconClass} />}
          iconInactive={<MessageSquare className={iconClass} />}
        />
        {unreadMessages > 0 && (
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm pointer-events-none z-10">
            {unreadMessages > 9 ? "9+" : unreadMessages}
          </div>
        )}
      </div>

      <div className="relative">
        <ControlButton
          isActive={showMoreMenu}
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          title={t?.rooms?.videoCall?.moreOptions || "More options"}
          iconActive={<MoreVertical className={iconClass} />}
          iconInactive={<MoreVertical className={iconClass} />}
        />
        <ControlBarMoreMenu
          showMoreMenu={showMoreMenu}
          setShowMoreMenu={setShowMoreMenu}
        />
      </div>

      <ControlButton
        isActive={true}
        onClick={() => {
          if (isHost && isBreakoutActive) {
            toast.error("Bạn không thể rời phòng khi đang chia nhóm nhỏ. Vui lòng đóng tất cả phòng thảo luận trước.")
            return
          }
          promptLeaveCall()
        }}
        title={t?.rooms?.videoCall?.leaveCall || "Leave call"}
        iconActive={<Phone className={`rotate-[135deg] ${iconClass}`} />}
        iconInactive={<Phone className={`rotate-[135deg] ${iconClass}`} />}
        activeClassOverride="bg-[#d40018] text-white hover:bg-[#e7001a]"
      />

      {showStopModal && (
        <StopRecordingModal
          open={showStopModal}
          onClose={cancelStopRecording}
          onConfirm={confirmStopRecording}
        />
      )}

      {showLeaveModal && (
        <LeaveCallModal
          open={showLeaveModal}
          onClose={cancelLeaveCall}
          isHost={isHost}
          isBreakoutActive={isBreakoutActive}
          onConfirm={() => {
            if (isHost && isBreakoutActive) {
              toast.error("Vui lòng đóng tất cả phòng nhỏ trước khi rời phòng.")
              return
            }
            cancelLeaveCall()
            handleLeaveSession()
          }}
        />
      )}
    </div>
  )
}

export default VideoCallControlBar
