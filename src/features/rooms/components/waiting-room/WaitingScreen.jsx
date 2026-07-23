import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Copy, Mic, Video, Volume2, Info, Check, X, Edit2 } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import ParticipantsPreview from "./ParticipantsPreview"
import VideoPreview from "./VideoPreview"
import RoomInformation from "./RoomInformation"
import EditNickname from "./EditNickName"
import { useLanguage } from "@/shared/context/LanguageContext"
import meetingFallbackImageZH from "@/shared/assets/images/rooms/THUMBNAIL-TQ.png"
import meetingFallbackImageEN from "@/shared/assets/images/rooms/THUMBNAIL-ANH.png"
import FullscreenOverlayShell from "@/layouts/VideoCallLayout/FullscreenOverlayShell"
import { getCommunityPath } from "@/shared/utils/navigation"
import VirtualBackgroundModal from "@/features/video-call/components/VirtualBackgroundModal"
import EditNicknameModal from "./EditNicknameModal"

import DeviceSettingsModal from "./DeviceSettingsModal"

const WaitingScreen = ({
  session,
  room,
  participantCount,
  localStream,
  lkVideoTrack,
  micOn,
  cameraOn,
  user,
  onToggleMic,
  onToggleCam,
  onJoin,
  isFull = false,
  maxParticipants = 5,
  deviceSelection,
}) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const participants = room?.currentParticipants || session?.participants || []
  const meetingFallbackImage = room?.languageType === "English" ? meetingFallbackImageEN : meetingFallbackImageZH
  const { t, language } = useLanguage()
  const { lang } = useParams()
  const effectiveParticipantCount = participantCount ?? participants.length
  const [isBgModalOpen, setIsBgModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const [isEditingName, setIsEditingName] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success(t?.rooms?.waitingScreen?.linkCopied || "Link copied!")
  }

  return (
    <FullscreenOverlayShell
      backgroundImageUrl={room?.thumbnailUrl || meetingFallbackImage}
      onBack={() => navigate(getCommunityPath(lang || language))}
      backLabel={t.rooms.waitingScreen.backToCommunity}
      maxWidthClass="max-w-[85vw]"
      cardClassName="rounded-[12px] h-auto min-w-fit"
    >
      <div className="flex flex-col lg:flex-row items-center w-full">
        {/* Video Preview & Participants */}
        <div className="flex w-full lg:w-3/5 flex-col items-center gap-4">
          <RoomInformation
            session={session}
            room={room}
            participants={participants}
            participantCount={participantCount}
            className="block lg:hidden"
          />

          <VideoPreview
            user={user}
            localStream={localStream}
            lkVideoTrack={lkVideoTrack}
            micOn={micOn}
            cameraOn={cameraOn}
            onToggleMic={onToggleMic}
            onToggleCam={onToggleCam}
            onOpenBgModal={() => setIsBgModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />

          {/* Edit nickname */}
          <EditNickname
            user={user}
            onEditName={() => setIsEditingName(true)}
            className="lg:flex hidden"
          />
        </div>

        <div className="flex w-full lg:w-2/5 items-center flex-col space-y-6 justify-center">
          {/* Room name, topic & participants preview */}
          <RoomInformation
            session={session}
            room={room}
            participants={participants}
            participantCount={participantCount}
            className="hidden lg:block"
          />

          {/* Copy Link, Join Buttons */}
          <div className="flex flex-col items-center gap-3 w-full max-w-[400px]">
            <div className="flex w-full flex-col flex-wrap md:flex-row gap-2 lg:max-w-[240px] md:max-w-full">
              <PillButton
                onClick={onJoin}
                disabled={isFull}
                aria-disabled={isFull}
                title={isFull ? t.rooms.waitingScreen.roomFull : undefined}
                className="w-full sm:flex-1"
              >
                {t.rooms.waitingScreen.joinNow}
              </PillButton>
              <PillButton
                onClick={handleCopyLink}
                variant="secondary"
                startIcon={<Copy />}
                className="w-full sm:flex-1"
              >
                {t?.rooms?.waitingScreen?.copyLink || "Copy Link"}
              </PillButton>
            </div>

            {isFull && (
              <p className="text-sm text-red-600">
                {t.rooms.waitingScreen.roomFull} ({effectiveParticipantCount}/
                {maxParticipants})
              </p>
            )}

            <EditNickname
              user={user}
              onEditName={() => setIsEditingName(true)}
              className="lg:hidden flex"
            />
          </div>
        </div>
      </div>

      <EditNicknameModal
        open={isEditingName}
        onClose={() => setIsEditingName(false)}
        user={user}
        t={t}
      />

      <VirtualBackgroundModal
        open={isBgModalOpen}
        onClose={() => setIsBgModalOpen(false)}
        localStream={localStream}
        lkVideoTrack={lkVideoTrack}
        cameraOn={cameraOn}
        onToggleCam={onToggleCam}
        room={room}
      />

      {deviceSelection && (
        <DeviceSettingsModal
          open={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          deviceSelection={deviceSelection}
          localStream={localStream}
          micOn={micOn}
          onToggleMic={onToggleMic}
          t={t}
        />
      )}
    </FullscreenOverlayShell>
  )
}

export default WaitingScreen
