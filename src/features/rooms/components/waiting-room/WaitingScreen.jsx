import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Copy, Mic, Video, Volume2, Info, Check, X, Edit2 } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import ProgressBar from "@/shared/components/ui/ProgressBar"
import ParticipantsPreview from "./ParticipantsPreview"
import VideoPreview from "./VideoPreview"
import RoomInformation from "./RoomInformation"
import EditNickname from "./EditNickName"
import { useLanguage } from "@/shared/context/LanguageContext"
import meetingFallbackImageZH from "@/shared/assets/images/rooms/THUMBNAIL-TQ.png"
import meetingFallbackImageEN from "@/shared/assets/images/rooms/THUMBNAIL-ANH.png"
import meetingFallbackImageJP from "@/shared/assets/images/rooms/THUMBNAIL-NHAT.jpg"
import FullscreenOverlayShell from "@/layouts/VideoCallLayout/FullscreenOverlayShell"
import { getCommunityPath } from "@/shared/utils/navigation"
import VirtualBackgroundModal from "@/features/video-call/components/VirtualBackgroundModal"
import EditNicknameModal from "./EditNicknameModal"
import { copyRoomLink } from "@/shared/utils/shareUtils"
import { filterHumanParticipants } from "@/features/video-call/utils/participantIdentity"

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
  isJoining = false,
  isFull = false,
  maxParticipants = 5,
  deviceSelection,
}) => {
  const navigate = useNavigate()
  // Human-only: API details are already filtered, this guards stale caches.
  const participants = filterHumanParticipants(
    room?.currentParticipants || session?.participants || [],
  )
  const meetingFallbackImage =
    room?.languageType === "Japanese"
      ? meetingFallbackImageJP
      : "Chinese" === room?.languageType
        ? meetingFallbackImageZH
        : meetingFallbackImageEN
  const { t, language } = useLanguage()
  const { lang } = useParams()
  const effectiveParticipantCount = participantCount ?? participants.length
  const [isBgModalOpen, setIsBgModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const [isEditingName, setIsEditingName] = useState(false)

  // Wait time guidelines: <200ms (no indicator), 200ms-5s (loading indicator), >5s (progress indicator)
  const [showButtonSpinner, setShowButtonSpinner] = useState(false)
  const [isLongJoining, setIsLongJoining] = useState(false)
  const [longProgress, setLongProgress] = useState(25)

  useEffect(() => {
    if (!isJoining) {
      setShowButtonSpinner(false)
      setIsLongJoining(false)
      setLongProgress(25)
      return
    }

    // Instant (< 200ms): suppress indicator
    const instantTimer = setTimeout(() => {
      setShowButtonSpinner(true)
    }, 200)

    // Long (> 5s): escalate to progress indicator
    const longTimer = setTimeout(() => {
      setIsLongJoining(true)
    }, 5000)

    return () => {
      clearTimeout(instantTimer)
      clearTimeout(longTimer)
    }
  }, [isJoining])

  // Long wait progress simulation (> 5s)
  useEffect(() => {
    if (!isLongJoining) return
    const interval = setInterval(() => {
      setLongProgress((prev) => (prev < 90 ? prev + (90 - prev) * 0.12 : prev))
    }, 600)
    return () => clearInterval(interval)
  }, [isLongJoining])

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
      onBack={() => navigate(-1)}
      backLabel={t.rooms.waitingScreen.backToCommunity}
      maxWidthClass="max-w-[520px] lg:max-w-6xl"
      contentClassName="max-md:min-h-0"
      cardClassName="h-full md:h-auto"
      rounded="rounded-3xl"
    >
      {webview.isWebView && (
        <div className="mb-4 w-full rounded-lg bg-amber-500/15 border border-amber-500/30 p-3 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-950 dark:text-amber-300">
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
        className="block lg:hidden mb-4 shrink-0"
      />

      {/* Mobile: flex-1 + min-h-0 lets this row shrink so the card fits the
          viewport; from md up it goes back to its natural height. */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 w-full items-center flex-1 min-h-0 md:flex-none">
        {/* Left Column: Video Preview & Nickname */}
        <div className="flex flex-col items-center w-full lg:col-span-7 flex-1 min-h-0 md:flex-none">
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
        <div className="flex flex-col items-center justify-center w-full lg:col-span-5 h-auto lg:h-full gap-4 shrink-0">
          {/* Desktop Only: Room name, topic & participants preview */}
          <RoomInformation
            session={session}
            room={room}
            participants={participants}
            participantCount={participantCount}
            className="hidden lg:block"
          />

          {/* Copy Link, Join Buttons */}
          <div className="flex flex-col items-center w-full max-w-[360px]">
            <div className="flex w-full flex-col sm:flex-row gap-2">
              <PillButton
                onClick={onJoin}
                disabled={isFull || isJoining}
                loading={showButtonSpinner}
                loadingText={
                  isLongJoining
                    ? (t?.rooms?.videoCall?.provider?.connecting ?? "Đang kết nối...")
                    : t.rooms.waitingScreen.joinNow
                }
                aria-disabled={isFull || isJoining}
                title={isFull ? t.rooms.waitingScreen.roomFull : undefined}
                className="w-full sm:flex-1"
              >
                {t.rooms.waitingScreen.joinNow}
              </PillButton>
              <PillButton
                onClick={handleCopyLink}
                disabled={isJoining}
                variant="secondary"
                className="w-full sm:flex-1"
              >
                {t?.rooms?.waitingScreen?.copyLink || "Copy Link"}
              </PillButton>
            </div>

            {/* Long wait (> 5s): Progress indicator */}
            {isLongJoining && (
              <div className="w-full mt-3 animate-fadeIn">
                <ProgressBar
                  progress={longProgress}
                  heightClass="h-1.5"
                  colorClass="bg-cath-red-700 dark:bg-red-500"
                  trackColorClass="bg-neutral-200 dark:bg-neutral-800"
                />
                <p className="mt-1.5 text-center text-xs text-neutral-500 dark:text-neutral-400 animate-pulse">
                  {t?.rooms?.videoCall?.provider?.connectingLongWait ??
                    "Đang chuẩn bị phòng học, vui lòng đợi trong giây lát..."}
                </p>
              </div>
            )}

            {isFull && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {t.rooms.waitingScreen.roomFull} ({effectiveParticipantCount}/
                {maxParticipants})
              </p>
            )}

            <EditNickname
              user={user}
              onEditName={() => setIsEditingName(true)}
              className="flex lg:hidden"
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
