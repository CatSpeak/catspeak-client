import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Copy, Mic, Video, Volume2, Info } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import ParticipantsPreview from "./ParticipantsPreview"
import VideoPreview from "./VideoPreview"
import { useLanguage } from "@/shared/context/LanguageContext"
import meetingFallbackImage from "@/shared/assets/images/LogoDefault.png"
import FullscreenOverlayShell from "@/layouts/VideoCallLayout/FullscreenOverlayShell"
import { getCommunityPath } from "@/shared/utils/navigation"
import VirtualBackgroundModal from "@/features/video-call/components/VirtualBackgroundModal"

import DeviceSettingsModal from "./DeviceSettingsModal"

const WaitingScreen = ({
  session,
  room,
  participantCount,
  localStream,
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
  const { t, language } = useLanguage()
  const { lang } = useParams()
  const effectiveParticipantCount = participantCount ?? participants.length
  const [isBgModalOpen, setIsBgModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success(t?.rooms?.waitingScreen?.linkCopied || "Link copied!")
  }

  return (
    <FullscreenOverlayShell
      backgroundImageUrl={room?.thumbnailUrl || meetingFallbackImage}
      onBack={() => navigate(getCommunityPath(lang || language))}
      backLabel={t.rooms.waitingScreen.backToCommunity}
      maxWidthClass="max-w-[800px]"
    >
      <div className="text-center">
        <h4 className="mb-2 font-semibold text-2xl md:text-3xl">
          {session?.roomName || t.rooms.waitingScreen.readyToJoin}
        </h4>

        {(room?.requiredLevel || room?.topic) && (
          <div className="flex flex-wrap justify-center gap-2 mb-3 mt-2">
            {room?.requiredLevel && (
              <span className="rounded-full bg-cath-red-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                {room.requiredLevel}
              </span>
            )}
            {room?.topic &&
              room.topic.split(",").map((t_topic) => {
                const trimmed = t_topic.trim()
                return (
                  <span
                    key={trimmed}
                    className="rounded-full bg-cath-red-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                  >
                    {t.rooms.createRoom?.topics?.[trimmed.toLowerCase()] ||
                      trimmed}
                  </span>
                )
              })}
          </div>
        )}
      </div>

      <div className="flex w-full flex-col items-center justify-center gap-6 mb-6">
        <ParticipantsPreview
          participants={participants}
          participantCount={participantCount}
        />
        <VideoPreview
          user={user}
          localStream={localStream}
          micOn={micOn}
          cameraOn={cameraOn}
          onToggleMic={onToggleMic}
          onToggleCam={onToggleCam}
          onOpenBgModal={() => setIsBgModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
      </div>

      <div className="flex flex-col items-center gap-3 w-full max-w-[400px]">
        <div className="flex w-full flex-col sm:flex-row gap-3">
          <PillButton
            onClick={handleCopyLink}
            variant="secondary"
            startIcon={<Copy />}
            className="h-12 w-full sm:flex-1 shrink-0 bg-white border border-[e5e5e5] shadow-sm hover:bg-gray-50"
          >
            {t?.rooms?.waitingScreen?.copyLink || "Copy Link"}
          </PillButton>
          <PillButton
            onClick={onJoin}
            disabled={isFull}
            aria-disabled={isFull}
            title={isFull ? t.rooms.waitingScreen.roomFull : undefined}
            className="h-12 w-full sm:flex-1 shrink-0"
          >
            {t.rooms.waitingScreen.joinNow}
          </PillButton>
        </div>

        {isFull && (
          <p className="text-sm text-red-600">
            {t.rooms.waitingScreen.roomFull} ({effectiveParticipantCount}/
            {maxParticipants})
          </p>
        )}

        <p className="text-sm text-gray-500">
          {t.rooms.waitingScreen.joinedAs}{" "}
          <span className="font-medium text-gray-900">{user?.username}</span>
        </p>
      </div>

      <VirtualBackgroundModal
        open={isBgModalOpen}
        onClose={() => setIsBgModalOpen(false)}
        localStream={localStream}
        cameraOn={cameraOn}
        onToggleCam={onToggleCam}
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
