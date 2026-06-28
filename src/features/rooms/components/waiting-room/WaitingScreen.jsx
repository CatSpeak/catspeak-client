import React, { useState, useEffect, useRef } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Copy, Mic, Video, Volume2, Info, Check, X, Edit2 } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import ParticipantsPreview from "./ParticipantsPreview"
import VideoPreview from "./VideoPreview"
import { useLanguage } from "@/shared/context/LanguageContext"
import meetingFallbackImage from "@/shared/assets/images/LogoDefault.png"
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
      maxWidthClass="max-w-[800px]"
      cardClassName="sm:max-h-[580px] rounded-[12px] h-auto"
    >
      <div className="text-center">
        <h4 className="mb-2 font-semibold text-xl md:text-2xl">
          {session?.roomName || t.rooms.waitingScreen.readyToJoin}
        </h4>

        {(room?.requiredLevel || room?.topic) && (
          <div className="flex flex-wrap justify-center gap-[11px] mb-3 mt-2">
            {room?.requiredLevel && (
              <span className="rounded-lg bg-cath-red-700 px-[15px] py-2.5 text-[14px] font-bold uppercase tracking-wider leading-none text-white">
                {room.requiredLevel}
              </span>
            )}
            {room?.topic &&
              room.topic.split(",").map((t_topic) => {
                const trimmed = t_topic.trim()
                return (
                  <span
                    key={trimmed}
                    className="rounded-lg bg-cath-red-700 px-[15px] py-2.5 text-[14px] font-bold  tracking-wider leading-none text-white"
                  >
                    {t.rooms.createRoom?.topics?.[trimmed.toLowerCase()] ||
                      trimmed}
                  </span>
                )
              })}
          </div>
        )}
      </div>

      <div className="flex w-full flex-col items-center justify-center gap-4 mb-4">
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
        <div className="flex w-full flex-col sm:flex-row sm:gap-[25px] gap-4">
          <PillButton
            onClick={handleCopyLink}
            variant="secondary"
            startIcon={<Copy />}
            className="h-12 w-full sm:flex-1 shrink-0 bg-white border border-[#e5e5e5] shadow-sm hover:bg-gray-50 py-2 px-4 text-[18px] rounded-[35px] text-[#7B7979]"
          >
            {t?.rooms?.waitingScreen?.copyLink || "Copy Link"}
          </PillButton>
          <PillButton
            onClick={onJoin}
            disabled={isFull}
            aria-disabled={isFull}
            title={isFull ? t.rooms.waitingScreen.roomFull : undefined}
            className="h-12 w-full sm:flex-1 shrink-0 py-2 px-4 text-[18px] rounded-[35px] text-[#F5F5F5]"
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

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <p>
            {t?.rooms?.waitingScreen?.joinedAsNickname || "Joined as nickname"}:{" "}
            <span className="font-medium text-gray-900">
              {user?.nickname || user?.username}
            </span>
          </p>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => {
              setIsEditingName(true)
            }}
            className="flex items-center gap-1 text-cath-red-600 hover:text-cath-red-700 font-medium transition-colors"
          >
            <Edit2 size={14} />
            {t?.rooms?.waitingScreen?.editName || "Edit Name"}
          </button>
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
