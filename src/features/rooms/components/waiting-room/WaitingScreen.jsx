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
import { copyRoomLink } from "@/shared/utils/shareUtils"

import DeviceSettingsModal from "./DeviceSettingsModal"
import { detectWebView } from "@/shared/utils/isWebView"
import { AlertTriangle } from "lucide-react"

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

  const webview = detectWebView()

  const handleCopyLink = () => {
    copyRoomLink({
      baseUrl: window.location.href,
      room,
      successMessage: t?.rooms?.waitingScreen?.linkCopied,
    })
  }

  return (
    <FullscreenOverlayShell
      backgroundImageUrl={room?.thumbnailUrl || meetingFallbackImage}
      onBack={() => navigate(getCommunityPath(lang || language))}
      backLabel={t.rooms.waitingScreen.backToCommunity}
      maxWidthClass="max-w-[85vw]"
      cardClassName="rounded-[12px] h-auto min-w-fit"
    >
      {webview.isWebView && (
        <div className="mb-4 w-full rounded-lg bg-amber-500/15 border border-amber-500/30 p-3 text-amber-200 text-sm flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-300">
              {t?.rooms?.waitingScreen?.webViewWarning ??
                "You are in an in-app browser. Please tap '...' and select 'Open in Safari' to use your microphone and camera."}
            </p>
          </div>
        </div>
      )}

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
