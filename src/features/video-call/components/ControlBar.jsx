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
} from "lucide-react"
import { useRaiseHandMutation } from "@/store/api/livekitApi"
import { useGetBreakoutStatusQuery } from "@/store/api/roomsApi"
import { isBreakoutSupported } from "@/features/video-call/utils/roomTypeHelpers"
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
import { safeSetLiveKitMetadata } from "@/features/video-call/utils/livekitMetadataUtils"

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
    lkRoom,
    user,
    participants,
    isAISession,
    isHost: isHostFromContext,
  } = useVideoCallContext()

  const { isBreakoutActive, parentSessionId } = useSelector((s) => s.videoCall)
  const isHost = isHostFromContext

  const { data: breakoutStatus } = useGetBreakoutStatusQuery(parentSessionId, {
    skip: !parentSessionId,
  })

  const [raiseHand, { isLoading: isTogglingHand }] = useRaiseHandMutation()
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showGameModal, setShowGameModal] = useState(false)

  const handleToggleHand = async () => {
    const newRaised = !isHandRaised
    if (lkRoom?.localParticipant) {
      safeSetLiveKitMetadata(lkRoom.localParticipant, {
        handRaised: newRaised,
        handRaisedAt: newRaised ? Date.now() : 0,
      })
    }
    if (sessionId) {
      try {
        await raiseHand({ sessionId, isRaised: newRaised }).unwrap()
      } catch (error) {
        console.warn("Backend raiseHand notification error (LiveKit metadata active):", error)
      }
    }
  }

  const handleGameStart = ({ gameId, difficulty, language }) => {
    startGame(gameId, difficulty, language)
    setShowGameModal(false)
  }

  const unreadMessages = unreadRoomChat + unreadAiChat

  const iconClass = "w-6 h-6"

  return (
    <div className="flex w-full items-center justify-center gap-2 bg-white p-2  border-t border-border">
      <div className="flex gap-2 w-full items-center md:justify-center justify-center">
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
          inactiveClassOverride="bg-primaryBg hover:bg-[#E6E6E6] text-black"
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
          inactiveClassOverride="bg-primaryBg hover:bg-[#E6E6E6] text-black"
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
          className="hidden md:flex"
          inactiveClassOverride="bg-primaryBg hover:bg-[#E6E6E6] text-black"
        />

        <div className="relative hidden min-[769px]:block z-50">
          <RecordingButton
            isRecording={isRecording}
            isTogglingRecording={isTogglingRecording}
            onToggleRecording={handleToggleRecording}
            onStopRecording={confirmStopRecording}
          />
        </div>

        {!isAISession &&
          isBreakoutSupported(room?.roomType) &&
          (isHost || isBreakoutActive || breakoutStatus?.isBreakoutActive) && (
            <ControlButton
              isActive={showBreakout}
              onClick={() => setShowBreakout(!showBreakout)}
              title="Breakout Rooms"
              iconActive={<Split className={iconClass} />}
              iconInactive={<Split className={iconClass} />}
              className="hidden min-[769px]:flex"
              inactiveClassOverride="bg-primaryBg hover:bg-[#E6E6E6] text-black"
            />
          )}

        <ControlButton
          isActive={isHandRaised}
          isLoading={isTogglingHand}
          onClick={handleToggleHand}
          title={isHandRaised ? "Lower hand" : "Raise hand"}
          iconActive={<Hand className={iconClass} />}
          iconInactive={<Hand className={iconClass} />}
          inactiveClassOverride="bg-primaryBg hover:bg-[#E6E6E6] text-black"
        />

        {/* <ControlBarSubtitles className="hidden min-[426px]:flex" /> */}

        <div className="relative">
          <ControlButton
            isActive={showMoreMenu}
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            title={t?.rooms?.videoCall?.moreOptions || "More options"}
            iconActive={<MoreVertical className={iconClass} />}
            iconInactive={<MoreVertical className={iconClass} />}
            inactiveClassOverride="bg-primaryBg hover:bg-[#E6E6E6] text-black"
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
              toast.error(
                "Bạn không thể rời phòng khi đang chia nhóm nhỏ. Vui lòng đóng tất cả phòng thảo luận trước.",
              )
              return
            }
            promptLeaveCall()
          }}
          title={t?.rooms?.videoCall?.leaveCall || "Leave call"}
          iconActive={<Phone className={`rotate-[135deg] ${iconClass}`} />}
          iconInactive={<Phone className={`rotate-[135deg] ${iconClass}`} />}
          activeClassOverride="bg-red-600 hover:bg-red-700 text-white"
        />
      </div>

      <RightSideControls className="hidden md:flex gap-2" />

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
