import React, { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
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
} from "lucide-react"
import { useRaiseHandMutation } from "@/store/api/livekitApi"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import ControlBarMoreMenu from "./ControlBarMoreMenu"
import StopRecordingModal from "./StopRecordingModal"
import { useLanguage } from "@/shared/context/LanguageContext"
import ControlButton from "./ControlButton"
import ControlBarSubtitles from "./ControlBarSubtitles"
import LeaveCallModal from "./LeaveCallModal"
import { useGame } from "@/features/games/context/GameContext"

const VideoCallControlBar = () => {
  const { t } = useLanguage()
  const { startGame } = useGame()
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
  } = useVideoCallContext()

  const [raiseHand, { isLoading: isTogglingHand }] = useRaiseHandMutation()
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showGameModal, setShowGameModal] = useState(false)

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

  const handleGameStart = ({ gameId, difficulty, language }) => {
    startGame(gameId, difficulty, language)
    setShowGameModal(false)
  }

  const unreadMessages = unreadRoomChat + unreadAiChat

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

      <div className="relative hidden min-[769px]:block">
        <ControlButton
          isActive={isRecording}
          isLoading={isTogglingRecording}
          onClick={handleToggleRecording}
          title={
            isRecording
              ? t.rooms?.videoCall?.controls?.recordOff || "Stop recording"
              : t.rooms?.videoCall?.controls?.recordOn || "Start recording"
          }
          iconActive={<Circle className={`${iconClass} fill-white`} />}
          iconInactive={<Circle className={`${iconClass} fill-none`} />}
          activeClassOverride="bg-red-600 hover:bg-red-700 text-white"
        >
          {isRecording && !isTogglingRecording && (
            <span className="pointer-events-none absolute inset-0 rounded-full animate-ping bg-red-500 opacity-30" />
          )}
        </ControlButton>
      </div>

      <ControlButton
        isActive={showParticipants}
        onClick={() => setShowParticipants(!showParticipants)}
        title={t.rooms?.videoCall?.controls?.participants || "Participants"}
        iconActive={<Users className={iconClass} />}
        iconInactive={<Users className={iconClass} />}
        className="hidden min-[426px]:flex"
      />

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
          setShowGameModal={setShowGameModal}
        />
      </div>

      <ControlButton
        isActive={true}
        onClick={promptLeaveCall}
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
          onConfirm={() => {
            cancelLeaveCall()
            handleLeaveSession()
          }}
        />
      )}

    </div>
  );
}

export default VideoCallControlBar
