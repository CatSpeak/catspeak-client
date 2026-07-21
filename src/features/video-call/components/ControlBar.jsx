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
  Split,
  LayoutGrid,
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
import RightSideControls from "./RightSideControls"
import { useGame } from "@/features/games/context/GameContext"
import RecordingButton from "./RecordingButton"
import toast from "react-hot-toast"

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
    <div className="flex w-full items-center justify-center gap-2 bg-white p-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex md:gap-4 gap-5 w-full items-center md:justify-center justify-center">
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
          inactiveClassOverride="bg-[#F5F5F5] md:bg-transparent hover:bg-[#D9D9D9] text-black"
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
          inactiveClassOverride="bg-[#F5F5F5] md:bg-transparent hover:bg-[#D9D9D9] text-black"
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
          inactiveClassOverride="bg-[#F5F5F5] md:bg-transparent hover:bg-[#D9D9D9] text-black"

        />

        <ControlButton
          isActive={isHandRaised}
          isLoading={isTogglingHand}
          onClick={handleToggleHand}
          title={isHandRaised ? "Lower hand" : "Raise hand"}
          iconActive={<Hand className={iconClass} />}
          iconInactive={<Hand className={iconClass} />}
          inactiveClassOverride="bg-[#F5F5F5] md:bg-transparent hover:bg-[#D9D9D9] text-black"
        />

        {/* <ControlBarSubtitles className="hidden min-[426px]:flex" /> */}

        <div className="relative">
          <ControlButton
            isActive={showMoreMenu}
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            title={t?.rooms?.videoCall?.moreOptions || "More options"}
            iconActive={<MoreVertical className={iconClass} />}
            iconInactive={<MoreVertical className={iconClass} />}
            inactiveClassOverride="bg-[#F5F5F5] md:bg-transparent hover:bg-[#D9D9D9] text-black"
          />
          <ControlBarMoreMenu
            showMoreMenu={showMoreMenu}
            setShowMoreMenu={setShowMoreMenu}
            setShowGameModal={setShowGameModal}
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
          activeClassOverride="bg-[#990011] text-white hover:bg-[#e7001a] w-[62px]"
        />
      </div>


      <RightSideControls className="hidden md:flex mr-4 gap-2" />

      {
        showStopModal && (
          <StopRecordingModal
            open={showStopModal}
            onClose={cancelStopRecording}
            onConfirm={confirmStopRecording}
          />
        )
      }

      {
        showLeaveModal && (
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
        )
      }

    </div >
  );
}

export default VideoCallControlBar
