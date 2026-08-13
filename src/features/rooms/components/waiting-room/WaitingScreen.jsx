import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
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
  const participants = room?.currentParticipants || session?.participants || []
  const meetingFallbackImage =
    room?.languageType === "English"
      ? meetingFallbackImageEN
      : meetingFallbackImageZH
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
      maxWidthClass="max-w-[520px] lg:max-w-6xl"
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

      {/* Mobile/Tablet Header: Room Information at top (< 1024px) */}
      <RoomInformation
        session={session}
        room={room}
        participants={participants}
        participantCount={participantCount}
        className="block lg:hidden mb-4"
      />

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 w-full items-center">
        {/* Left Column: Video Preview & Nickname */}
        <div className="flex flex-col items-center w-full lg:col-span-7 gap-3">
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

          {/* Edit nickname for Desktop */}
          <EditNickname
            user={user}
            onEditName={() => setIsEditingName(true)}
            className="hidden lg:flex"
          />
        </div>

        {/* Right Column: Room Details & Action Container */}
        <div className="flex flex-col items-center justify-center w-full lg:col-span-5 h-full gap-6">
          {/* Desktop Only: Room name, topic & participants preview */}
          <RoomInformation
            session={session}
            room={room}
            participants={participants}
            participantCount={participantCount}
            className="hidden lg:block"
          />

          {/* Copy Link, Join Buttons */}
          <div className="flex flex-col items-center gap-3 w-full max-w-[360px]">
            <div className="flex w-full flex-col sm:flex-row gap-2.5">
              <PillButton
                onClick={onJoin}
                disabled={isFull}
                aria-disabled={isFull}
                title={isFull ? t.rooms.waitingScreen.roomFull : undefined}
                className="w-full sm:flex-1 py-2.5"
              >
                {t.rooms.waitingScreen.joinNow}
              </PillButton>
              <PillButton
                onClick={handleCopyLink}
                variant="secondary"
                startIcon={<Copy />}
                className="w-full sm:flex-1 py-2.5"
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
              className="flex lg:hidden mt-1"
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
